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
use App\Models\PendingPayment;

use App\Services\ErrorNotifierService;
use App\Mail\OrderInvoice;
use App\Mail\OrderReserve;
use Illuminate\Support\Facades\Mail;        // Чтобы отправить сообщение, используем метод to фасада Mail
use App\Models\User;

class PaymentController extends Controller
{
    public function handleResult(Request $request)
    {

        \Log::debug('PaymentController handleResult', ['$request' => $request->all()]);

        \Log::debug('PaymentController Auth check before', [
            'auth_id' => auth()->id(),
            'is_verified' => auth()->check() ? auth()->user()->hasVerifiedEmail() : 'guest',
            'cookies' => request()->cookies->all(),
            'session_id' => session()->getId()
        ]);

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
                DB::transaction(function () use ($validated, $request, &$order) {       // Передаём $order в транзакцию по ссылке // «Передаём по ссылке только то, что требует модификации»
                    $order = Order::lockForUpdate()->find($validated['InvId']);
                    
                    if (!$order) {
                        throw new \Exception("Order {$validated['InvId']} not found");
                    }
                    
                    // Проверка дублирования оплаты
                    if ($order->payment_status === 'paid') {
                        \Log::info("Order {$order->id} already paid");
                        return response("OK{$validated['InvId']}\n", 200);
                    }

                    \Log::debug('Transaction data', [
                        'request_data' => $request->all(),
                        'order_before' => $order?->id,
                        'validated' => $validated,
                    ]);

                    /* \Log::debug('Payment processing', [
                        'session_data' => [
                            'pending_order_exists' => session()->has('pending_order_email'),
                            'order_id_in_session' => session('pending_order_email.order_id'),
                            'session_keys' => array_keys(session()->all())
                        ],
                        'request' => [
                            'ip' => $request->ip(),
                            'user_agent' => $request->userAgent()
                        ]
                    ]); */

                    // Отправка письма только если:
                    // 1. Письмо еще не отправлено И
                    // 3. ID заказа совпадает

                    // Достаем данные из сессии, если письмо не было отправлено ранее: СЕССИИ НЕ РАБОТАЮТ!!!
                    /* if (!$order->is_client_informed && 
                        $request->session()->has('pending_order_email')) {
                        
                        $emailData = $request->session()->get('pending_order_email');

                        if ($emailData['order_id'] == $order->id) {
                            try {
                                // Двойная проверка перед отправкой
                                if (!$order->fresh()->is_client_informed) {
                                    Mail::to($order->email)
                                        ->bcc(config('mail.admin_email'))
                                        ->send(unserialize($emailData['mail_data']));

                                    $order->update([
                                        'is_client_informed' => true,
                                        // 'informed_at' => now() // Для аналитики
                                    ]);

                                    // Логируем успех
                                    \Log::info("Order confirmation sent", [
                                        'order_id'  => $order->id,
                                        'email'     => $order->email
                                    ]);
                                }

                            } catch (\Exception $e) {
                                \Log::error('Email sending failed', [
                                    'order_id' => $order->id,
                                    'error' => $e->getMessage(),
                                    'trace' => $e->getTraceAsString()
                                ]);
                                
                                // Не прерываем транзакцию из-за ошибки почты!
                            } finally {
                                // Всегда очищаем сессию
                                $request->session()->forget('pending_order_email');
                            }
                        }
                    }*/
                    
                    $pendingPayment = PendingPayment::where('order_id', $order->id)  // ← Используем $order->id вместо $validated
                                            ->lockForUpdate() 
                                            ->first();

                    \Log::debug('Payment processing', [
                        'order_id' => $order->id,
                        'pending_payment_exists' => $pendingPayment ? true : false,
                        'is_expired' => $pendingPayment?->isExpired(),
                        'email' => $order->email,
                        'is_informed' => $order->is_client_informed,
                        'if' => !$order->is_client_informed && !$pendingPayment->isExpired()
                    ]);

                    if (!$order->is_client_informed && !$pendingPayment->isExpired()) {
                        try {
                            // Двойная проверка перед отправкой
                            /*if (!$order->fresh()->is_client_informed) {
                                
                                \Log::debug('Payment processing after double checking', [
                                    'email' => $order->email,
                                    'is_informed' => $order->is_client_informed,
                                    'emai_data' => $pendingPayment->mail_data ?? null,
                                    'email_userialize' => unserialize($pendingPayment->mail_data) ?? null
                                ]);

                                // $mail = unserialize($pendingPayment->decrypted_mail_data);
                                $mail = unserialize($pendingPayment->mail_data);

                                \Log::debug('Email to be sent', [
                                    'email' => $mail ?? null,
                                ]);

                                Mail::to($order->email)
                                    ->bcc(config('mail.admin_email'))
                                    ->send($mail);

                                $order->update([
                                    'is_client_informed' => true,
                                    // 'informed_at' => now() // Для аналитики
                                ]);

                                // Логируем успех
                                \Log::info("Order confirmation sent", [
                                    'order_id'  => $order->id,
                                    'email'     => $order->email
                                ]);
                            } */

                            $user = User::find($order->order_client_id);

                            if($user) {
                                // 6.4 Пересоздаём экземпляр OrderReserve с обновлённым объектом $newOrder
                                    $orderMail = match ($user->client_type_id) {
                                        1 => new OrderReserve($order, $user),               // Для физических лиц делаем "Резерв"
                                        2 => new OrderInvoice($order, $user),               // Для юридических лиц формируем счёт
                                        default => new OrderReserve($order, $user)
                                    };

                                // 6.5 Генерируем и сохраняем PDF
                                    $orderMail->buildPdfAndSave($order->invoice_url);
                                    
                                // 6.6 Отправляем письмо    
                                    // Двойная проверка перед отправкой
                                    if (!$order->fresh()->is_client_informed) {
                                        Mail::to($order->email)
                                        ->bcc(config('mail.admin_email'))
                                        ->send($orderMail);

                                        $order->update([
                                            'is_client_informed' => true,
                                            // 'informed_at' => now() // Для аналитики
                                        ]);

                                        // Логируем успех
                                        \Log::info("Order confirmation sent", [
                                            'order_id'  => $order->id,
                                            'email'     => $order->email
                                        ]);
                                    }
                            }

                        } catch (\Exception $e) {
                            \Log::error('Email sending failed', [
                                'order_id' => $order->id,
                                'error' => $e->getMessage(),
                                'trace' => $e->getTraceAsString()
                            ]);
                            
                            // Не прерываем транзакцию из-за ошибки почты!
                        } finally {
                            // Всегда 
                            $pendingPayment->delete();
                        }
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
                    
                    // Основное обновление заказа
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
                            $productReport = ProductReport::where('product_id', $item['product_id'])
                                ->lockForUpdate() // Решает проблему "гонки"
                                ->first();
                            
                            if (!$productReport) { throw new \Exception("Товар ID: {$item['product_id']} не найден в отчётах по остаткам"); }
                            $productReport->update([
                                'reserved'  => (int)$productReport->reserved - (int)$item['quantity'],
                                'on_sale'   => (int)$productReport->on_sale + (int)$item['quantity']
                            ]);

                            $productReservation = ProductReservation::where('product_id', $item['product_id'])->where('order_id', $order->id)  // ← Используем $order->id вместо $validated
                                ->lockForUpdate() 
                                ->first();
                            if (!$productReservation) { throw new \Exception("Товар ID: {$item['product_id']} не найден в отчётах по резервированию"); }
                            $productReservation->update([
                                'paid_at' => now(),
                            ]);

                        } catch (\Exception $e) {
                            Log::error("Ошибка снятия товара с резерва", [
                                'order_id' => $order->id,  // Логируем ID заказа
                                'product_id' => $item['product_id'],
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

                ErrorNotifierService::notifyAdmin($e, [
                    'order_id' => $orderId ?? null,
                    'payment_system' => 'robokassa',
                    'stage' => 'PaymentController'
                ]);
                
                return response("ERROR: " . $e->getMessage() . "\n", 500);
            }
    }
}