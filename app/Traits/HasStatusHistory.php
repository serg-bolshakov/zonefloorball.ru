<?php
// app/Traits/HasStatusHistory.php
namespace App\Traits;
// use App\Models\OrderStatusHistory;
// use App\Models\Order;

trait HasStatusHistory {

    /**
     * Логирует изменение статуса заказа.
     *
     * @param int $oldStatus - предыдущий статус (например, OrderStatus::PENDING->value)
     * @param int $newStatus - новый статус (например, OrderStatus::CREATED->value)
     * @param string|null $comment - комментарий (опционально)
     */

    public function logStatusChange(int $oldStatus, int $newStatus, ?string $comment = null): void {

        $this->statusHistory()->create([
            'order_id'    => $this->id,                 // В трейте $this будет ссылаться на экземпляр модели, которая использует этот трейт...
            'old_status'  => $oldStatus,
            'new_status'  => $newStatus,
            'comment'     => $comment ?? "Статус изменён с {$oldStatus} на {$newStatus}"
        ]);

    }
}