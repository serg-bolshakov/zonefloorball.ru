<?php
// app/Http/Resources/ProductResource.php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Проверяем, что данные загружены
        // dd($this->resource);
        return [
            'id' => $this->id,
            'title' => $this->title,
            'prod_url_semantic' => $this->prod_url_semantic,
            'img_link' => $this->productShowCaseImage->img_link,
            'category' => $this->category->category,
            'brand' => $this->brand->brand ?? null,
            'model'=> $this->model ?? null,
            'marka' => $this->marka ?? null,
            'price_actual' => $this->actualPrice->price_value ?? null,
            'price_regular' => $this->regularPrice->price_value ?? null,
            'prod_status' => $this->product_status_id,
        ];
    }
}
