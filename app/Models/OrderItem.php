<?php
// app/Models/OrderItem.php

/** Описывает одну позицию в заказе
 *  Содержит доп. информацию: количество, цену на момент заказа, скидки
 *  Связывает заказ (Order) и товар (Product)
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 
        'product_id',
        'quantity',
        'price',
        'regular_price',
    ];

    protected $casts = [
        'price' => 'float',
        'regular_price' => 'float',
    ];

    public function order() {
        return $this->belongsTo(Order::class);      // Каждая позиция принадлежит одному заказу
    }

    public function product() {
        return $this->belongsTo(Product::class);    // Каждая позиция ссылается на один товар
    }
}
