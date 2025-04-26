<?php
// app/Http/Controllers/WarehouseController.php

namespace App\Http\Controllers;
use App\Models\Warehouse; 

class WarehouseController extends Controller {
    public function index()     {
        return Warehouse::with('address')
            ->where('is_active', true)
            ->where('is_pickup_point', true)
            ->get()
            ->map(function ($warehouse) {
                return [
                    'id' => $warehouse->id,
                    'name' => $warehouse->name,
                    'address' => $warehouse->address,
                    'metadata' => $warehouse->metadata
                ];
            });
    }
}
