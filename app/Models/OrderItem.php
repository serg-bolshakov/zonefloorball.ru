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
        'is_preorder',
        'expected_delivery_date',
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

    /* Получить данные по остаткам на продукт ЧЕРЕЗ продукт */
        /*public function productReport() {
            return $this->hasOneThrough(
                ProductReport::class,
                Product::class,
                'id', // Ключ в промежуточной таблице (products)
                'product_id', // Ключ в конечной таблице (product_reports)
                'product_id', // Локальный ключ в order_items
                'id' // Ключ в промежуточной таблице (products)
            );
        }*/

    // ИЛИ более простой вариант - через продукт:
    public function productReport() {
        return $this->hasOne(ProductReport::class, 'product_id', 'product_id');
    }

}
