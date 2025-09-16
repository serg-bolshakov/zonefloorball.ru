<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductReport extends Model
{
    use HasFactory;
    
        protected $fillable = [
            'product_id', 
            'in_stock',
            'on_sale',
            'reserved',
            'coming_soon',
            'expected_receipt_date',
            'on_preorder',
            'preordered'
        ];

        protected $casts = [
            'expected_receipt_date' => 'date:Y-m-d',
            'in_stock' => 'integer',
            'on_sale' => 'integer',
            'reserved' => 'integer',
            'on_preorder' => 'integer',
            'preordered' => 'integer'
        ];

        public function product() {
            return $this->belongsTo(Product::class);    // Каждая позиция ссылается на один товар
        }

        // Scope-методы для удобства
        public function scopeAvailable($query) {
            return $query->where('on_sale', '>', 0);
        }

        /* Пример использования: Получение доступных товаров
            $availableProducts = ProductReport::with('product')
                ->available()
                ->get();
        */

        public function scopeReserved($query) {
            return $query->where('reserved', '>', 0);
        }

        // Валидация в set-методах
        public function setOnSaleAttribute($value) {
            $this->attributes['on_sale'] = max(0, (int)$value);
        }
}