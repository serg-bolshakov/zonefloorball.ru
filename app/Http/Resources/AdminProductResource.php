<?php
// app/Http/Resources/AdminProductResource.php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AdminProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */

    public function toArray(Request $request): array {
        /* \Log::debug('AdminProductResource RAW DATA:', [
            'all_data' => $this->resource->toArray($request), // Все данные модели
            'special_price_from_query' => $this->special_price, // Прямо из подзапроса
            'has_specialPrice_relation' => isset($this->specialPrice), // Есть ли отношение
        ]); */

        $specialPrice = $this->adminSpecialPrice;
        
        // Будущие запланированный акции
        $futurePrices = $this->adminSpecialPrices()
            ->where('date_start', '>', now())
            ->get();

       
        $data = [
            'id'                            => $this->id,
            'title'                         => $this->title,
            'article'                       => $this->article,
            'prod_url_semantic'             => $this->prod_url_semantic,
            'img_link'                      => $this->productShowCaseImage->img_link,
            'category'                      => $this->category->category,
            'brand'                         => $this->brand->brand ?? null,
            'model'                         => $this->model ?? null,
            'marka'                         => $this->marka ?? null,
            'price_actual'                  => $this->actualPrice->price_value ?? null,
            // Текущая/ближайшая специальная цена передаём на фронт, таблицу товаров для админа как типизировано: special_price_current?: IPrice;
            'special_price_current' => $specialPrice ? [
                'product_id'    => $specialPrice->product_id,
                'price_type_id' => $specialPrice->price_type_id, // 3 - TYPE_SPECIAL
                'price_value'   => $specialPrice->price_value,
                'date_start'    => $specialPrice->date_start,
                'date_end'      => $specialPrice->date_end,
                'status'        => $this->getPriceStatus($specialPrice),
            ] : null, 
            
            'price_special'                 => $this->special_price,
            
            // Будущие запланированные акции
            'future_special_prices' => $futurePrices->map(function ($price) {
                return [
                    'value' => $price->price_value,
                    'date_start' => $price->date_start,
                    'date_end' => $price->date_end,
                    'status' => 'scheduled', // запланирована
                ];
            }),
            'special_price_date_start'      => $this->special_price_date_start ?? null,
            'special_price_date_end'        => $this->special_price_date_end ?? null,
            'price_regular'                 => $this->regular_price ?? null,
            'price_preorder'                => $this->preorder_price ?? null,
            'preorder_price_date_start'     => $this->preorder_price_date_start ?? null,
            'preorder_price_date_end'       => $this->preorder_price_date_end ?? null,
            'prod_status'                   => $this->product_status_id,
            'on_sale'                       => $this->productReport->on_sale ?? null,
            'in_stock'                      => $this->productReport->in_stock ?? null,
            'reserved'                      => $this->productReport->reserved ?? null,
            'coming_soon'                   => $this->productReport->coming_soon ?? null,
            'expected_receipt_date'         => $this->productReport->expected_receipt_date ?? null, 
            'on_preorder'                   => $this->productReport->on_preorder ?? null,
            'preodered'                     => $this->productReport->preodered ?? null,
            'quantity'                      => $this->quantity ?? null,
        ];
        
        // \Log::debug('ProductResources toArray data', ['$newdata' => $data]);

        return $data;      
    }    

    protected function getPriceStatus($price): string {
        if ($price->date_start > now()) return 'scheduled';
        if ($price->date_end && $price->date_end < now()) return 'expired';
        if (!$price->date_end || $price->date_end > now()) return 'active';
        return 'unknown';
    }
}
