<?php
// app/Models/Order.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model {
    use HasFactory;

    protected $fillable = [
        'order_number',
        'order_status_id',
        'order_transport_id',
        'pickup_point_id',
        'delivery_address',
        'total_price',
        // ... другие поля
    ];

    protected $casts = [
        'is_paid' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Статус заказа
     */

    # Если посмотреть со стороны заказа, то каждый заказ принадлежит одному статусу. 
    # Это значит, что заказ можно связать со статусом отношением belongsTo:

    public function status() {
        return $this->belongsTo(OrderStatus::class, 'order_status_id');
    }
    # При вызове метода status, Eloquent попытается найти модель OrderStatus, 
    # у которой есть id, который соответствует столбцу order_status_id в модели Order.

    /**
     * Способ доставки
     */
    # При вызове метода transport, Eloquent попытается найти модель Transport, 
    # у которой есть id, который соответствует столбцу order_transport_id в модели Order.
    public function transport() {
        return $this->belongsTo(Transport::class, 'order_transport_id');
    }

    /**
     * Пункт самовывоза (если выбран)
     */
    public function pickupPoint() {
        return $this->belongsTo(Warehouse::class, 'pickup_point_id');
    }

    /**
     * Применённые скидки
     */
    public function appliedDiscounts() {
        return $this->hasMany(AppliedDiscount::class);
    }

    /**
     * Расчёт стоимости доставки
     */
    public function calculateDeliveryCost()
    {
        if (!$this->transport) {
            return 0;
        }

        return match($this->transport->price_calculation) {
            'fixed' => $this->transport->base_price ?? 0,
            'distance' => $this->calculateDistanceCost(),
            'weight' => $this->calculateWeightCost(),
            'external' => $this->delivery_cost ?? 0, // Для Почты России
            default => 0
        };
    }

    /**
     * Полный адрес доставки
     */
    public function getFullDeliveryAddressAttribute()
    {
        return $this->transport->code === 'pickup' && $this->pickupPoint
            ? $this->pickupPoint->full_address
            : $this->delivery_address;
    }

    /**
     * Проверка, является ли заказ самовывозом
     */
    public function isPickup(): bool
    {
        return $this->transport && $this->transport->code === 'pickup';
    }
   
}

