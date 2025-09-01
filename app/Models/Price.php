<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Price extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'price_type_id', 
        'price_value',
        'date_start',
        'date_end',
        'author_id'
    ];    

    protected $casts = [
        'price_value' => 'float',
        'date_start' => 'date',
        'date_end' => 'date',
    ];

    /**
     * Отношение к товару
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Отношение к типу цены
     */
    public function priceType(): BelongsTo
    {
        return $this->belongsTo(PriceType::class);
    }

    /**
     * Отношение к автору (пользователю)
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Scope для актуальных цен
     */
    public function scopeActual($query)
    {
        return $query->where(function($q) {
            $q->whereNull('date_start')
              ->orWhere('date_start', '<=', now());
        })->where(function($q) {
            $q->whereNull('date_end')
              ->orWhere('date_end', '>=', now());
        });
    }

    /**
     * Проверка, активна ли цена в данный момент
     */
    public function isActive(): bool
    {
        $now = now();
        
        if ($this->date_start && $this->date_start > $now) {
            return false;
        }
        
        if ($this->date_end && $this->date_end < $now) {
            return false;
        }
        
        return true;
    }
}

