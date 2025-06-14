<?php

    namespace App\Services;

    use App\Models\Order;
    use App\Models\Discount;
    use App\Models\AppliedDiscount;

    use App\Models\User;
    use Illuminate\Support\Facades\Auth; // Получение аутентифицированного пользователя

    class DiscountService {

        public function logExistingDiscounts(Order $order): void {
            
            if (Auth::check()) { $user = Auth::user(); }
            
            foreach ($order->items as $item) {
                if ($item->price < $item->regular_price) {
                    
                    $discount_id = 1;
                    $target_type = 'product';
                    $target_id = $item->id;

                    // Если покупатель авторизован и скидка согласно рангу превысила скидку по специальной цене, то:
                    if ($item->price_with_rank_discount > 0) {
                        $user ?? $discount_id = Discount::where('client_rank_id', $user->client_rank_id)->value('id');
                        $target_type = 'client_rank';
                    }

                    $discountValue = $item->regular_price - $item->price;

                    AppliedDiscount::create([
                        'order_id' => $order->id,
                        'order_item_id' => $item->id,
                        'discount_id' => $discount_id,                  // Пока неизвестно
                        'target_type' => $target_type,                  // 'product', 'category', 'client_rank'
                        'target_id'   => $target_id,                    // ID объекта
                        'discount_amount' => $discountValue * $item->quantity,
                        'original_amount' => $item->regular_price * $item->quantity
                    ]);
                }
            }
        }

        public function logDiscount(Order $order, Discount $discount, ?OrderItem $item = null): void {
            AppliedDiscount::create([
                'order_id' => $order->id,
                'order_item_id' => $item?->id,
                'discount_id' => $discount->id,
                'target_type' => $discount->target_type,
                'target_id' => $discount->target_id,
                'discount_amount' => $this->calculateDiscountValue($item ?? $order, $discount),
                'original_amount' => $item ? $item->regular_price * $item->quantity : $order->total
            ]);
        }

        // Применяет все возможные скидки к заказу 
        public function applyToOrder(Order $order): void {
            // 1. Скидки на отдельные товары
            foreach ($order->items as $item) {
                $this->applyItemDiscount($item);
            }

            // 2. Глобальные скидки на весь заказ
            $this->applyGlobalDiscount($order);
        }
        
        // Применяет лучшую доступную скидку для товара
        protected function applyItemDiscount(OrderItem $item): void {
            $discount = $this->findBestDiscountForItem($item);

            if ($discount) {
                $discountValue = $this->calculateDiscount(
                    $item->regular_price,
                    $discount
                );

                $item->update([
                    'price' => $item->regular_price - $discountValue,
                    'discount_value' => $discountValue
                ]);

                // Логируем
                DiscountLogger::log($item->order, [
                    'order_item_id' => $item->id,
                    'discount_id' => $discount->id,
                    'applied_value' => $discountValue * $item->quantity,
                    'type' => $discount->discount_type,
                    'original_amount' => $item->regular_price * $item->quantity
                ]);
            }
        }

        // Ищет лучшую скидку для товара
        protected function findBestDiscountForItem(OrderItem $item): ?Discount {
            return Discount::where('is_active', true)
                ->where(function($query) use ($item) {
                    // Скидки на конкретный товар
                    $query->where([
                        'target_type' => 'product',
                        'target_id' => $item->product_id
                    ])
                    // ИЛИ скидки на категорию товара
                    ->orWhere([
                        'target_type' => 'category',
                        'target_id' => $item->product->category_id
                    ]);
                })
                ->orderBy('priority', 'desc')
                ->first();
        }

        // Применяет глобальную скидку на заказ
        protected function applyGlobalDiscount(Order $order): void {
            $discount = $this->findGlobalDiscount($order);

            if ($discount) {
                $discountValue = $this->calculateDiscount(
                    $order->total,
                    $discount
                );

                $order->update([
                    'total_discount' => $discountValue,
                    'final_total' => $order->total - $discountValue
                ]);

                DiscountLogger::log($order, [
                    'discount_id' => $discount->id,
                    'applied_value' => $discountValue,
                    'type' => $discount->discount_type,
                    'original_amount' => $order->total
                ]);
            }
        }

        // Вычисляет сумму скидки
        protected function calculateDiscount(float $amount, Discount $discount): float {
            return match($discount->discount_type) {
                'percent' => $amount * ($discount->value / 100),
                'fixed' => min($discount->value, $amount),
                default => 0
            };
        }

    }

    /* Как это должно работать... но пока не работает... :) оставил "до лучших времён"
        Для товаров:
            Ищет скидки типа product или category
            Вычисляет скидку для каждой позиции
            Обновляет цену в order_items
        
        Для заказа: 
            Ищет скидки типа order_total или client_rank
            Применяет к итоговой сумме
            
        Логирование: 
            Фиксирует каждое применение скидки
            Хранит исходные суммы
    */