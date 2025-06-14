<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        'order_item_id',
        'discount_id',
        'target_type',
        'target_id',
        'discount_amount',  // Общая сумма скидки (не за единицу!)
        'original_amount',  // Сумма до скидки
    ];

    // Связи
    public function order(): BelongsTo {
        return $this->belongsTo(Order::class);
    }

    public function orderItem(): BelongsTo {
        return $this->belongsTo(OrderItem::class);
    }

    public function discount(): BelongsTo {
        return $this->belongsTo(Discount::class);
    }
}
