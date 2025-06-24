<?php
// app/Http/Controllers/OrderController.php
namespace App\Http\Controllers;

# используем FormRequest для создания классов валидации входных API-запросов: 
use App\Http\Requests\StoreOrderRequest;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; 

use App\Services\DiscountService;
use App\Models\Discount;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\OrdersCount;
use App\Models\ProductReport;
use App\Models\ProductReservation;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Resources\OrderResource; 
use App\Http\Resources\OrderCollection;

# для отправки по электронной почте уведомления продавцу, что формлен новый заказ, импортируем:
use App\Mail\NewOrder;
use App\Mail\NewOrderForCustomer;
use App\Mail\OrderInvoice;
use App\Mail\OrderReserve;
use Illuminate\Support\Facades\Mail;        // Чтобы отправить сообщение, используем метод to фасада Mail

use App\Traits\CalculateDiscountTrait;

use Illuminate\Support\Facades\Auth; // Получение аутентифицированного пользователя 16.12.2024 
# вам часто будет требоваться взаимодействовать с текущим аутентифицированным пользователем. 

use App\Enums\OrderStatus;                  // создали класс-перечисление:
use App\Enums\PaymentMethod;

/* Если вы не хотите использовать метод validate запроса, то вы можете создать экземпляр валидатора вручную, 
   используя фасад Validator. Метод make фасада генерирует новый экземпляр валидатора: */
use Illuminate\Support\Facades\Validator;

use App\Services\WorkingDaysService;        // Сервис для расчёта рабочих дней
use Illuminate\Support\Str;                 // класс генерирует криптографически безопасную строку
use Inertia\Inertia;

class OrderController extends Controller {
    protected $discountService;

    use CalculateDiscountTrait;

    public function __construct(DiscountService $discountService) {
        $this->discountService = $discountService;
    }

    public function store(Request $request)
    {
        // Создание заказа
        $order = Order::create([
            'total' => $request->input('total'),
            'user_id' => $request->input('user_id'),
        ]);

        // Получение клиента
        $user = User::find($request->input('user_id'));

        // Получение товаров в заказе
        $items = $request->input('items');

        // Применение скидок
        $this->discountService->applyDiscounts($order, $user, $items);

        return response()->json($order, 201);
    }

