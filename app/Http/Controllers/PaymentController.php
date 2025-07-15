<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

use App\Enums\OrderStatus;                  
use App\Enums\PaymentMethod;

class PaymentController extends Controller
{
    public function handleResult(Request $request)
    {

        \Log::debug('PaymentController handleResult', [ '$request' => $request->all()]);

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

        // 3. Проверка подписи
        $signature = strtoupper(md5("{$validated['OutSum']}:{$validated['InvId']}:{$password2}"));

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
        try {
            DB::transaction(function () use ($validated) {
                $order = Order::lockForUpdate()->find($validated['InvId']);
                
                if (!$order) {
                    throw new \Exception("Order {$validated['InvId']} not found");
                }


                if ($order->payment_status === 'paid') {
                    \Log::info("Order {$order->id} already paid");
                    return;
                }

                if (abs($order->total - $validated['OutSum']) > 0.01) {
                    throw new \Exception("Amount mismatch: expected {$order->total}, got {$validated['OutSum']}");
                }
                
                // Обновляем поле заказа payment_status в таблице orders
                $order->addPaymentDetails([
                    'payment_url_expires_at'    => now()->toDateTimeString(),
                    'paid_at'                   => now()->toDateTimeString(),
                    'amount'                    => (float)$validated['OutSum'],
                    'currency'                  => 'RUB',
                    'gateway'                   => 'robokassa',
                    'transaction_id'            => $validated['InvId'],
                    // Поля для будущего дополнения:
                    'receipt_url'               => null, // Пока оставляем null
                    'metadata' => [
                        'test_mode' => $testMode
                    ]
                ]);  // метод описан в модели Order
                
                $order->update([
                    'payment_status'            => PaymentMethod::PAID->value,
                    'invoice_url_expired_at'    => now(),
                    'status_id'                 => OrderStatus::CONFIRMED->value,
                ]);
            });

            // 5. Логирование успеха
            \Log::info("Order {$validated['InvId']} processed", [
                'amount' => $validated['OutSum'],
                'mode' => $testMode ? 'test' : 'production'
            ]);

            // 6. Освобождаем резерв товаров и Логируем резерв
            $order->items()->each(function($item) {
                try {
                    $productReport = ProductReport::where('product_id', $item['id'])
                        ->lockForUpdate() // Решает проблему "гонки"
                        ->first();
                    
                    if (!$productReport) { throw new \Exception("Товар ID: {$item['id']} не найден в отчётах по остаткам"); }
                    $productReport->update([
                        'reserved'  => (int)$productReport->reserved - (int)$item['quantity'],
                    ]);

                    $productReservation = ProductReservation::where('product_id', $item['id'])->where('order_id', $validated['InvId'])
                        ->lockForUpdate() 
                        ->first();
                    if (!$productReservation) { throw new \Exception("Товар ID: {$item['id']} не найден в отчётах по резервированию"); }
                    $productReservation->update([
                        'paid_at' => now()->toDateTimeString(),
                    ]);

                } catch (\Exception $e) {
                    Log::error("Ошибка снятия товара с резерва", [
                        'product_id' => $item['id'],
                        'error' => $e->getMessage()
                    ]);
                    throw $e; // Пробрасываем выше для отката транзакции
                }
            });

            return response("OK{$validated['InvId']}\n", 200)
                ->header('Content-Type', 'text/plain');

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