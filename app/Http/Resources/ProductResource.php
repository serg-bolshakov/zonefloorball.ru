<?php
// app/Http/Resources/ProductResource.php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */

    public function toArray(Request $request): array {
        \Log::debug('expected_receipt_date:', ['request' => $this->productReport->expected_receipt_date ?? null]);
       
        $user = Auth::user() ?? null;
        // \Log::debug('ProductResource validated:', ['headers' => $request->headers->all(), '$userssss' => $user]);
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
            'quantity'              =>  $this->quantity ?? null,
        ];
        
        // если пользователь авторизован посчитаем его скидки и добавим в ответ:
        if (!empty($user)) {
            \Log::debug('ProductResources toArray', ['$user Debug' => $user]);
            $data = array_merge($data, $this->calculateDiscounts($user));
        }

        \Log::debug('ProductResources toArray', ['$newdata' => $data]);

        return $data;      
    }

    protected function calculateDiscounts(?User $user): array {
        
        // Инициализация значений по умолчанию
        $discountData = [
            'price_with_rank_discount' => null,
            'price_with_action_discount' => null,
            'percent_of_rank_discount' => null,
            'summa_of_action_discount' => null,
            'price_special' => null,
            'date_end' => $this->actualPrice->date_end ?? null,
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
                $discountData['price_with_action_discount'] = $actualPrice;
            }
        }

        if($actualPrice < $regularPrice) {
            $discountData['price_special'] = $actualPrice;
            $discountData['date_end']      = $actualPriceDateEnd;
        }

        return $discountData;
    }
    
}