    // Просмотр логов:  tail -f storage/logs/laravel.log
    public function create (StoreOrderRequest $request) {

        try {
            $order = DB::transaction(function () use ($request) {
                // 1. Создаём/получаем пользователя
                    $user = $this->resolveUser($request);
                    // \Log::debug('OrderController user:', [ 'user_id' => $user->id,  ]);
                
                // 2. Генерируем номер заказа
                    $clientType = $user->client_type_id ?? 1; // По умолчанию физлицо
                    $orderNumber = $this->generateOrderNumber($clientType);

                    \Log::debug('OrderController orderNumber:', [ 'orderNumber' => $orderNumber,  'clientType' => $clientType,]);

                    $orderRecipientNames = match ($user->client_type_id) {
                        1 => $user->pers_surname . ' ' . $user->name,
                        2 => $user->name,
                        default => $request->input('customer.lastName') . ' ' . $request->input('customer.firstName')
                    };
                    \Log::debug('OrderController orderRecipientNames:', [ 'orderRecipientNames' => $orderRecipientNames]);

                    $orderRecipientTel = match ($user->client_type_id) {
                        1 => $user->pers_tel,
                        2 => $user->representPerson->pers_tel ?? $user->org_tel,
                        default => $request->input('customer.phone')
                    };
                    \Log::debug('OrderController orderRecipientTel:', [ 'orderRecipientTel' => $orderRecipientTel]);
                    
                    /* $orderRecipientTel = '';
                    if    (isset($user->client_type_id) && ($user->client_type_id == '1')) {$orderRecipientTel = $user->pers_tel; }
                    elseif(isset($user->client_type_id) && ($user->client_type_id == '2')) {
                        if(isset($representPerson) && !empty($representPerson)) {
                            $orderRecipientTel = $representPerson->pers_tel; 
                        } else {
                            $orderRecipientTel = $representPerson->org_tel; 
                        }  // надо будет подумать какой телефон здесь указывать
                    } */

                    $orderRecipientEmail = null;
                    if    (isset($user->client_rank_id) && ($user->client_rank_id == '8')) {$orderRecipientEmail = $user->pers_email; }
                    elseif(isset($user->client_type_id) && ($user->client_type_id == '2')) {
                        if(isset($representPerson) && !empty($representPerson)) {
                            $orderRecipientEmail = $representPerson->pers_email; 
                        } else {
                            $orderRecipientEmail = $representPerson->org_email; 
                        }  
                    } else {
                        $orderRecipientEmail = $user->pers_email;
                    }
                    \Log::debug('orderRecipientEmailrderRecipientTel:', [ 'orderRecipientEmail' => $orderRecipientEmail]);

                // 3. Создаём заказ
                    // \Log::debug('OrderStatus::PENDING', [ 'OrderStatus::PENDING' => OrderStatus::PENDING]);
                    $orderData = [
                        'order_number'              => $orderNumber,
                        'order_client_type_id'      => $user->client_type_id ?? 1,
                        'order_client_rank_id'      => $user->client_rank_id,
                        'total_product_amount'      => $request->input('products_amount'),
                        'order_client_id'           => $user?->id,
                        'order_delivery_cost'       => $request->input('delivery.price'),
                        'order_delivery_address'    => $request->input('delivery.address') 
                                                        ?? $user->delivery_addr_on_default 
                                                        ?? 'Не указан',
                        'payment_method'            => $this->resolvePaymentMethod($request),
                        'order_transport_id'        => $request->input('delivery.transportId'),
                        'order_recipient_names'     => $orderRecipientNames,
                        'order_recipient_tel'       => $orderRecipientTel,
                        'email'                     => $orderRecipientEmail,
                        'status_id'                 => OrderStatus::PENDING->value,
                        'access_hash'               => Str::random(32),
                    ];
                    $order = Order::create($orderData);
                    \Log::debug('order:', [ 'order' => $order]);
                
                // 4. Добавляем товары в таблицу order_items (id, order_id, product_id, quantity, price, regular_price, created_at, updated_at) и резервируем их
                    if (empty($request->input('products'))) {
                        throw new \Exception('Нет товаров в заказе');
                    }

                    foreach ($request->input('products') as $item) {
                        // 1. Создаём позицию заказа
                            // выбираем цену, которая была зафиксирована на момент продажу товара (с учётом возможной скидки за ранг пользоателя):
                            $productFinalPrice = (isset($item['price_with_rank_discount']) && $item['price_with_rank_discount'] < $item['price']) 
                                ? $item['price_with_rank_discount']
                                : $item['price'];

                        OrderItem::create([
                            'order_id'      => $order->id,
                            'product_id'    => $item['id'],
                            'quantity'      => $item['quantity'],
                            'price'         => $productFinalPrice,
                            'regular_price' => $item['price_regular'] ?? $item['price'] // Если нет regular, используем price
                        ]);

                        // 2. Резервируем товар
                        try {
                            $productReport = ProductReport::where('product_id', $item['id'])
                                ->lockForUpdate() // Решает проблему "гонки"
                                ->first();
                            
                            if (!$productReport) { throw new \Exception("Товар ID: {$item['id']} не найден в отчётах"); }
                            if ($productReport->on_sale < $item['quantity']) { throw new \Exception("Недостаточно товара на складе"); }
                            // if ((int)$item['quantity'] > ($productReport->on_sale - $productReport->reserved)) { throw new \Exception("Пытаемся зарезервировать товар, которого нет на складе"); }

                            $productReport->update([
                                'on_sale'   => (int)$productReport->on_sale - (int)$item['quantity'],
                                'reserved'  => (int)$productReport->reserved + (int)$item['quantity'],
                            ]);
                        } catch (\Exception $e) {
                            Log::error("Ошибка резервирования товара", [
                                'product_id' => $item['id'],
                                'error' => $e->getMessage()
                            ]);
                            throw $e; // Пробрасываем выше для отката транзакции
                        }

                        // 3. Логируем резерв
                        ProductReservation::create([
                            'product_id' => $item['id'],
                            'order_id' => $order->id,
                            'quantity' => $item['quantity'],
                            'expires_at' => WorkingDaysService::getExpirationDate(3)
                        ]);
                    }
                
                // 5. Логируем статус
                    OrderStatusHistory::create([
                        'order_id' => $order->id,
                        'old_status' => OrderStatus::PENDING->value,                // 1
                        'new_status' => OrderStatus::CREATED->value,                // 2
                        'comment' => 'Пользователь подтвердил заказ'
                    ]);

                // 6. Обновляем статус заказа в таблице Orders
                    $order->refresh()->update([
                        'status_id' => OrderStatus::CREATED->value,
                        'invoice_url_expired_at' => WorkingDaysService::getExpirationDate(3),
                    ]);
                
                // 7. Логируем полученные покупателем скидки: вызываем сервис для логирования (применения - закомментировал) скидок:
                    // app(DiscountService::class)->logExistingDiscounts($order);   // Только логируем!
                    $this->discountService->logExistingDiscounts($order);           // Только логируем!

                // 8. Генерируем PDF и отправляем письма

                    // 8.1 Создаём экземпляр Mailable
                    $orderMail = new OrderReserve($order, $user);
                    
                    // 8.2 Генерируем уникальное имя для PDF
                    $sanitizedOrderNumber = $orderMail->sanitizeOrderNumber($orderNumber);
                    \Log::debug('sanitizedOrderNumber:', [ 'sanitizedOrderNumber' => $sanitizedOrderNumber]);

                    $salt = $orderMail->encryptOrderNumber($sanitizedOrderNumber);
                    $relativePath = 'storage/invoices/invoice_' . $sanitizedOrderNumber . '_' . $salt . '.pdf';
                    
                    // 8.3 Сохраняем путь к PDF в базу данных (Обновляем заказ с ссылкой на PDF)
                    try {
                        $order->update(['invoice_url' => $relativePath]);
                    } catch (\Exception $e) {
                        \Log::error('Failed to update order: '.$e->getMessage());
                        // Дополнительная обработка ошибки
                    }

                    // 8.4 Пересоздаём экземпляр OrderReserve с обновлённым объектом $newOrder
                    $orderMail = new OrderReserve($order, $user);

                    // 8.5 Генерируем и сохраняем PDF
                    $orderMail->buildPdfAndSave($relativePath);

                    // Отправляем заказ ...
                    try {
                        // Mail::to($user->email)->send($orderMail);
                        // Mail::to('serg.bolshakov@gmail.com')->cc('ivk@mts.ru')->send($orderMail);
                        Mail::to('serg.bolshakov@gmail.com')->send($orderMail);
                    } catch (\Exception $e) {
                        Log::error('Failed to send order email: '.$e->getMessage());
                    }
                
                return compact('order');

                // return compact('order', 'pdfLink');
            });

            \Log::debug('order for return:', [ 'order for return' => $order['order']]);

            return response()->json([
                'status' => 'success',
                'orderId' => $order['order']->id,
                // 'order' => $order['order'],
                'clearCart' => true, // Флаг для фронта
                'redirect' => null,  // Фронт сам решит куда редиректить
                'message' => 'Заказ успешно создан'
            ]);
        
        } catch (\Throwable $e) {     // \Throwable — это базовый интерфейс в PHP, который реализуют: Все исключения (\Exception) и Ошибки (\Error, например TypeError)
            Log::error('Order failed: '.$e->getMessage());
                    
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при оформлении заказа',
                'error_code' => 'ORDER_CREATION_FAILED'
            ], 500);
        }
        
    }      
        
    private function resolveUser($request): ?User {
        // \Log::debug('OrderController request:', [ 'user' => $request->all(),]);

        if (Auth::check()) {
            return Auth::user();
        }
        // \Log::debug('OrderController !authed:', [ '!authed' => '!authed',]);

        return User::create([
            'client_type_id' => 1,                                              // Физлицо
            'client_rank_id' => 8,                                              // Не зарегистрированный
            'user_access_id' => 6,                                              // guest   
            'name' => $request->input('customer.firstName'),
            'pers_surname' => $request->input('customer.lastName'),
            'pers_tel' => $request->input('customer.phone'),
            'delivery_addr_on_default' => $request->input('delivery.address'),
            'pers_email' => $request->input('customer.email'),
            'action_auth_id' => 0,
            // 'password' => Hash::make(Str::random(32))                         // Временный пароль: не думаю, что может пригодиться... да и HASH нужно импортировать... если всё-таки понадобится... не забыть...
        ]);
    }    

    private function generateOrderNumber(int $orderClientTypeId): string {
        $currentTime = time();  // значение текущего времени
        $settedMonthStartTime = strtotime('first day of this month 00:00:00');
        $settedMonthEndTime = strtotime('last day of this month 23:59:59');
        $countOrdersThisMonth = 1;
        $lastOrderView = $orderClientTypeId . '-' . date('y') . '-' . date('m') . '/' . $countOrdersThisMonth;

        // получаем из БД текущие значения таблицы orders_count:
        $result = OrdersCount::first();
        // dump($result);
        if (!$result) {      // на первое использование, если счётчик пустой - установим начальные значения:
            $ordersCount = new OrdersCount;
            $ordersCount->setted_month_start_time = "$settedMonthStartTime";
            $ordersCount->setted_month_end_time = "$settedMonthEndTime";
            $ordersCount->count_orders_this_month = "1";
            $ordersCount->last_order_number_view = "$lastOrderView";
            $ordersCount->save();
        }   else {
            // если таблица содержит значение, делаем проверку, что не наступил следующий месяц:
            if($currentTime > (int)$result->setted_month_end_time) {
                // если наступил, обновляем данные текущего месяца и обнуляем счётчик заказов текущем месяце:
                $result->setted_month_start_time = "$settedMonthStartTime";
                $result->setted_month_end_time = "$settedMonthEndTime";
                $result->count_orders_this_month = "1";
                $result->last_order_number_view = "$lastOrderView";
                $result->save();
            } else {
                // Увеличиваем счетчик заказов при создании объекта:
                $countOrdersThisMonth = $newCountValue = (int)$result->count_orders_this_month + 1;
                $lastOrderView = $orderClientTypeId . '-' . date('y') . '-' . date('m') . '/' . $countOrdersThisMonth;
                $result->count_orders_this_month = "$newCountValue";
                $result->last_order_number_view = "$lastOrderView";
                $result->save();
            }
        }
        return $orderClientTypeId . '-' . date('y') . '-' . date('m') . '/' . $countOrdersThisMonth;
    }
    
    /**
     * Определяет метод оплаты на основе запроса
     * 
     * @param Request $request
     * @return string  Константа из PaymentMethod::*
     */
    private function resolvePaymentMethod(Request $request): string {

        $request->validate([
            'paymentMethod' => ['required' , 'in:online,bank_transfer,cash'],
            'customer.type' => ['sometimes', 'in:legal,individual,guest']
        ]);
        
        return PaymentMethod::forRequest($request)->value;
    }
          
    // Просмотр счёта (публичная)
    public function showInvoice(Order $order) {
        // $order уже загружен по условию WHERE access_hash = '4Toygb6VpsZXMW3wQtaFjg80eDBC1QJP'

        if ($order->invoice_url_expired_at?->isPast()) {
            // НУЖНО доработать этот вариант...
            // Время действия счёта закончился. Оплате на подлежит. Товар снят с резерва и поступил в открытую продажу. 
            // return view('orders.expired');
        }

        // Добавим проверку существования файла
        $filePath = $order->invoice_url;
        if (!file_exists($filePath)) {
            abort(404, 'Файл счёта не найден');
        }

        return response()->file($filePath, [
            'Content-Type' => 'application/pdf',
        ]);
    }

    // Отслеживание заказа (публичная)
    public function trackOrder(Order $order) {
        
        try {
            if ($order->access_expires_at?->isPast()) {
                return Inertia::render('OrderExpired');
            }

            \Log::debug('status_id:', [ 'history' => OrderStatus::tryFrom((int)$order->status_id)?->title()]);

            return Inertia::render('OrderTracking', [
                    'title' => 'Отслеживание заказа',
                    'robots' => 'NOINDEX,NOFOLLOW',
                    'description' => '',
                    'keywords' => '',         
                    'order' => [
                        // 'id' => $order->id,
                        'number' => $order->order_number,
                        'date' => $order->order_date->format('d.m.Y H:i'),
                        'status' => [
                            'id' => $order->status_id,
                            'name' => OrderStatus::tryFrom((int)$order->status_id)?->title() ?? 'Не указан',    // Используем enum
                            'history' => $order->statusHistory?->map(function($item) {                          // Оператор null-safe (?.) Автоматически обрабатывает случай, когда statusHistory равен null.
                                return [
                                    'date' => $item->created_at->format('d.m.Y H:i'),
                                    'status' => OrderStatus::tryFrom((int)$item->new_status)?->title() ?? 'Неизвестный статус',     // tryFrom с null-оператором - Безопасное преобразование статуса без исключений.
                                    'comment' => $item->comment
                                ];
                            }) ?? [] // Возвращаем пустой массив если history null
                        ],
                        'items' => $order->items->map(function($item) {
                            // dd($item);
                            return [
                                'product' => [
                                    'id' => $item->product_id,
                                    'name' => $item->product->title,
                                    'article' => $item->product->article
                                ],
                                'quantity' => $item->quantity,
                                'price' => $item->price,
                                'discount' => $item->regular_price - $item->price
                            ];
                        }),
                        'delivery' => [
                            'type'              => $order->transport->name,
                            'address'           => $order->order_delivery_address,
                            'tracking_number'   => $order->delivery_tracking_number,
                            'estimated_date'    => $order->estimated_delivery_date?->format('d.m.Y'), // estimated_delivery_date может быть null - добавили обработку
                            'cost'              => $order->order_delivery_cost
                        ],
                        'payment' => [
                            'method' => [
                                'code'  => $order->payment_method->value,       // 'online'
                                'label' => $order->payment_method->label()      // 'Онлайн-оплата'
                            ],
                            'status' => [
                                'code'  => $order->payment_status->value,       // 'pending'
                                'label' => $order->payment_status->label()      // 'Ожидает оплаты'
                            ],
                            'invoice_url' => '/invoice/' . $order->access_hash
                        ]
                    ]
                ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Ошибка загрузки данных для просмотра статуса заказа в OrderController@trackOrder',
                'details' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
        
    }

    // Получение всех заказов клиента
    public function getOrders(Request $request) {
        
        // Получение клиента
        $user = Auth::user();
        if (!$user) { return ; }
        
        try {

            // dd($user->orders()->count() ?? '0');

            $perPage    = (int)$request->input('perPage', 10);
            $page       = (int)$request->input('page', 1);
            $sortBy     = $request->input('sortBy', 'order_date');
            $sortOrder  = $request->input('sortOrder', 'desc');

            // Создаём базовый запрос
            $query = Order::query()->where('order_client_id', $user->id)->orderBy($sortBy, $sortOrder);

            // Пагинация
            $orders = $query->paginate($perPage, ['*'], 'page', $page);

            $title = $user->client_type_id == '1' ? 'Мои заказы' : 'Наши заказы';
            // dd($orders);
            return Inertia::render('Orders', [
                'title' => $title,
                'robots' => 'NOINDEX,NOFOLLOW',
                'description' => '',
                'keywords' => '',
                'orders' => new OrderCollection($orders),  // Inertia.js использует JSON для передачи данных между Laravel и React. Когда мы передаём объект OrderCollection, он сериализуется в JSON. В процессе сериализации некоторые свойства объекта LengthAwarePaginator (например, lastPage, total, perPage и т.д.) могут быть преобразованы в массивы, если они имеют сложную структуру или если в процессе сериализации происходит дублирование данных - это проблема: в react мы получаем не значения, а массиивы значений (дублирование), что приводит к проблемам при рендеринге данных
                'sortBy' => $sortBy,
                'sortOrder' => $sortOrder,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Ошибка загрузки данных для просмотра выюорки заказов в OrderController@getOrder',
                'details' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
        
    }
}