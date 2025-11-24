<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use HasFactory;

    const UPDATED_AT = null; // ✅ Отключаем ТОЛЬКО updated_at
    
    protected $table = 'stock_movements';

    protected $fillable = [
        'document_id',
        'product_id',
        'unit_id',
        'movement_type',
        'quantity',
        'stock_after_movement',
        'movement_date'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'stock_after_movement' => 'integer',
        'movement_date' => 'date',
        'created_at' => 'datetime',
    ];

    // Отношения
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class, 'document_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(ProductUnit::class, 'unit_id');
    }

    // Scopes
    public function scopeIncoming($query)
    {
        return $query->where('movement_type', 'in');
    }

    public function scopeOutgoing($query)
    {
        return $query->where('movement_type', 'out');
    }

    public function scopeInternal($query)
    {
        return $query->where('movement_type', 'inside');
    }

    public function scopeForProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('movement_date', [$startDate, $endDate]);
    }
}