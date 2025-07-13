<?php
// app/Models/Order.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;

class Order extends Model {
    use HasFactory;

    protected $fillable = [
        'order_number',
        'order_client_type_id',
        'order_client_rank_id',
        'order_client_id',
        'total_product_amount',
        'order_delivery_cost',
        'is_order_amount_includes_taxes',
        'payment_method_id',
        'order_transport_id',
        'order_delivery_address',
        'order_recipient_names',
        'order_recipient_tel',
        'email',
        'order_track_num',
        'status_id',
        'is_client_informed',
        'is_tracking_by_client',
        'invoice_url',
        'invoice_url_expired_at',
        'payment_method',
        'payment_status',
        'payment_details',
        'pickup_point_id ',
        'access_hash',
        'access_expires_at',
        'actual_legal_agreement_ip'
        // ... другие поля
    ];

    protected $casts = [
        'order_date'                => 'datetime',
        'is_paid'                   => 'boolean',
        'invoice_url_expired_at'    => 'datetime',
        'access_expires_at'         => 'datetime',
        'created_at'                => 'datetime',
        'updated_at'                => 'datetime',
        'status_id'                 => 'integer',
        'payment_method'            => PaymentMethod::class,
        'payment_status'            => PaymentStatus::class,
        'payment_details'           => 'array'
    ];

    /** Как это работает $casts в модели автоматически конвертирует:
     *      // БД → Enum
     *          $order->payment_method                          // 'online'  => PaymentMethod::ONLINE
     *          $order->payment_status                          // 'pending' => PaymentStatus::PENDING
     *      
     *      // Enum → БД (при сохранении)
     *          $order->payment_method = PaymentMethod::ONLINE; // Сохранится как 'online'
     */


    protected $dates = ['invoice_url_expired_at', 'access_expires_at'];
    
    /**
     * Способ доставки
     */
    # При вызове метода transport, Eloquent попытается найти модель Transport, 
    # у которой есть id, который соответствует столбцу order_transport_id в модели Order.
    public function transport() {
        return $this->belongsTo(Transport::class, 'order_transport_id');
    }

    /**
     * Метод для генерации URL для просмотра пользователя деталей счёта и отчёта о его движении:
     */
    public function getAccessUrlAttribute() {
        return route('order.track', [
            'order' => $this->id, 
            'hash' => $this->access_hash
        ]);
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

    // Добавить информацию об оплате заказа (платеже)
    public function addPaymentDetails(array $newData) {
        $current = json_decode($this->payment_details, true) ?? [];
        $this->update([
            'payment_details' => json_encode(array_merge($current, $newData), JSON_UNESCAPED_UNICODE)
        ]);
    }
   
}

