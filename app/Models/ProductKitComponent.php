<?php
// app/Models/ProductKitComponent.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductKitComponent extends Model
{
    use HasFactory;

    protected $table = 'product_kit_components';

    protected $fillable = [
        'product_id',
        'component_id', 
        'quantity'
    ];

    protected $casts = [
        'quantity' => 'integer'
    ];

    // Собираемый товар
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    // Комплектующая
    public function component(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'component_id');
    }

    // Проверка доступности комплектующих
    public function isAvailable(int $multiplier = 1): bool
    {
        $requiredQuantity = $this->quantity * $multiplier;
        
        // Используем отношение - productReport
        $componentReport = $this->component->productReport;
        
        return $componentReport && $componentReport->in_stock >= $requiredQuantity;
    }

    // Получить себестоимость комплектующей
    public function getComponentCost(int $multiplier = 1): float
    {
        return $this->component->current_cost_price * $this->quantity * $multiplier;
    }

    // Метод для получения недостающего количества
    public function getMissingQuantity(int $multiplier = 1): float
    {
        $requiredQuantity = $this->quantity * $multiplier;
        $componentReport = $this->component->productReport;
        
        if (!$componentReport) {
            return $requiredQuantity;
        }
        
        return max(0, $requiredQuantity - $componentReport->in_stock);
    }
}
