<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function handleResult(Request $request)
    {
        $password2 = "password_2"; // Пароль #2 из настроек Robokassa

        // Получаем данные от Robokassa
        $outSum = $request->input('OutSum');
        $invId = $request->input('InvId');
        $signatureValue = $request->input('SignatureValue');

        // Проверяем контрольную сумму
        $mySignatureValue = strtoupper(md5("$outSum:$invId:$password2"));

        if ($mySignatureValue === strtoupper($signatureValue)) {
            // Контрольные суммы совпали, оплата прошла успешно
            DB::transaction(function () use ($invId) {                  # Robokassa может отправить несколько уведомлений об оплате. Чтобы избежать дублирования обработки:
                $order = Order::lockForUpdate()->find($invId);          # Проверяем статус заказа перед его обновлением.
                if ($order && $order->status !== 'paid') {
                    $order->update(['status' => 'paid']);
                }
            });

            // Логируем успешное уведомление
            Log::info("Order $invId paid successfully.");

            // Отправляем ответ Robokassa
            return response("OK$invId", 200);
        } else {
            // Контрольные суммы не совпали
            Log::error("Invalid signature for order $invId.");
            return response("ERROR: Invalid signature", 400);
        }
    }
}