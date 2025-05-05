<?php

    namespace App\Enums;

    use Illuminate\Http\Request; 

    enum PaymentMethod: int {
        case ONLINE = 2;            // Оплата онлайн (картой)
        case BANK_TRANSFER = 4;     // Банковский перевод (для юрлиц: type === 'legal')
        
        public static function forRequest(Request $request): self {
            // Используем input() с точечной нотацией для вложенных полей
            $paymentMethod = $request->input('paymentMethod');
            $customerType = $request->input('customer.type'); // Ключевое изменение! 
            // Не $request->customer->type

            return ($paymentMethod === 'invoice' && $customerType === 'legal')
                ? self::BANK_TRANSFER
                : self::ONLINE;
        }
    }