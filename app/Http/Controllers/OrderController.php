<?php
// app/Http/Controllers/OrderController.php
namespace App\Http\Controllers;

# используем FormRequest для создания классов валидации входных API-запросов: 
use App\Http\Requests\StoreOrderRequest;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; 

use App\Services\DiscountService;
use App\Services\RobokassaService;
use App\Models\Discount;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\OrdersCount;
use App\Models\ProductReport;
use App\Models\ProductReservation;
use App\Models\User;
use App\Models\LegalDocument;

use Illuminate\Http\Request;
use App\Http\Resources\OrderResource; 
use App\Http\Resources\OrderCollection;
use Illuminate\Support\Carbon; 

# для отправки по электронной почте уведомления продавцу, что формлен новый заказ, импортируем:
use App\Mail\NewOrder;
use App\Mail\NewOrderForCustomer;
use App\Mail\OrderInvoice;
use App\Mail\OrderReserve;
use App\Mail\OrderMailFactory;
use Illuminate\Support\Facades\Mail;        // Чтобы отправить сообщение, используем метод to фасада Mail

use App\Traits\CalculateDiscountTrait;

use Illuminate\Support\Facades\Auth; // Получение аутентифицированного пользователя 16.12.2024 
# вам часто будет требоваться взаимодействовать с текущим аутентифицированным пользователем. 

use App\Enums\OrderStatus;                  // создали класс-перечисление:
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\OrderAction;

/* Если вы не хотите использовать метод validate запроса, то вы можете создать экземпляр валидатора вручную, 
   используя фасад Validator. Метод make фасада генерирует новый экземпляр валидатора: 
use Illuminate\Support\Facades\Validator;*/

use App\Services\WorkingDaysService;        // Сервис для расчёта рабочих дней
use Illuminate\Support\Str;                 // класс генерирует криптографически безопасную строку
use Inertia\Inertia;

