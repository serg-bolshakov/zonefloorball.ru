<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    # Связь многие ко многим: каждое свойство принадлежит многим товарам (связываем через промежуточную таблицу связи product_property). Пропишем эту связь через отношение belongsToMany:
    public function products() {
        return $this->belongsToMany(Product::class);
    }

    /* Получить коллекции, которым принадлежит товар для карточки товара. */
    public function propCollection() {
        return $this->belongsToMany(Product::class)->where('prop_title', 'LIKE', 'collection');
    }

}
