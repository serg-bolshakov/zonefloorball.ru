<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    use HasFactory;

    # в модели с брендами сделаем метод для получения товаров :
    public function products() {
        return $this->hasMany(Product::class);
    }

    /* Получить бренды товаров категории для фильтров, в у которых есть товары в наличии (статус актив) или (при запросе) есть архивные товары. */
    public function getCategoryBrands($categoryId, $productStatusId = 1) {
        return $this->hasMany(Image::class)->where('img_promo', '=', 1);
    }

    /* Получить все категории для бренда. */
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'products');
    }


}