use App\Services\ErrorNotifierService;
use Illuminate\Validation\Rule;
use Illuminate\Http\RedirectResponse;

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

        if (Auth::check()) {
            \Log::debug('OrderController@create check authed:', [ 'isAuthed' => Auth::check()]);
        } else {
            \Log::debug('OrderController@create check authed:', [ 'user' => '!authed',]);
        }

        // Объявим переменную ДО транзакции, чтобы её не потерять в блоке try - catch
        $order = $redirect = null;
        
        try {
                DB::transaction(function () use ($request, &$order, &$redirect) {       // Передаём $order в транзакцию по ссылке

                $isPreorder = false;

                $validated = $request->validate([
                    'action'        => ['required', 'string', Rule::in(OrderAction::forRequest($request))],
                    'paymentMethod' => ['required', 'string', Rule::in(['online', 'bank_transfer', 'cash'])],
                ]);

                $action = OrderAction::tryFrom($validated['action'])                                        // tryFrom() (стандартный метод enum), Строгая конвертация строки в enum с проверкой, Вернёт null при невалидном значении
                    ?? throw new \InvalidArgumentException('Invalid action: ' . $validated['action']);
                // Вариант 2 (если нужен дефолтный PREORDER): $action = OrderAction::forRequest($request); // Без исключений!

                $isPreorder = $action === OrderAction::PREORDER;
                $statusId = match($isPreorder) {
                    true  => OrderStatus::PREORDER->value,
                    false => OrderStatus::CREATED->value
                };
                
                \Log::debug('OrderController@create $validated:', [ '$validated' => $validated]);

                // 1. Создаём/получаем пользователя
                    $user = $this->resolveUser($request);
                    \Log::debug('OrderController user:', [ 'user_id' => $user->id,  ]);

                    // Проверяем, были ли обновления документов
                    $currentPrivacyPolicy = LegalDocument::getCurrentVersion('privacy_policy');
                    $currentOffer = LegalDocument::getCurrentVersion('offer');
                    
                    $needReconfirm = (
                        $user->privacy_policy_version !== $currentPrivacyPolicy->version ||
                        $user->offer_version !== $currentOffer->version
                    );

                    if ($needReconfirm) {
                        // Показываем страницу переподтверждения - нет!!! надо подумать!!! просто убрать чекбокс!? чтобы пользователь подтвердил согласие!!!
                        // return redirect()->route('legal.reconfirm'); 
                        \Log::debug('OrderController $needReconfirm:', [ '$needReconfirm' => $needReconfirm,  ]);
                    }

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

                    // если авторизованный пользователь - организация (ИП), нам нужно получить представителя, если такой есть
                    $representPerson = $user->this_id 
                        ? User::find($user->this_id)?->only(['name', 'pers_surname', 'pers_email', 'pers_tel'])
                        : null;

                    \Log::debug('OrderController representPerson:', [ 'representPerson' => $representPerson]);

                    $orderRecipientTel = match ($user->client_type_id) {
                        1 => $user->pers_tel,
                        2 => $user->representPerson->pers_tel ?? $user->org_tel,
                        default => $request->input('customer.phone')
                    };
                    \Log::debug('OrderController orderRecipientTel:', [ 'orderRecipientTel' => $orderRecipientTel]);

                    $orderRecipientEmail = null;
                    if    (isset($user->client_rank_id) && ($user->client_rank_id == '8')) {$orderRecipientEmail = $user->pers_email; }
                    elseif(isset($user->client_type_id) && ($user->client_type_id == '2')) {
                        if(isset($representPerson) && !empty($representPerson['pers_email'])) {
                            $orderRecipientEmail = $representPerson['pers_email']; 
                        } else {
                            $orderRecipientEmail = $user->org_email; 
                        }  
                    } else {
                        $orderRecipientEmail = $user->email;
                    }
                    \Log::debug('orderRecipientEmailrderRecipientTel:', [ 'orderRecipientEmail' => $orderRecipientEmail]);

                // 3. Создаём заказ (предзаказ) со статусом "создан": case CREATED / PREORDER               = 2 / 15;
                    \Log::debug('OrderStatus::CREATED', [ 'OrderStatus::CREATED' => OrderStatus::CREATED]);
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
                        'status_id'                 => $statusId,
                        'access_hash'               => Str::random(32),
                        'actual_legal_agreement_ip' => $user->initial_legal_agreement_ip ?? $request->ip(),
                        'is_preorder'               => $isPreorder,
                    ];
                    $order = Order::create($orderData);
                    \Log::debug('order:', [ 'order' => $order]);

                    // Логируем статус
                        $newStatus = $isPreorder 
                            ? OrderStatus::PREORDER                                         // 15
                            : OrderStatus::CREATED;                                         // 2
                        
                        /*  На данном этапе работатьне будет, потому что товары ещё не внесены в БД заказа (предзаказа)
                            $latestDate = $order->getLatestDeliveryDate();

                            $deliveryText = $latestDate 
                                ? "ожидание до ".$latestDate->format('d.m.Y')
                                : "срок поставки будет уточнён";
                        */        

                        $comment = $isPreorder
                            // ? "Пользователь оформил предзаказ ($deliveryText)"
                            ? 'Покупатель оформил предзаказ'
                            : 'Покупатель оформил заказ';
                            // Позже заменим на:
                            // $comment = $status->generateComment($latestDate);

                        OrderStatusHistory::create([
                            'order_id'          => $order->id,
                            'old_status'        => OrderStatus::PENDING->value,                 // 1
                            'new_status'        => $newStatus->value,                 
                            'comment'           => $comment
                        ]);
                
                // 4. Добавляем товары в таблицу order_items (id, name, order_id, product_id, quantity, price, regular_price, created_at, updated_at) и резервируем их
                    if (empty($request->input('products'))) {
                        throw new \Exception('Нет товаров в заказе');
                    }

                    $items = [];    // создаём массив товаров для передачи в Робокассу

                    foreach ($request->input('products') as $item) {
                        \Log::debug('orderController:', [ 'order_item' => $item]);
                        // 1. Создаём позицию заказа/предзаказ
                            // выбираем цену, которая была зафиксирована на момент продажу товара (с учётом возможной скидки за ранг пользователя):
                            /* $productFinalPrice = match($isPreorder) {
                                true  => $item['price_preorder'],
                                false => (isset($item['price_with_rank_discount'])  && $item['price_with_rank_discount'] != 0 && $item['price_with_rank_discount'] < $item['price']) 
                                    ? $item['price_with_rank_discount']
                                    : $item['price']
                            }; */

                            $productFinalPrice = match(true) {
                                // 1. Сначала проверяем предзаказ
                                $isPreorder => ($item['price_preorder'] ?? $item['price']),

                                // 2. Только если НЕ предзаказ - проверяем скидку
                                !empty($item['price_with_rank_discount']) && 
                                    ($item['price_with_rank_discount'] < $item['price']) => 
                                        $item['price_with_rank_discount'],

                                // 3. Если ничего не подошло - базовая цена
                                default => $item['price']
                            };

                            $items[] = [
                                'name'     => $item['name'],
                                'quantity' => (int)$item['quantity'],
                                'price'    => (float)$productFinalPrice,
                                'tax'      => 'none' // Ставка НДС (без НДС)
                            ];

                            $expectedDeliveryDate = null;
                            if ($isPreorder) {
                                try {
                                    $expectedDeliveryDate = $item['expected_delivery_date']
                                        ? Carbon::parse($item['expected_delivery_date'])
                                        : now()->addDays(3);
                                        
                                    // Корректировка если дата в прошлом
                                    if ($expectedDeliveryDate->isPast()) {
                                        $expectedDeliveryDate = now()->addDays(3);
                                    }
                                } catch (\Exception $e) {
                                    // На случай ошибок парсинга
                                    $expectedDeliveryDate = now()->addDays(3);
                                }
                            }

                            OrderItem::create([
                                'order_id'                  => $order->id,
                                'product_id'                => $item['id'],
                                'quantity'                  => $item['quantity'],
                                'is_preorder'               => $isPreorder,
                                'expected_delivery_date'    => $expectedDeliveryDate?->format('Y-m-d'),
                                'price'                     => $productFinalPrice,
                                'regular_price'             => $item['price_regular'] ?? $item['price'] // Если нет regular, используем price
                            ]);

                        // 2. Резервируем товар (уменьшаем количество доступного для предзаказа товара):
                            /* if($isPreorder) {
                                try {
                                    $productReport = ProductReport::where('product_id', $item['id'])
                                        ->lockForUpdate() // Решает проблему "гонки" (Пессимистичная блокировка (lockForUpdate()) - защита от гонки ресурсов)
                                        ->first();
                                    
                                    if (!$productReport) { throw new \Exception("Товар ID: {$item['id']} не найден в отчётах"); }
                                    if ($productReport->on_preorder < $item['quantity']) { throw new \Exception("Недостаточно товара на складе"); }

                                    $productReport->update([
                                        'on_preorder'   => (int)$productReport->on_preorder - (int)$item['quantity'],
                                        'preordered'    => (int)$productReport->preordered + (int)$item['quantity'],
                                    ]);
                                } catch (\Exception $e) {
                                    \Log::error("Ошибка предварительного резервирования товара", [
                                        'product_id' => $item['id'],
                                        'error' => $e->getMessage()
                                    ]);
                                    throw $e; // Пробрасываем выше для отката транзакции
                                }
                            } else {
                                try {
                                    $productReport = ProductReport::where('product_id', $item['id'])
                                        ->lockForUpdate() // Решает проблему "гонки"
                                        ->first();
                                    
                                    if (!$productReport) { throw new \Exception("Товар ID: {$item['id']} не найден в отчётах"); }
                                    if ($productReport->on_sale < $item['quantity']) { throw new \Exception("Недостаточно товара на складе"); }

                                    $productReport->update([
                                        'on_sale'   => (int)$productReport->on_sale - (int)$item['quantity'],
                                        'reserved'  => (int)$productReport->reserved + (int)$item['quantity'],
                                    ]);
                                } catch (\Exception $e) {
                                    \Log::error("Ошибка резервирования товара", [
                                        'product_id' => $item['id'],
                                        'error' => $e->getMessage()
                                    ]);
                                    throw $e; // Пробрасываем выше для отката транзакции
                                }
                            }*/

                            try {
                                $this->reserveProduct(
                                    $item['id'],
                                    $item['quantity'],
                                    $isPreorder ? 'on_preorder' : 'on_sale',
                                    $isPreorder ? 'preordered'  : 'reserved'
                                );
                            } catch (\Exception $e) {
                                \Log::error($isPreorder 
                                    ? "Ошибка предварительного резервирования" 
                                    : "Ошибка резервирования", 
                                    ['error' => $e->getMessage()]
                                );
                                throw $e;
                            }

                        // 3. Логируем резерв
                            ProductReservation::create([
                                'product_id'    => $item['id'],
                                'order_id'      => $order->id,
                                'quantity'      => $item['quantity'],
                                'is_preorder'   => $isPreorder,
                                'expires_at'    => WorkingDaysService::getExpirationDate(3)
                            ]);
                    }
                
                // 5. Логируем полученные покупателем скидки: 
                    // Оставим пока только для обычных заказов (не для предзаказов)
                    if (!$isPreorder && $this->discountService) {
                        $this->discountService->logExistingDiscounts($order);   // Только логируем!
                    }

                // 6. Генерируем PDF и готовим письма:
                    // 6.1 Создаём экземпляр Mailable
                        /* $orderMail = match ($user->client_type_id) {
                            1 => new OrderReserve($order, $user),
                            2 => new OrderInvoice($order, $user),
                            default => new OrderReserve($order, $user)
                        }; */
                        $orderMail = OrderMailFactory::create($order, $user);
                    
                    // 6.2 Генерируем уникальное имя для PDF
                        $sanitizedOrderNumber = $orderMail->sanitizeOrderNumber($orderNumber);
                        \Log::debug('sanitizeOrderNumber:', [ 'sanitizedOrderNumber' => $sanitizedOrderNumber]);

                        $salt = $orderMail->encryptOrderNumber($sanitizedOrderNumber);
                        $relativePath = 'storage/invoices/invoice_' . $sanitizedOrderNumber . '_' . $salt . '.pdf';
                    
                    // 6.3 Сохраняем путь к PDF в базу данных (Обновляем заказ с ссылкой на PDF)
                        try {
                            $order->refresh()->update([
                                'invoice_url'               => $relativePath,
                                'invoice_url_expired_at'    => WorkingDaysService::getExpirationDate(3),
                            ]);
                        } catch (\Exception $e) {
                            \Log::error('Failed to update order: '.$e->getMessage());
                            // Дополнительная обработка ошибки
                        }

                    // 6.4 Пересоздаём экземпляр OrderReserve с обновлённым объектом $newOrder
                        /* $orderMail = match ($user->client_type_id) {
                            1 => new OrderReserve($order, $user),               // Для физических лиц делаем "Резерв"
                            2 => new OrderInvoice($order, $user),               // Для юридических лиц формируем счёт
                            default => new OrderReserve($order, $user)
                        }; */
                        $orderMail = OrderMailFactory::create($order, $user);

                    // 6.5 Генерируем и сохраняем PDF
                        $orderMail->buildPdfAndSave($relativePath);
                        
                // 7. Инициализируем способ оплаты заказа
                    $paymentMethod = PaymentMethod::forRequest($request);
                    \Log::debug('Robokassa payment link generation check', [
                        'order_id' => $order->id,
                        'payment_method' => $paymentMethod, 
                        'is_reserve' => $request->boolean('isReserve'),
                        'is_pay' => $request->boolean('isPay'),
                        'amount' => $order->total_product_amount + $order->order_delivery_cost,
                        'request_data' => $request->only([
                            'paymentMethod', 
                            'products', 
                            'customer'
                        ]),
                        'debug_trace' => [
                            'step' => 'before_payment_processing',
                            'memory_usage' => memory_get_usage(true) / 1024 / 1024 . ' MB'
                        ]
                    ]);
                // 8. Формируем данные для Робокассы (и пытаемся инициировать оплату, если пользователь выбрал "Оплатить" - оплата он-лайн возможна только для физических лиц):
                    if ($order && $order->payment_status !== 'paid' && $user->client_type_id === 1) {    
                        \Log::debug('Generating Robokassa link start', [
                            'order_id' => $order->id,
                            'amount' => (float)$order->total_product_amount + (float)$order->order_delivery_cost,
                            'items_count' => count($items),
                        ]);    
                        // Проверка суммы 
                            $calculatedTotal = array_reduce($items, fn($sum, $item) => $sum + ($item['price'] * $item['quantity']), 0);
                            if (abs($calculatedTotal - $order->total_product_amount) > 0.01) {
                                \Log::error('Сумма товаров не совпадает с total_product_amount', [
                                    'calculated' => $calculatedTotal,
                                    'order_total' => $order->total_product_amount
                                ]);
                                throw new \Exception('Ошибка: расхождение в сумме заказа');
                            }

                        // Robokassa требует явно указывать доставку в чеке. Добавяем её в массив $items:
                            if ($order->order_delivery_cost > 0) {
                                $items[] = [
                                    'name'     => 'Доставка',
                                    'quantity' => 1,
                                    'price'    => (float)$order->order_delivery_cost,
                                    'tax'      => 'vat0' // ставка НДС для доставки
                                ];
                            }

                        // Пытаемся получить ссылку  и инициировать оплату, если пользователь выбрал "Оплатить"
                        try {
                            // 1. Генерация "безопасного" номера счёта передачи в робокассу
                                $safeOrderNumber = $this->hyphenedOrderNumber($order->order_number);

                            // 2. Используем в Description
                                $description = "Оплата заказа {$safeOrderNumber}";    

                                \Log::debug('Generating Robokassa link safeOrderNumber', [
                                    'safeOrderNumber' => $safeOrderNumber,
                                    'description' => $description,
                                ]);    
                            $robokassaService = new RobokassaService();
                            $paymentUrl = $robokassaService->generatePaymentLink(
                                (float)$order->total_product_amount + (float)$order->order_delivery_cost,
                                $order->id, // Лучше использовать числовой ID для Robokassa
                                $description,
                                $items
                            );

                            \Log::debug('Generating Robokassa link finish', [
                                'order_id' => $order->id,
                                'amount' => (float)$order->total_product_amount + (float)$order->order_delivery_cost,
                                'items_count' => count($items),
                                'paymentUrl' => $paymentUrl,
                            ]);
                                                    
                            // Обновляем запись payment_url в таблице orders
                                $order->addPaymentDetails([
                                    'payment_url' => $paymentUrl,
                                    'payment_url_expires_at' => WorkingDaysService::getExpirationDate(3) // 3 рабочих дня
                                ]);  // метод описан в модели Order
                            
                            \Log::debug('OrderController action type', [
                                'action' => $request->action ?? null,
                                'pay'       => $validated['action'] === OrderAction::PAY->value ?? null,         
                                'reserve'   => $validated['action'] === OrderAction::RESERVE->value ?? null,    
                                'preorder'  => $validated['action'] === OrderAction::PREORDER->value ?? null,
                            ]);
                            
                            match ($validated['action']) {
                                OrderAction::PAY->value         => $redirect = $this->processPayment($order, $paymentUrl, $orderMail),
                                OrderAction::RESERVE->value     => $this->processReserve($order, $orderMail),
                                OrderAction::PREORDER->value    => $this->processPreOrder($order, $orderMail),
                                default                         => throw new \InvalidArgumentException('Invalid action')
                            };
                            
                        } catch (\Exception $e) {
                            \Log::error('OrderCreating failed: '.$e->getMessage());
                            throw $e; // Пробрасываем для отката транзакции
                        }
                    } elseif ($order && $order->payment_status !== 'paid' && $user->client_type_id == '2') {
                        // Если покупатель юридическое лицо
                        try {
                            match ($validated['action']) {
                                OrderAction::RESERVE->value     => $this->processReserve($order, $orderMail),
                                OrderAction::PREORDER->value    => $this->processPreOrder($order, $orderMail),
                                default => throw new \InvalidArgumentException('Invalid action')
                            };
                            
                        } catch (\Exception $e) {
                            \Log::error('OrderCreating failed: '.$e->getMessage());
                            throw $e; // Пробрасываем для отката транзакции
                        }
                    }

                return $order; // Возвращаем только объект
            });

            return response()->json([
                'status'    => 'success',
                'orderId'   => $order->id,
                // 'clearCart' => true,            // Флаг для фронта - надо подумать... здесь может быть и предзаказ... пока ничего не передаём...
                'redirect'  => $redirect,       // Фронт сам решит куда редиректить (либо null, либо ссылка на оплату)
                'message'   => $order->is_preorder ? 'Предварительный заказ оформлен' : 'Заказ успешно создан'
            ]);
        
        } catch (\Throwable $e) {     // \Throwable — это базовый интерфейс в PHP, который реализуют: Все исключения (\Exception) и Ошибки (\Error, например TypeError)
            // Обработка ошибок с доступом к $order
            \Log::error('Order processing failed', [
                'exception' => $e,
                
            ]);

            \Log::error('Is order isset and exists', [
                'isset' => isset($order),
                'exists' => $order->exists,
            ]);

            if (isset($order) && $order->exists) {  
                /** isset($order) Проверяет, что переменная $order определена (не null).
                 * $order->exists Убеждается, что модель: Была успешно сохранена (save()), или Загружена из БД (find(), first() и т.д.)
                 */
                // $order->markAsFailed($e->getMessage());                             // Метод модели Order - markAsFailed инкапсулирует логику обновления статуса потом подумаем... 
                $order->update(['status_id' => OrderStatus::FAILED->value]);

                // Логируем статус
                    /* OrderStatusHistory::create([
                        'order_id'          => $order->id,
                        'old_status'        => OrderStatus::CREATED->value,                 // 2
                        'new_status'        => OrderStatus::FAILED->value,                  // 6
                        'comment'           => $e->getMessage()
                    ]);*/
                    
                    $order->changeStatus(
                        newStatus: OrderStatus::FAILED,
                        comment: $e->getMessage()
                    );
                 
                // Освобождаем резервы
                    $order->items()->each(function($item) use ($order) {
                        try {
                            $productReport = ProductReport::where('product_id', $item['product_id'])
                                ->lockForUpdate() // Решает проблему "гонки"
                                ->first();

                            \Log::error('productReport', [
                                'productReport' => $productReport,
                                'order exists' => $order->exists,
                            ]);
                            
                            if (!$productReport) { throw new \Exception("Товар ID: {$item['product_id']} не найден в отчётах по остаткам"); }
                            
                            \Log::error('is_preorder', [
                                'is_preorder' => $order->is_preorder,
                                'order exists' => $order->exists,
                            ]);
                            if($order->is_preorder) {
                                // Перед обновлением остатков двойная проверка
                                if ($productReport->preordered < $item->quantity) {
                                    \Log::warning('Invalid preorder quantity', [
                                        'current' => $productReport->preordered,
                                        'requested' => $item->quantity
                                    ]);
                                    $productReport->preordered = 0;
                                } else {
                                    $productReport->decrement('preordered', $item->quantity);
                                    $productReport->increment('on_preorder', $item->quantity);
                                }
                                /* $productReport->update([
                                    'preordered'  => (int)$productReport->preordered - (int)$item['quantity'],
                                ]); */
                            } else {
                                if ($productReport->reserved < $item->quantity) {
                                    \Log::warning('Invalid reserved quantity', [
                                        'current' => $productReport->reserved,
                                        'requested' => $item->quantity
                                    ]);
                                    $productReport->reserved = 0;
                                } else {
                                    $productReport->decrement('reserved', $item->quantity);
                                    $productReport->increment('on_sale', $item->quantity);
                                }
                                /* $productReport->update([
                                    'reserved'  => (int)$productReport->reserved - (int)$item['quantity'],
                                ]);*/   
                            }

                            $productReservation = ProductReservation::where('product_id', $item['product_id'])->where('order_id', $order->id)
                                ->lockForUpdate() 
                                ->first();
                            if (!$productReservation) { throw new \Exception("Товар ID: {$item['product_id']} не найден в отчётах по резервированию"); }
                            $productReservation->update([
                                'cancelled_at' => now(),
                            ]);     
                        } catch (\Exception $e) {
                            \Log::error("Ошибка снятия товара с резерва", [
                                'product_id' => $item['id'],
                                'error' => $e->getMessage()
                            ]);
                        }
                    });

            } else {
                // Заказа нет в БД — что-то пошло не так при создании
                \Log::error('Order failed, missing in DB', [
                    'order_id' => $order->id ?? null,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user' => auth()->id(),
                    'items' => $items ?? null
                ]);
            }

            ErrorNotifierService::notifyAdmin($e, [
                'order_id'      => $order->id ?? null,
                'stage'         => 'OrderController@create'
            ]);
                    
            return response()->json([
                'status'        => 'error',
                'message'       => 'Ошибка при оформлении заказа',
                'error'         => config('app.debug') ? $e->getMessage() : null,
                'error_code'    => 'ORDER_CREATION_FAILED'
            ], 500);
        }
    }      

    public function showSuccess(Request $request) {
        \Log::debug('Robokassa Success Data:', $request->all());

        \Log::debug('Success URL Cookies:', [
            'all_cookies' => $request->cookies->all(),
            'order_auth_cookie' => $request->cookie('order_access_hash'),
            'session_cookie' => $request->cookie('laravel_session')
        ]);

        // Получаем данные из POST-данных
        $orderId = (int)$request->input('InvId');
        $outSum = $request->input('OutSum');
        $receivedSignature = strtolower($request->input('SignatureValue'));

        if (!$orderId) {
            \Log::error('Robokassa Success: Missing InvId', $request->all());
            return redirect('/')->with('error', 'Не удалось обработать платёж');
        }

        \Log::debug('Robokassa Success Call', [
            'user' => Auth::check(),
            'all_input' => $request->all(),
            'headers' => $request->headers->all()
        ]);

        // 1. Формируем строку для подписи
            $signatureString = implode(':', [
                $outSum,
                $orderId,
                config('services.robokassa.password1')  // Используем Password1!
            ]);    

            $expectedSignature = md5($signatureString);

        // 2. Сравниваем подписи
            if ($receivedSignature !== $expectedSignature) {
                \Log::error('Invalid Robokassa signature', [
                    'received'          => $receivedSignature,
                    'expected'          => $expectedSignature,
                    'signature_string'  => $signatureString,    // Для отладки
                    'error'             => 'Ошибка проверки подписи платежа в showSuccess'
                ]);
                return redirect('/')->with('error', 'Ошибка проверки подписи платежа');
            }
        
        // 3. Если подпись верна — обрабатываем заказ
            $order = Order::findOrFail($orderId);

            \Log::debug('Auth check before', [
                'user' => Auth::check(),
                'order_client_id' => $order->order_client_id,
                'auth_id' => auth()->id(),
                'is_verified' => auth()->check() ? auth()->user()->hasVerifiedEmail() : 'guest',
                'cookies' => request()->cookies->all(),
                'session_id' => session()->getId()
            ]);

        // 4. Для авторизованных: проверяем владельца 
            /* if ($order->order_client_rank_id !== '8') {
                Auth::loginUsingId($order->order_client_id);
                \Log::debug('Auth check passed', [
                    'order_client_id' => $order->order_client_id,
                    'auth_id' => auth()->id(),
                    'is_verified' => auth()->user()->hasVerifiedEmail(),
                ]);
                return redirect()->route('privateorder.track', $order->access_hash);
            } */

            if (Auth::check()) {
                if ($order->order_client_id == auth()->id()) {
                   \Log::debug('Owner confirmed', ['access_hash' => $order->access_hash]);
                   return redirect()->route('privateorder.track', $order->access_hash);

                } else {
                    \Log::warning('Access denied for order', [
                        'order_id' => $order->id,
                        'expected_user' => $order->order_client_id,
                        'actual_user' => auth()->id()
                    ]);
                    abort(403, 'Это не ваш заказ');
                }
            }
            
        // 5. Для гостей: редирект на страницу заказа с хешем
            return redirect()->route('order.track', $order->access_hash);
    }

    public function showFailed(Request $request) {
        \Log::debug('Robokassa Failed Data:', $request->all());
       
        // Получаем данные из POST-данных
        $orderId = (int)$request->input('InvId');
        $outSum = $request->input('OutSum');
        $receivedSignature = strtolower($request->input('SignatureValue'));

        if (!$orderId) {
            \Log::error('Robokassa Success: Missing InvId', $request->all());
            return redirect('/')->with('error', 'Не удалось обработать платёж');
        }

        // Проверяем существование заказа до проверки подписи
        $order = Order::find($orderId);
        if (!$order) {
            \Log::error('Robokassa Failed: Order not found', ['orderId' => $orderId]);
            return redirect('/')->with('error', 'Заказ не найден');
        }

        // 1. Формируем строку для подписи
            $signatureString = implode(':', [
                $outSum,
                $orderId,
                config('services.robokassa.password1')  // Используем Password1!
            ]);    

            $expectedSignature = md5($signatureString);

        // 2. Сравниваем подписи
            if ($receivedSignature !== $expectedSignature) {
                \Log::error('Invalid Robokassa signature', [
                    'received'          => $receivedSignature,
                    'expected'          => $expectedSignature,
                    'signature_string'  => $signatureString,    // Для отладки
                    'error'             => 'Ошибка проверки подписи платежа в showFailed'
                ]);
                return redirect('/')->with('error', 'Ошибка проверки подписи платежа');
            }
        
        // 3. Если подпись верна — обрабатываем заказ
            // $order = Order::findOrFail($orderId);    // findOrFail() выбросит 404, если заказ не найден. Возможно, лучше сначала проверить существование заказа до проверки подписи?
        
        // 4. Обновляем статус только если он еще не FAILED
            if ($order->payment_status !== PaymentStatus::FAILED->value) {
                $order->update([
                    'payment_status' => PaymentStatus::FAILED->value
                ]);
        // 5. Обновляем запись payment_url в таблице orders        
                $order->addPaymentDetails([
                    'failed_at' => now()->toDateTimeString(),
                    'failure_reason' => 'User returned from payment page'
                ]);  // метод описан в модели Order
                
                \Log::info('Order payment status set to FAILED', ['orderId' => $orderId]);
            }
        
        // 6. Рассуждения: снятие товаров с резерва будет инициировано в App\Console\Commands\CheckExpiredReservations.php, где мы отслеживаем статус товара в резерве более 3-х дней (или сколько мы решим)
            /** Из документации Робокассы (https://docs.robokassa.ru/pay-interface/#fail): 
             * Переход пользователя по данному адресу, строго говоря, не означает окончательного отказа покупателя от оплаты, 
             * нажав кнопку «Назад» в браузере он может вернуться на страницу оплаты Robokassa. 
             * Поэтому в случае блокировки товара на складе под заказ, для его разблокирования желательно проверять факт отказа 
             * от платежа запросом XML-интерфейса получения состояния оплаты счета, 
             * используя в запросе номер счета InvId имеющийся в базе данных магазина/продавца.
             */

        // 7. Авторизация для не-гостевых заказов
            if ($order->order_client_rank_id !== '8') {
                Auth::loginUsingId($order->order_client_id);
                \Log::debug('Auth check passed', [
                    'order_client_id' => $order->order_client_id,
                    'auth_id' => auth()->id(),
                    'is_verified' => auth()->user()->hasVerifiedEmail(),
                ]);
            }
            
        // 8. Редирект на главную страницу
            return redirect('/')->with('error', 'Ошибка проведения платежа');

        // Можно перенаправить на страницу заказа с более детальной информацией
            /* return redirect()->route('orders.show', $orderId)
                ->with('error', 'Оплата не была завершена. Вы можете повторить попытку оплаты.'); */
    }
        
    private function resolveUser($request): ?User {
        \Log::debug('OrderController request:', [ 'user' => $request->all(),]);

        if (Auth::check()) {
            \Log::debug('OrderController@resolveUser check authed:', [ 'isAuthed' => Auth::check()]);
            return Auth::user();
        } else {
            \Log::debug('OrderController@resolveUser check authed:', [ 'user' => '!authed',]);
        }
        
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
        \Log::debug('trackOrder Auth check before', [
            'user' => Auth::check(),
            'order_client_id' => $order->order_client_id,
            'auth_id' => auth()->id(),
            'is_verified' => auth()->check() ? auth()->user()->hasVerifiedEmail() : 'guest',
            'cookies' => request()->cookies->all(),
            'session_id' => session()->getId()
        ]);

        $paymentDetails = $order->payment_details 
            ? json_decode($order->payment_details, true) 
            : [];

        try {
            if ($order->access_expires_at?->isPast()) {
                return Inertia::render('OrderExpired');
            }

            \Log::debug('status_id:', [ 'history' => OrderStatus::tryFrom((int)$order->status_id)?->title()]);
            \Log::debug('Loaded statusHistory:', [
                'type' => get_class($order->statusHistory),
                'first_item' => $order->statusHistory->first()?->toArray()
            ]);

            \Log::debug('Client type check', [
                'client_type_id' => $order->order_client_type_id,
                'invoice_url_generated' => $order->order_client_type_id == '2'
            ]);

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
                            'history' => $order->statusHistory?->map(function(OrderStatusHistory $item) {       // Оператор null-safe (?.) Автоматически обрабатывает случай, когда statusHistory равен null.
                                \Log::debug('History item raw:', ['history' => $item->new_status->title()]);    
                                return [
                                    'date'      => Carbon::parse($item->created_at)->format('d.m.Y H:i'),            // Преобразуем строку в Carbon
                                    'status'    => $item->new_status?->title() ?? 'Неизвестный статус',            
                                    'comment'   => $item->comment
                                ];
                            })->toArray() ?? [] // Возвращаем пустой массив если history null
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
                            // отправить ссылку только, если заказ от юридического лица:
                            'invoice_url' => $order->order_client_type_id === 2 // Сравниваем с числом, а не строкой
                                ? '/invoice/' . $order->access_hash 
                                : null,
                            'payment_url' => $this->resolvePaymentUrl($order, $paymentDetails)['url'] ?? null                   // отправить только, если ссылка активна, заказ, не оплачен
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

    // Отслеживание заказа (приватная, для авторизованных пользователей)
    public function trackPrivateOrder(Order $order) {
        \Log::debug('TrackPrivateOrder Auth check before', [
            'user' => Auth::check(),
            'order_client_id' => $order->order_client_id,
            'auth_id' => auth()->id(),
            'is_verified' => auth()->check() ? auth()->user()->hasVerifiedEmail() : 'guest',
            'cookies' => request()->cookies->all(),
            'session_id' => session()->getId()
        ]);

        \Log::debug('TrackPrivateOrder started', ['order_id' => $order->id, 'order_client_id' => $order->order_client_id, 'user_id' => auth()->id()]);

        // 1. Строгая проверка владельца
        if ($order->order_client_id !== auth()->id()) {
            \Log::warning('Order access denied', [
                'order_user' => $order->user_id,
                'current_user' => auth()->id()
            ]);
            abort(403, 'Это не ваш заказ');
        }

        $paymentDetails = $order->payment_details 
            ? json_decode($order->payment_details, true) 
            : [];

        try {
            // 2. Проверка истечения срока доступа
            if ($order->access_expires_at?->isPast()) {
                \Log::debug('Order expired', ['expires_at' => $order->access_expires_at]);
                return Inertia::render('OrderExpired');
            }

            \Log::debug('LegalOrder status_id:', [ 'history' => OrderStatus::tryFrom((int)$order->status_id)?->title($order->getDeliveryEstimate())]);
            \Log::debug('LegalOrder Loaded statusHistory:', [
                'type' => get_class($order->statusHistory),
                'first_item' => $order->statusHistory->first()?->toArray()
            ]);

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
                            'history' => $order->statusHistory?->map(function(OrderStatusHistory $item) use ($order) {       // Оператор null-safe (?.) Автоматически обрабатывает случай, когда statusHistory равен null.
                                \Log::debug('History item raw status:', [
                                    'new_status' => $item->new_status,
                                    'target_status' => OrderStatus::PREORDER
                                ]);

                                $latestDate = $item->new_status === OrderStatus::PREORDER
                                    ? $order->getDeliveryEstimate()
                                    : null;
                                \Log::debug('Calculated date:', ['date' => $latestDate]);   
                                return [
                                    'date'      => Carbon::parse($item->created_at)->format('d.m.Y H:i'),            // Преобразуем строку в Carbon
                                    'status'    => $item->new_status?->title($latestDate),            
                                    'comment'   => $item->comment
                                ];
                            })->toArray() ?? [] // Возвращаем пустой массив если history null
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
                            // отправить ссылку только, если заказ от юридического лица:
                            'invoice_url' => $order->order_client_type_id === 2 // Сравниваем с числом, а не строкой
                                ? '/invoice/' . $order->access_hash 
                                : null,
                            'payment_url' => $this->resolvePaymentUrl($order, $paymentDetails)['url'] ?? null   // отправить только, если ссылка активна, заказ, не оплачен
                        ]
                    ]
                ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Ошибка загрузки данных для просмотра статуса заказа в OrderController@trackPrivateOrder',
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

    // переводим номер счёта типа 1-25-07/12 в 1-25-07-12
    public function hyphenedOrderNumber($orderNumber) {
        // Заменяем недопустимые символы на дефис
        return preg_replace('/[\/\- ]/', '-', $orderNumber);
    }
    
    // Получаем ссылку в Робокассу для оплаты заказа (если она действительна)
    protected function resolvePaymentUrl(Order $order, array $paymentDetails): ?array {
        // Условия, когда ссылка НЕ должна отображаться:
        if ($order->payment_status === 'paid' || 
            empty($paymentDetails['payment_url']) || 
            now()->gt($paymentDetails['payment_url_expires_at'])) {
            return null;
        }

        $expiresAt = Carbon::parse($paymentDetails['payment_url_expires_at']);

        \Log::debug('Final payment URL', [
            'url' => $paymentDetails['payment_url'],
            'is_string' => is_string($paymentDetails['payment_url']),
            'contains_src' => str_contains($paymentDetails['payment_url'], "src='")
        ]);
    
        return [
            'url' => $paymentDetails['payment_url'],
            'is_expiring_soon' => now()->diffInHours($expiresAt) < 24,
            'expires_in_hours' => now()->diffInHours($expiresAt)
        ];

        // return $paymentDetails['payment_url'];
    }

    // Прямая переадресация покупателя по ссылке оплаты Робокассы, если он выбирает флаг "Оплатить":
    public function processPayment($order, $paymentUrl, $orderMail) {
        \Log::debug('OrderController processPayment start', [
            'order'         => $order ?? null,
            'paymentUrl'    => $paymentUrl ?? null,         
            'orderMail'     => $orderMail ?? null,    
        ]);

        \Log::debug('OrderController processPayment', [
            'order_id' => $order->id,
            'payment_url' => $paymentUrl,
            'session_id' => session()->getId()
        ]);

        // надо подумать когда отправлять пользователю письмо со ссылкой на опату заказа
        try {
            if (!Str::isUrl($paymentUrl)) {
                throw new \Exception("Invalid payment URL: {$paymentUrl}");
            }
            
            // 2. Обновляем статус
            $order->update(['status_id' => OrderStatus::RESERVED->value]);

            \Log::debug('Attempting redirect to:', ['url' => $paymentUrl]);

            // 5. Логируем статус
            OrderStatusHistory::create([
                'order_id'          => $order->id,
                'old_status'        => OrderStatus::CREATED->value,                 // 2
                'new_status'        => OrderStatus::RESERVED->value,                // 3
                'comment'           => 'Продавец подтвердил заказ'
            ]);

            return $paymentUrl;

        } catch (\Exception $e) {
            \Log::error('Payment processing failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            ErrorNotifierService::notifyAdmin($e, [
                'order_id' => $order->id ?? null,
                'error' => $e->getMessage(),
                'stage' => 'OrderController@processPayment'
            ]);
            
            return back()->withErrors('Ошибка при переходе к оплате');
        }       
    }

    // Авторизованному пользователю, выбравшему "зарезервировать" (отложенная оплата ): 
    public function processReserve($order, $orderMail) {
        // Явная проверка на false
        if ($order->is_client_informed !== false) {
            return;
        }

        // 9. Отправляем заказ по email... сразу
        try {
            \Log::debug('OrderController processReserve emailing order:', [ 'order' => $order]);
            $recipients = [$order->email];
    
            // Добавляем email организации для юрлиц
            if ($order->order_client_type_id == 2) {
                $user = User::find($order->order_client_id);
                
                if ($user && $user->email !== $order->email) {
                    $recipients[] = $user->email;
                    \Log::debug('Adding organization email:', ['org_email' => $user->email]);
                }
            }

            // Mail::to($order->email)->bcc(config('mail.admin_email'))->send($orderMail);
            // ПРАВИЛЬНЫЙ вариант - все получатели в to, админ в bcc
            Mail::to($recipients)
                ->bcc([
                    config('mail.admin_email'),
                    config('mail.boss_email')
                ])
                ->send($orderMail);

            // 10. Только после успеха обновляем статус
            $order->update([
                'status_id'             => OrderStatus::RESERVED->value,
                'is_client_informed'    => true,
                // 'informed_at'        => now() // Для аналитики
            ]);

            // 11. Логируем статус
            OrderStatusHistory::create([
                'order_id'          => $order->id,
                'old_status'        => OrderStatus::CREATED->value,                 // 2
                'new_status'        => OrderStatus::RESERVED->value,                // 3
                'comment'           => 'Пользователь подтвердил заказ'
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to send order email: '.$e->getMessage());
            
            ErrorNotifierService::notifyAdmin($e, [
                'order_id' => $order->id ?? null,
                'payment_system' => 'robokassa',
                'error' => $e->getMessage(),
                'stage' => 'OrderController@create for postponed payment processReserve method Mailing process'
            ]);
        }
    }

// Авторизованному пользователю, выбравшему "Предзаказ" (пока отложенная оплата ): 
    public function processPreOrder($order, $orderMail) {
        // Явная проверка на false
        if ($order->is_client_informed !== false) {
            return;
        }

        // 9. Отправляем заказ по email... сразу
        try {
            // Mail::to($order->email)->bcc(config('mail.admin_email'))->send($orderMail);
            $recipients = [$order->email];
    
            // Добавляем email организации для юрлиц
            if ($order->order_client_type_id == 2) {
                $user = User::find($order->order_client_id);
                
                if ($user && $user->email !== $order->email) {
                    $recipients[] = $user->email;
                    \Log::debug('Adding organization email:', ['org_email' => $user->email]);
                }
            }

            // Mail::to($order->email)->bcc(config('mail.admin_email'))->send($orderMail);
            // ПРАВИЛЬНЫЙ вариант - все получатели в to, админ в bcc
            Mail::to($recipients)
            //  ->bcc(config('mail.admin_email'))
                ->bcc([
                    config('mail.admin_email'),
                    config('mail.boss_email')
                ])
                ->send($orderMail);

        } catch (\Exception $e) {
            \Log::error('Failed to send Preorder email: '.$e->getMessage());
            
            ErrorNotifierService::notifyAdmin($e, [
                'order_id' => $order->id ?? null,
                'error' => $e->getMessage(),
                'stage' => 'OrderController@processPreOrder method Mailing process'
            ]);
        }
    }

    protected function reserveProduct(
            int $productId, 
            int $quantity,
            string $stockField, // 'on_preorder' или 'on_sale'
            string $reservedField // 'preordered' или 'reserved'
        ) {
        $productReport = ProductReport::where('product_id', $productId)
            ->lockForUpdate()
            ->firstOrFail(); // Автоматически выбрасывает исключение
            
        if ($productReport->{$stockField} < $quantity) {
            throw new \Exception("Недостаточно товара ID: $productId для резервирования");
        }

        $productReport->update([
            $stockField => $productReport->{$stockField} - $quantity,
            $reservedField => $productReport->{$reservedField} + $quantity,
        ]);
    }
}