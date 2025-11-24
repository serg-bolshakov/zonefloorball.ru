<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentItem extends Model
{
    use HasFactory;

    protected $table = 'document_items';

    protected $fillable = [
        'uuid',
        'document_id',
        'product_id',
        'quantity',
        'price',
        'total',
        'unit_id',
        'comment',
        'sort_order'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'float', // ✅ целые рубли!
        'total' => 'float', // ✅ целые рубли!
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
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

    // Accessors
    public function getUnitNameAttribute(): string
    {
        return $this->unit->unit_prod_value_view ?? 'шт';
    }

    public function getProductNameAttribute(): string
    {
        return $this->product->title ?? 'Неизвестный товар';
    }

    public function getProductArticleAttribute(): string
    {
        return $this->product->article ?? '';
    }

    // Automatic total calculation
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($item) {
            $item->total = $item->quantity * $item->price;
        });
    }
}
