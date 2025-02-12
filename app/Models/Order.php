<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

# в модели с заказами сделаем метод для получения статуса заказа:
use App\Models\OrderStatus;
use App\Models\Transport; 

class Order extends Model
{
    use HasFactory;
    
    # Если посмотреть со стороны заказа, то каждый заказ принадлежит одному статусу. 
    # Это значит, что заказ можно связать со статусом отношением belongsTo:

    public function status() {
        return $this->belongsTo(OrderStatus::class, 'order_status_id');
    }
    # При вызове метода status, Eloquent попытается найти модель OrderStatus, 
    # у которой есть id, который соответствует столбцу order_status_id в модели Order.
    
    # При вызове метода transport, Eloquent попытается найти модель Transport, 
    # у которой есть id, который соответствует столбцу order_transport_id в модели Order.
    public function transport() {
        return $this->belongsTo(Transport::class, 'order_transport_id');
    }

    public function appliedDiscounts()
    {
        return $this->hasMany(AppliedDiscount::class);
    }
}

