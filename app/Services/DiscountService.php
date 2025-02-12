<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Discount;
use App\Models\User;

use App\Traits\OrderHelperTrait;

// каласс описывает логику применения скидок

class DiscountService
{
    use OrderHelperTrait;
    public function applyDiscount(Order $order, User $user)
    {
        $orderId = $order->id;
        $items = $order->order_content;
        
        $productsArr = $this->getProductsArrayFromQuerySrting($items);

        foreach($productsArr as $product) {
            
            $prodId = $product[0];
            $prodQuantity = $product[1];
            $prodActualPrice = $product[2];
            $discountId = $product[3];
            $appliedDiscountValue = $product[4];
            $prodPriceRegular = $product[5];

            // если есть применённая скидка, то логируем в таблице applied_discounts:
            if(!empty($discountId) && $discountId > 0 && !empty($appliedDiscountValue) && $appliedDiscountValue > 0) {
                // Логирование применённой скидки
                $order->appliedDiscounts()->create([                    // appliedDiscounts - добавлен в модели Order: return $this->hasMany(AppliedDiscount::class);
                    'order_id'  => $orderId,
                    'discount_id' => $discountId,
                    'product_id' => $prodId,  
                    'product_quantity' => $prodQuantity,
                    'product_price_for_payment' => $prodActualPrice,
                    'applied_value' => $appliedDiscountValue,
                    'product_price_regular' => $prodPriceRegular,
                ]);
            }
        }
    } 

    /*
        public function applyDiscounts(Order $order, User $user, array $items)
        {
            
            $discounts = $this->getApplicableDiscounts($order->total, $user->client_rank_id, $items);

            foreach ($discounts as $discount) {
                $this->applyDiscount($order, $discount);
            }
        } 
       
        protected function getApplicableDiscounts($orderTotal, $clientRankId, $items)
        {
            // Логика получения скидок
            return Discount::where(function ($query) use ($orderTotal, $clientRankId) {
                    $query->where('target_type', 'order_total')
                        ->where('min_order_amount', '<=', $orderTotal);
                })
                ->orWhere(function ($query) use ($clientRankId) {
                    $query->where('target_type', 'client_rank')
                        ->where('target_id', $clientRankId);
                })
                ->where('is_active', true)
                ->get();
        }

        protected function applyDiscount(Order $order, Discount $discount)
        {
            // Логика применения скидки
            if ($discount->discount_type === 'percent') {
                $discountValue = $order->total * ($discount->value / 100);
            } else {
                $discountValue = $discount->value;
            }

            $order->total -= $discountValue;
            $order->save();

            // Логирование применённой скидки
            $order->appliedDiscounts()->create([
                'discount_id' => $discount->id,
                'applied_value' => $discountValue,
            ]);
        }
    */
}