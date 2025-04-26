<?php
// app/Models/WarehouseAddress.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WarehouseAddress extends Model {
    use HasFactory;

    public function warehouses() {
        // один ко многим (один адрес → много складов), если адрес физически один:
        return $this->hasMany(Warehouse::class);
    }
}