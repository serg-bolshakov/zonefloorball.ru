<?php
// app/Models/Order.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model {
    use HasFactory;

    protected $fillable = [
        'order_number',
        'order_client_type_id',
        'order_client_rank_id',
        'order_client_id',
        'products_amount',
        'order_delivery_cost',
        'is_order_amount_includes_taxes',
        'order_payment_method_id',
        'order_transport_id',
        'order_delivery_address',
        'order_recipient_names',
        'order_recipient_tel',
        'email',
        'order_status_id',
        'is_client_informed',
        'is_tracking_by_client',
        'order_content',
        'order_url_semantic',
        'payment_status',
        'payment_details',
        'pickup_point_id '
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

    /** Получить покупателя (автора заказа)
     *  Связь: Заказ → Пользователь  
     * - ON DELETE RESTRICT защищает от удаления пользователя с заказами.
     * - ON UPDATE CASCADE автоматически обновит order_client_id при изменении users.id.
     */
    # При вызове метода user, Eloquent попытается найти модель User, 
    # у которой есть id, который соответствует столбцу order_client_id в модели Order.
    public function user() {
        return $this->belongsTo(User::class, 'order_client_id')->withDefault([
            'name' => 'Удалённый пользователь'      // пробуем для того, чтобы избежать null при обращении к $order->user, если связь не найдена!?
        ]);
    }

    /** Получить ранг покупателя (автора заказа)
     *  Связь: Заказ → Ранг пользователя  
     * - ON DELETE RESTRICT защищает от удаления ранг покупателя.
     * - ON UPDATE CASCADE автоматически обновит order_client_rank_id при изменении client_ranks.id.
     */
    # При вызове метода clientRank, Eloquent попытается найти модель ClientRank, 
    # у которой есть id, который соответствует столбцу order_client_rank_id в модели Order.
    public function clientRank() {
        return $this->belongsTo(ClientRank::class, 'order_client_rank_id');
    }

    /** Получить товары заказа (через связанную таблицу order_items)
     *  Связь: Заказ → Товары (многие-ко-многим)
     * - ON DELETE RESTRICT  -- Запрещаем удалять товар, если он есть в заказах
     * - ON UPDATE CASCADE;  -- Обновляем product_id в order_items при изменении id товара
     */
    public function products() {
        // Product::class	Модель товара	Указывает, с какой сущностью связываемся. 'order_items'	Промежуточная таблица. 'order_id'	Внешний ключ в order_items. 'product_id'	Внешний ключ в order_items	
        return $this->belongsToMany(Product::class, 'order_items', 'order_id', 'product_id')
            ->withPivot('quantity', 'price', 'regular_price')   // Доп. поля из промежуточной таблицы
            ->withTimestamps();                                 // Если есть created_at/updated_at
    }

    // Получить все позиции заказа (с количеством, ценой)
    public function items() {
        return $this->hasMany(OrderItem::class);                // Один заказ → много позиций
    }
   
}

