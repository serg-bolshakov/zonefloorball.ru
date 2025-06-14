<?php
// app/Models/OrderStatusHistory.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\OrderStatus;

class OrderStatusHistory extends Model {
    
    use HasFactory;

    // для обращения к заказу/статусам
    public function order() {
        return $this->belongsTo(Order::class);
    }

    protected $fillable = [
        'order_id',
        'old_status',
        'new_status',
        'comment',
        // 'created_at'
    ];

    protected $casts = [
        'old_status' => OrderStatus::class, // Автоматическое преобразование
        'new_status' => OrderStatus::class,
        // 'created_at'    => 'datetime',
    ];

    public $timestamps = false; // Отключаем автоматические поля created_at/updated_at - даже если не нужен updated_at - всё равно его требует...

}