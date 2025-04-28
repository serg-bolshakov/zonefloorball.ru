<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transport extends Model
{
    use HasFactory;

    protected $casts = [
            'base_price' => 'float',
            'is_active' => 'boolean'
        ];
        
        public function warehouses() {
            return $this->belongsToMany(Warehouse::class);
        }
    
}