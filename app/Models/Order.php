<?php
// app/Models/Order.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; 
use Illuminate\Database\Eloquent\Model;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;

use Illuminate\Support\Carbon; 
use App\Traits\HasStatusHistory;

class Order extends Model {
    use HasFactory;
    use HasStatusHistory;

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
        'actual_legal_agreement_ip',
        'is_preorder'
        // ... другие поля
    ];

    protected $casts = [
        'order_date'                => 'datetime',
        'is_paid'                   => 'boolean',
        'is_client_informed'        => 'boolean',
        'invoice_url_expired_at'    => 'datetime',
        'access_expires_at'         => 'datetime',
        'created_at'                => 'datetime',
        'updated_at'                => 'datetime',
        'status_id'                 => 'integer',
        'payment_method'            => PaymentMethod::class,
        'payment_status'            => PaymentStatus::class,
        'payment_details'           => 'array',
        'is_preorder'               => 'boolean',
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
        // $current = json_decode($this->payment_details, true) ?? [];
        /* $this->update([
            'payment_details' => json_encode(array_merge($current, $newData), JSON_UNESCAPED_UNICODE)
        ]); */
        $current = $this->payment_details ? json_decode($this->payment_details, true) : [];
        $this->payment_details = json_encode(array_merge($current, $newData));
        $this->save();
    }

    // Проверяем срок действия ссылки для оплаты заказа
    public function isPaymentLinkExpired(): bool {
        $expiresAt = $this->payment_details['payment_url_expires_at'] ?? null;
        
        return $expiresAt 
            ? now()->gt(Carbon::parse($expiresAt)) 
            : true; // Если нет даты - считаем ссылку просроченной
    }

    // Отношение... Связь с историей статусов
    public function statusHistory() {
        return $this->hasMany(OrderStatusHistory::class)->latest();
    }

    // Доступ к текущему статусу (для удобства)
    public function getStatusAttribute(): ?OrderStatus
    {
        return OrderStatus::tryFrom($this->status_id);
    }

    /**
     * Scope для заказов с определенным статусом
     */
    public function scopeWithStatus($query, OrderStatus $status) {
        return $query->where('status_id', $status->value);
    }

    /**
     * Scope для заказов, которые можно оценить (полученные)
     */
    public function scopeCanBeReviewed($query) {
        return $query->where('status_id', OrderStatus::RECEIVED->value);
    }

    /**
     * Scope для заказов пользователя с определенным товаром
     */
    public function scopeWithProduct($query, $productId) {
        return $query->whereHas('items', function($q) use ($productId) {
            $q->where('product_id', $productId);
        });
    }

    // не работает в случае обновления статуса из AdminOrderController - не получает нужную нам модель ({"this":{"App\\Models\\Order":[]}} - в логах)
    // пока оставлю - возможно где-то была попытка заюзать данный метод - потом проверить... реализовал смену статуса заказа в самом контроллере AdminOrderController 
    // !!! используется в app/Console/Commands/CheckExpiredReservation.php
    public function changeStatus(OrderStatus $newStatus, ?string $comment = null): void {
        // 1. Получаем текущий статус из БД
        // $oldStatus = $this->status_id;       
        $oldStatus = $this->getOriginal('status_id'); // Берём исходное значение из БД                                                  

        DB::transaction(function () use ($newStatus, $oldStatus, $comment) {
            // 2. Обновляем статус
            $this->update(['status_id' => $newStatus->value]);

            // 3. Логируем изменение
            $this->logStatusChange(                                     // используем трейт use HasStatusHistory;
                oldStatus: $oldStatus,
                newStatus: $newStatus->value,
                comment: $comment ?? "Автоматическое обновление статуса"
            );
        });
    }

    /** Инкапсулирует логику отметки заказа как неудачного
     *      Может переиспользоваться в любом месте приложения - пока нигде в коде не используется
     *      При попытке его "заюзывания" в коде - перепроверить на соответствие с предыдущим методом changeStatus
     */
    public function markAsFailed(string $errorMessage): void {
        DB::transaction(function () use ($errorMessage) {
            $this->update([
                'status_id' => OrderStatus::FAILED->value,
                'error_log' => $errorMessage
            ]);
            
            $this->statusHistories()->create([
                'old_status' => $this->getOriginal('status_id'), // Берём исходное значение из БД     
                'new_status' => OrderStatus::FAILED->value,
                'comment' => $errorMessage
            ]);
        });
    }

    public function getLatestDeliveryDate(): ?Carbon {
        
        if (!$this->is_preorder) {
            // Или для обычных заказов:
            return null;
            // return $this->delivery_date 
            //     ? Carbon::parse($this->delivery_date)
            //     : now()->addDays(config('app.default_delivery_days'));
        }
        
        // Для предзаказов берём самую позднюю дату
        $dateString = $this->items()
            ->whereNotNull('expected_delivery_date')
            ->orderByDesc('expected_delivery_date')
            ->value('expected_delivery_date');
        \Log::debug('getLatestDeliveryDate', ['dateString' =>$dateString,
                                              'return' => $dateString ? Carbon::parse($dateString) : null]);      

        return $dateString ? Carbon::parse($dateString) : null;
    }

    public function getDeliveryEstimate(): ?string {
        
        if (!$this->is_preorder) return null;

        $date = $this->getLatestDeliveryDate();
        \Log::debug('Delivery estimate', [
            'raw_date' => $date,
            'formatted' => $date?->format('d.m.Y')
        ]);
        
        return $date?->format('d.m.Y');
    }
}

