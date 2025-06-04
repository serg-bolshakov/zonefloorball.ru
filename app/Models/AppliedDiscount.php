<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppliedDiscount extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'order_id',
        'discount_id', // Добавьте это поле
        'product_id',  // Если добавили это поле
        'product_quantity',
        'product_price_for_payment',
        'applied_value',
        'product_price_regular',
        'created_at',
        'updated_at,'
    ];
}
