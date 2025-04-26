<?php
// app/Models/Warehouse.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model {
    use HasFactory;

    protected $casts = [
        'metadata' => 'array'
    ];

    public function address() {
        return $this->belongsTo(WarehouseAddress::class);
    }

}