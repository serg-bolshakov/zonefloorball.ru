<?php
// app/Enums/PaymentStatus.php
namespace App\Enums;

enum PaymentStatus: string {
    case PENDING = 'pending';
    case PARTIALLY_PAID = 'partially_paid';
    case PAID = 'paid';
    case FAILED = 'failed';
    case PARTIALLY_REFUNDED = 'partially_refunded';
    case REFUNDED = 'refunded';
    
    public function label(): string {
        return match($this) {
            self::PENDING => 'Ожидает оплаты',
            self::PARTIALLY_PAID => 'Частично оплачен',
            self::PAID => 'Оплачен',
            self::FAILED => 'Ошибка оплаты',
            self::PARTIALLY_REFUNDED => 'Частичный возврат',
            self::REFUNDED => 'Возврат'
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