<?php
// app/Http/Resources/ProductResource.php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

use App\Models\User;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array {
        \Log::debug('ProductResource processing', ['id' => $this->id]);
        //dd($this->resource); // Убедитесь, что модель передаётся
        // Получаем пользователя из запроса (уже авторизованного... или NULL):
        $user = $request->user();
                
        // Логика скидок (вынесли в отдельный метод)
        $discountData = $this->calculateDiscounts($user); 
        \Log::debug('Discount data:', $discountData); // Проверим, что здесь есть данные
        $data = [
            'id' => $this->id,
            'title' => $this->title,
            'article' => $this->article,
            'prod_url_semantic' => $this->prod_url_semantic,
            'img_link' => $this->productShowCaseImage->img_link,
            'category' => $this->category->category,
            'brand' => $this->brand->brand ?? null,
            'model'=> $this->model ?? null,
            'marka' => $this->marka ?? null,
            'price_actual' => $this->actualPrice->price_value ?? null,
            'price_regular' => $this->regularPrice->price_value ?? null,
            'prod_status' => $this->product_status_id,
            'on_sale'               =>  $this->productReport->on_sale ?? null,
            'in_stock'              =>  $this->productReport->in_stock ?? null,
            'reserved'              =>  $this->productReport->reserved ?? null,
            'coming_soon'           =>  $this->productReport->coming_soon ?? null,
            'expected_receipt_date' =>  $this->productReport->expected_receipt_date ?? null, 
            'on_preorder'           =>  $this->productReport->on_preorder ?? null,
            'preodered'             =>  $this->productReport->preodered ?? null,
        ];

        if ($request->user()) {
            $data = array_merge($data, $this->calculateDiscounts($request->user()));
        }
        // dd($data);
        return $data;
      
    }

    // Проверка скидок: пока для информации пишу этот метод (не использую, но подумаю как это можно будет использовать): 
    public static function hasAnyDiscounts($collection): bool {
        foreach ($collection as $product) {
            if ($product->actualPrice->price_value < $product->regularPrice->price_value) {
                return true;
            }
        }
        return false;
    }

    /** Затем в Collection:
     *  
     * public function toArray(Request $request): array {
     *     return [
     *         'products' => ProductResource::collection($this->collection), 
     *         'has_discounts' => ProductResource::hasAnyDiscounts($this->collection)
     *     ]; 
     * }
    */
    
    protected function calculateDiscounts(?User $user): array {
        
        // Инициализация значений по умолчанию
        $discountData = [
            'price_with_rank_discount' => null,
            'price_with_action_discount' => null,
            'percent_of_rank_discount' => null,
            'summa_of_action_discount' => null,
            'price_special' => null,
            'date_end' => $this->actualPrice->date_end ?? null
        ];
        
        if (!$user) {
            return $discountData;
        }
        
        $rankDiscountPercent = $user->rank?->price_discount ?? 0;
        $actualPrice = $this->actualPrice->price_value ?? null;
        $actualPriceDateEnd = $this->actualPrice->date_end ?? null;
        $regularPrice = $this->regularPrice->price_value ?? null;

        if ($actualPrice === $regularPrice && $rankDiscountPercent > 0) {
            $discountData['price_with_rank_discount'] = round($regularPrice - ($regularPrice * ($rankDiscountPercent / 100))); 
            $discountData['percent_of_rank_discount'] = $rankDiscountPercent;
        } elseif ($actualPrice < $regularPrice) {
            // если есть специальная цена, нужно посмотреть какая цена меньше, ту и показываем => скидки не суммируем
            $possiblePriceWithDiscount = round($regularPrice - ($regularPrice * ($rankDiscountPercent / 100)));
            if($possiblePriceWithDiscount < $actualPrice) {
                $result['price_with_rank_discount'] = $possiblePriceWithDiscount;
                $discountData['percent_of_rank_discount'] = $rankDiscountPercent;
            } else {
                // выводим для покупателя его выгоду от покупки товара по цене со кидкой по акции:
                $discountData['summa_of_action_discount'] = $regularPrice - $actualPrice;
            }
        }

        if($actualPrice < $regularPrice) {
            $discountData['price_special'] = $actualPrice;
            $discountData['date_end']      = $actualPriceDateEnd;
        }

        return $discountData;
    }

    private function enrichProductData(Product $product, ?User $user) {
        dd($product);
        $data = [
            'id' => $product->id,
            'title' => $product->title,
            'prod_url_semantic' => $product->prod_url_semantic,
            'img_link' => $product->productShowCaseImage->img_link,
            'on_sale' => $product->productReport->on_sale,
            'article' => $product->article,
            'price_actual' => $product->actualPrice->price_value  ?? NULL,
            'price_regular' => $product->regularPrice->price_value  ?? NULL,
        ];

        if($user) {
            $data = array_merge($data, $this->calculateDiscount($product, $user));
        }

        return $data;
    }

    private function calculateDiscount(Product $product, User $user) {
        $discountData = [];
        $rankDiscount = $user->rank->price_discount ?? 0;

        // Работаем с примененим системы скидок:
        $discountData['price_with_rank_discount'] = $discountData['percent_of_rank_discount'] = NULL;
        $discountData['price_with_action_discount'] = $discountData['summa_of_action_discount'] = NULL; // это скидки по "акциям"
        
        // если в избранное идёт регулярная цена (без скидки), подсчитаем цену со скидкой, в зависимости от ранга покупателя: 
        if($product->actualPrice->price_value == $product->regularPrice->price_value) {
            if($rankDiscountPercent > 0) {
                $discountData['price_with_rank_discount'] = round($product->regularPrice->price_value - ($product->regularPrice->price_value * ($rankDiscountPercent / 100))); 
                $discountData['percent_of_rank_discount'] = $rankDiscountPercent;
            }
        } elseif($product->actualPrice->price_value < $product->regularPrice->price_value) {
            // если есть специальная цена, нужно посмотреть какая цена меньше, ту и показываем => скидки не суммируем!
            $actualPrice = $product->actualPrice->price_value;
            $regularPrice = $product->regularPrice->price_value;
            $possiblePriceWithDiscount = round($regularPrice - ($regularPrice * ($rankDiscountPercent / 100)));
            if($possiblePriceWithDiscount < $actualPrice) {
                $discountData['price_with_rank_discount'] = $possiblePriceWithDiscount;
                $discountData['percent_of_rank_discount'] = $rankDiscountPercent;
            } else {
                // выводим для покупателя его выгоду от покупки товара по цене со кидкой по акции:
                $discountData['summa_of_action_discount'] = $regularPrice - $actualPrice;
            }
        }
        
        $discountData['date_end'] = NULL;
        if($product->actualPrice->price_value < $product->regularPrice->price_value) {
            $discountData['price_special'] = $product->actualPrice->price_value;
            $discountData['date_end'] = $product->actualPrice->date_end  ?? NULL;
        } else {
            $discountData['price_special'] = NULL;
        }

        return $discountData;
    }
}
