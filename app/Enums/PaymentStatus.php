<?php
// app/Enums/PaymentStatus.php
namespace App\Enums;

enum PaymentStatus: string {
    case PENDING = 'pending';
    case INITIATED = 'initiated';
    case PARTIALLY_PAID = 'partially_paid';
    case PAID = 'paid';
    case FAILED = 'failed';
    case PARTIALLY_REFUNDED = 'partially_refunded';
    case REFUNDED = 'refunded';
    case CANCELLED = 'cancelled';
    case NULLIFIED = 'nullified';
    
    public function label(): string {
        return match($this) {
            self::PENDING               => 'Ожидает оплаты',
            self::INITIATED             => 'Платёж инициирован',                // деньги от покупателя не получены. Или от пользователя ещё не поступила оплата по выставленному ему счёту или платёжная система, через которую пользователь совершает оплату, ещё не подтвердила факт оплаты.
            self::PARTIALLY_PAID        => 'Частично оплачен',
            self::PAID                  => 'Оплачен',
            self::FAILED                => 'Ошибка оплаты',                     // Отказ в зачислении средств на счёт магазина. Списанные средства вернулись покупателю на счёт (кошелёк), с которого производилась оплата. 
            self::PARTIALLY_REFUNDED    => 'Частичный возврат',
            self::REFUNDED              => 'Возврат',
            self::CANCELLED             => 'Отмена оплаты',                     // Операция отменена, деньги от покупателя не были получены. Оплата не была произведена. Покупатель отказался от оплаты или не совершил платеж, и операция отменилась по истечении времени ожидания. Либо платёж был совершён после истечения времени ожидания. 
            self::NULLIFIED             => 'Отмена счёта на оплату продацом'    // Операция, когда продавец решил отменить выставленный счёт с действительными сроками на оплату по непредвиденным обстоятельствам - закончился товар, например...
        };
    }

    public function isPaid(): bool {
        return in_array($this, [
            self::PAID,
            self::PARTIALLY_PAID,
            self::PARTIALLY_REFUNDED
        ]);
    }
}

// Методы enum:
// PaymentStatus::PENDING->value        // 'pending'
// PaymentStatus::PENDING->label()      // 'Ожидает оплаты'