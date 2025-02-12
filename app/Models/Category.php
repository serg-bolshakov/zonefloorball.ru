<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

# в модели с категориями сделаем метод для получения товаров :
//use App\Models\Product; 

class Category extends Model
{
    use HasFactory;
    
    # Иногда требуется постоянная загрузка некоторых отношений при извлечении модели. Для этого нужно определить свойство $with в модели...
    protected $with = ['products'];
    
    # в модели с категориями сделаем метод для получения товаров :
    public function products() {
        return $this->hasMany(Product::class);
    }

    /* Получить все бренды для категории. */
    public function brands()
    {
        return $this->belongsToMany(Brand::class, 'products');
    }
}