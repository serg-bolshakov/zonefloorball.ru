<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductStatus extends Model {
    use HasFactory;

    const ACTIVE = 1;           // Активный товар
    const ARCHIEVED = 2;        // Архивированный
    const DRAFT = 3;            // Черновик (незавершённое создание)
    

    # сделаем метод для получения товаров данного статуса:
    public function products() {
        return $this->hasMany(Product::class);
    }

}