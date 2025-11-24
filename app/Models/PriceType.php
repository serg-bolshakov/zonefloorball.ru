<?php
// app/Models/PriceType.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceType extends Model
{
    use HasFactory;

    protected $table = 'price_types';
    
    protected $fillable = [
        'price_type',
        'comment'
    ];

    public $timestamps = false; // нет created_at/updated_at

    // Отношения
    public function prices()
    {
        return $this->hasMany(Price::class, 'price_type_id');
    }

    // Scopes
    public function scopeCostType($query)
    {
        return $query->where('price_type', 'price_cost');
    }

    public function scopeSaleTypes($query)
    {
        return $query->whereIn('price_type', [
            'price_regular', 
            'price_special', 
            'price_preorder'
        ]);
    }

    // Accessors
    public function getDisplayNameAttribute(): string
    {
        return match($this->price_type) {
            'price_income' => 'Закупочная цена',
            'price_regular' => 'Регулярная цена',
            'price_special' => 'Специальная цена', 
            'price_preorder' => 'Цена предзаказа',
            'price_cost' => 'Себестоимость',
            default => $this->price_type
        };
    }

    public function isCostType(): bool
    {
        return $this->price_type === 'price_cost';
    }

    public function isIncomeType(): bool
    {
        return $this->price_type === 'price_income';
    }
}