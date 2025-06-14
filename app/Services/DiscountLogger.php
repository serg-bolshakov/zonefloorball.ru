<?php
    // app/Services/DiscountLogger.php - Сервис логирования скидок
    namespace App\Services;

    use App\Models\AppliedDiscount;
    use App\Models\Order;
    use App\Models\OrderItem;

    class DiscountLogger
    {
        public static function logDiscount(Order $order, array $discountData): void
        {
            AppliedDiscount::create([
                'order_id' => $order->id,
                'order_item_id' => $discountData['order_item_id'] ?? null,
                'discount_id' => $discountData['discount_id'],
                'applied_value' => $discountData['applied_value'],
                'discount_type' => $discountData['type'],
                'original_amount' => $discountData['original_amount']
            ]);
        }
    }