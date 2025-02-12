<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Size extends Model
{
    use HasFactory;

    # в модели с размерами сделаем метод для получения товаров :
    public function products() {
        return $this->hasMany(Product::class);
    }
    
}
