<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

use App\Enums\OrderStatus;                  
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;

use App\Models\Order;
use App\Models\ProductReport;
use App\Models\ProductReservation;

class PaymentController extends Controller
{
    public function handleResult(Request $request)
    {

        \Log::debug('PaymentController handleResult', ['$request' => $request->all()]);

        \Log::debug('Robokassa Result URL Call', [
            'all_input' => $request->all(),
            'headers' => $request->headers->all()
        ]);

        // 1. Валидация входных данных
            $validated = $request->validate([
                'OutSum'            => 'required|numeric',
                'InvId'             => 'required|integer',
                'SignatureValue'    => 'required|string'
            ]);
            \Log::debug('PaymentController handleResult', ['$validated' => $validated]);

        // Проверяем подпись, обновляем статус заказа       
        // 2. Получаем параметры из конфига
            $password2 = Config::get('services.robokassa.password2');           // Пароль #2 из настроек Robokassa
            $testMode  = Config::get('services.robokassa.test_mode', false);
            \Log::debug('PaymentController handleResult', ['testMode' => $testMode]);
        // 3. Проверка подписи
            $signature = strtoupper(md5("{$validated['OutSum']}:{$validated['InvId']}:{$password2}"));
            \Log::debug('PaymentController handleResult expected signature', ['expected signature' => $signature]);

            if ($signature !== strtoupper($validated['SignatureValue'])) {
                Log::warning('Robokassa signature mismatch', [
                    'order_id'      => $validated['InvId'],
                    'received'      => $validated['SignatureValue'],
                    'calculated'    => $signature,
                    'ip'            => $request->ip()
                ]);
                return response("bad sign\n", 403);
            }

        // 4. Обработка платежа в транзакции
            $order = null; // Объявим переменную ДО транзакции, чтобы её не потерять в блоке try - catch
            try {
                DB::transaction(function () use ($validated, &$order) {       // Передаём $order в транзакцию по ссылке
                    $order = Order::lockForUpdate()->find($validated['InvId']);
                    
                    if (!$order) {
                        throw new \Exception("Order {$validated['InvId']} not found");
                    }

                    if ($order->payment_status === 'paid') {
                        \Log::info("Order {$order->id} already paid");
                        return response("OK{$validated['InvId']}\n", 200);
                    }

                    if (abs((float)$order->total_product_amount + (float)$order->order_delivery_cost - $validated['OutSum']) > 0.01) {
                        throw new \Exception("Amount mismatch: expected {(float)$order->total_product_amount + (float)$order->order_delivery_cost}, got {$validated['OutSum']}");
                    }
                    
                    // Обновление платежного статуса в таблице orders
                    $order->addPaymentDetails([
                        'payment_url_expires_at'    => now()->toDateTimeString(),
                        'paid_at'                   => now()->toDateTimeString(),
                        'amount'                    => (float)$validated['OutSum'],
                        'currency'                  => 'RUB',
                        'gateway'                   => 'robokassa',
                    ]);
                    
                    $order->update([
                        'payment_status'            => PaymentStatus::PAID->value,
                        'invoice_url_expired_at'    => now(),
                    ]);

                    // Логируем статус
                    $order->changeStatus(
                        newStatus: OrderStatus::IN_PROCESSING,
                        comment: 'Заказ оплачен. В обработке.'
                    );

                    // Освобождаем резерв товаров и Логируем резерв
                    $order->items()->each(function($item) use ($order) {        // Передаем $order в замыкание
                        \Log::info(" {$item}");
                        try {
                            // 1. Обновляем отчёт по остаткам
                            $productReport = ProductReport::where('product_id', $item['id'])
                                ->lockForUpdate() // Решает проблему "гонки"
                                ->first();
                            
                            if (!$productReport) { throw new \Exception("Товар ID: {$item['id']} не найден в отчётах по остаткам"); }
                            $productReport->update([
                                'reserved'  => (int)$productReport->reserved - (int)$item['quantity'],
                            ]);

                            $productReservation = ProductReservation::where('product_id', $item['id'])->where('order_id', $order->id)  // ← Используем $order->id вместо $validated
                                ->lockForUpdate() 
                                ->first();
                            if (!$productReservation) { throw new \Exception("Товар ID: {$item['id']} не найден в отчётах по резервированию"); }
                            $productReservation->update([
                                'paid_at' => now()->toDateTimeString(),
                            ]);

                        } catch (\Exception $e) {
                            Log::error("Ошибка снятия товара с резерва", [
                                'order_id' => $order->id,  // Логируем ID заказа
                                'product_id' => $item['id'],
                                'error' => $e->getMessage()
                            ]);
                            throw $e; // Пробрасываем выше для отката транзакции
                        }
                    });

                });

                return response("OK{$validated['InvId']}\n", 200);

            } catch (\Exception $e) {
                // 6. Обработка ошибок
                \Log::error("Payment processing failed: " . $e->getMessage(), [
                    'order_id' => $validated['InvId'],
                    'trace' => $e->getTraceAsString()
                ]);

                return response("ERROR: " . $e->getMessage() . "\n", 500);
            }
    }
}