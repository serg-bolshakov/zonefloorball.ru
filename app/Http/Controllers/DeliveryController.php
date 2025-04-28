<?php
// app/Http/Controllers/DeliveryController.php

namespace App\Http\Controllers;
use Illuminate\Http\Request; 
use App\Models\Transport;

class DeliveryController extends Controller {
    public function index() {
    return Transport::with('warehouses')
        ->where('is_active', true)
        ->get()
        ->map(function ($transport) {
            return [
                'id' => $transport->id,
                'code' => $transport->code,
                'name' => $transport->name,
                'warehouses' => $transport->code === 'pickup' 
                    ? $transport->warehouses 
                    : null
            ];
        });
    }
}