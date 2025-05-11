<?php
// app/Http/Controllers/OrderController.php
namespace App\Http\Controllers;

# используем FormRequest для создания классов валидации входных API-запросов: 
use App\Http\Requests\StoreOrderRequest;

use App\Services\DiscountService;
use App\Models\Discount;
use App\Models\Order;
use App\Models\OrdersCount;
use App\Models\ProductReport;
use App\Models\User;
use Illuminate\Http\Request;

# для отправки по электронной почте уведомления продавцу, что формлен новый заказ, импортируем:
use App\Mail\NewOrder;
use App\Mail\NewOrderForCustomer;
use App\Mail\OrderInvoice;
use App\Mail\OrderReserve;
use Illuminate\Support\Facades\Mail;        // Чтобы отправить сообщение, используем метод to фасада Mail

use App\Traits\CalculateDiscountTrait;
use App\Traits\OrderHelperTrait;

use Illuminate\Support\Facades\Auth; // Получение аутентифицированного пользователя 16.12.2024 
# вам часто будет требоваться взаимодействовать с текущим аутентифицированным пользователем. 

use App\Enums\OrderStatus;                  // создали класс-перечисление:
use App\Enums\PaymentMethod;

/* Если вы не хотите использовать метод validate запроса, то вы можете создать экземпляр валидатора вручную, 
   используя фасад Validator. Метод make фасада генерирует новый экземпляр валидатора: */
use Illuminate\Support\Facades\Validator;


class OrderController extends Controller {
    protected $discountService;

    use OrderHelperTrait;
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

    public function create (StoreOrderRequest $request) {

        // Просмотр логов:  tail -f storage/logs/laravel.log
            /*// \Log::debug('$request:', $request); // Ошибка! Request нельзя напрямую в context
            \Log::debug('Request data:', [
                'method' => $request->method(),
                'data' => $request->all(),
                'headers' => $request->headers->all()
            ]);
            // Простой ответ для проверки
            return response()->json([
                'status' => 'success',
                'data_received' => $request->all(),
                'your_token' => $request->input('_token'),
                'is_ajax' => $request->ajax()
            ]);*/   

        
        $user = Auth::check() ? Auth::user() : null;
        \Log::debug('User data OrderController:', [
            'id' => $user?->id,
            'name' => $user?->name,
            'email' => $user?->email,
        ]);

        // Данные уже валидны! Должны быть...
        $validated = $request->validated();

        $orderData = $this->prepareOrderData($request, $user);
        
        \Log::debug('Request data:', [
            'method' => $request->method(),
            '$validated' => $validated,
            'order_number' => $this->generateOrderNumber(1),
            '$validated.products' => $validated['products'],
        ]);
        // Простой ответ для проверки
        return response()->json([
            'status' => 'success',
            'order_status_id' => 2
        ]);
        
        
        if ($this->isGuestOrder($request, $user)) {
            return $this->handleGuestOrder($request, $orderData);
        }

        return $this->handleAuthenticatedOrder($request, $user, $orderData);
        
        $orderRecipientNames = '';
        if    (isset($user->client_type_id) && ($user->client_type_id == '1')) {$orderRecipientNames = $user->pers_surname . ' ' . $user->name; }
        elseif(isset($user->client_type_id) && ($user->client_type_id == '2')) {$orderRecipientNames = $user->name;   }
        else { $orderRecipientNames = $this->request->customer->lastName . ' ' . $this->request->customer->firstName; }

        $orderRecipientTel = '';
        if    (isset($user->client_type_id) && ($user->client_type_id == '1')) {$orderRecipientTel = $user->pers_tel; }
        elseif(isset($user->client_type_id) && ($user->client_type_id == '2')) {
            if(isset($representPerson) && !empty($representPerson)) {
                $orderRecipientTel = $representPerson->pers_tel; 
            } else {
                $orderRecipientTel = $representPerson->org_tel; 
            }  // надо будет подумать какой телефон здесь указывать
        }

        // если заказ размещает незарегистрированный пользователь - мы создаём нового "человека" (неавторизованного), получаем его id и используем этот id для идентификации заказа
        if(!Auth::check() && $this->request->customer->type === 'guest') {
            $newUnregisterdCustomer = new User;
            $newUnregisterdCustomer->client_rank_id = 8;                // Не зарегистрированный
            $newUnregisterdCustomer->user_access_id = 6;                // guest   
            $newUnregisterdCustomer->name = $this->request->customer->firstName;
            $newUnregisterdCustomer->pers_surname = $this->request->customer->lastName;
            $newUnregisterdCustomer->pers_tel = $this->request->customer->phone;
            $newUnregisterdCustomer->delivery_addr_on_default = $this->request->delivery->address;
            $newUnregisterdCustomer->action_auth_id = "0";
            $newUnregisterdCustomer->save();
            $newUnregisterdCustomerId = $newUnregisterdCustomer->id;    // Получаем id нового user-а

            // добавляем в БД новый заказ и получаем его id, который можно будет сразу использовать... 
            $newOrder = new Order;
            $newOrder->order_number = $orderNumber;
            $newOrder->order_client_type_id = 1;                // person - Физическое лицо
            $newOrder->order_client_rank_id = 8;                // Не зарегистрированный
            $newOrder->order_client_id = $newUnregisterdCustomerId;
            $newOrder->products_amount = $this->request->products_amount;
            $newOrder->order_delivery_cost = $this->request->delivery->price;
            // $newOrder->is_order_amount_includes_taxes => по умолчанию 0
            $newOrder->order_payment_method_id = $orderPaymentMethodId;
            $newOrder->order_transport_id = $this->request->delivery->transportId;
            $newOrder->order_delivery_address = $this->request->delivery->address;
            $newOrder->order_recipient_names = $orderRecipientNames;
            $newOrder->order_recipient_tel = $this->request->customer->phone;
            $newOrder->email = $this->request->customer->email;
            $newOrder->order_status_id = $orderStatusId;
            $newOrder->order_content = $this->request->orderContent;    // нужно будет сформировать json-строку!!!
            $newOrder->save();
            $newOrderId = $newOrder->id;

            // ставим в резерв, оформленные в заказе товары (id, quantity), - нужно "распарсить" $orderContent:
            // $this->makeReserveForOrderedProducts($this->request->orderContent);

            // логируем полученные покупателем скидки: вызываем сервис для логирования (применения - закомментировал) скидок:
            // если они есть...
            $discountService = new DiscountService();
            $discountService->applyDiscount($newOrder, $newUnregisterdCustomer);

            // Создаём экземпляр Mailable
            $orderMail = new OrderReserve($newOrder, $newUnregisterdCustomer);

            // Генерируем уникальное имя для PDF
            $sanitizedOrderNumber = $orderMail->sanitizeOrderNumber($orderNumber);
            $salt = $orderMail->encryptOrderNumber($sanitizedOrderNumber);
            $relativePath = 'storage/invoices/invoice_' . $sanitizedOrderNumber . '_' . $salt . '.pdf';

            // Сохраняем путь к PDF в базу данных
            $newOrder->order_url_semantic = $relativePath;
            $newOrder->save();

            // Пересоздаём экземпляр OrderReserve с обновлённым объектом $newOrder
            $orderMail = new OrderReserve($newOrder, $newUnregisterdCustomer);

            // Генерируем и сохраняем PDF
            $orderMail->buildPdfAndSave($relativePath);

            // Отправляем заказ ...
            Mail::to('serg.bolshakov@gmail.com')->send($orderMail);
            
            return response()->json([
                'status' => 'success',
                'newOrderId' => $newOrderId,
            ]);
        } elseif(!empty($user)) {
            // создаём заказ от авторизованного(!) пользователя: добавляем в БД новый заказ и получаем его id, который можно будет сразу использовать... 
        }
    }

    protected function prepareOrderData($validated, User $user = null): array {
        $orderClientTypeId = $user ? $user->client_type_id : 1;
               
        return [
            'order_number' => $this->generateOrderNumber($orderClientTypeId),
            /*'order_content' => $this->createOrderContentJSON($validated['products']),
            'order_status_id' => $this->resolveOrderStatusId($request),
            'payment_method_id' => $this->resolvePaymentMethod($request),
            'recipient_info' => $this->getRecipientInfo($request, $user)*/
        ];       
    }

    protected function handleGuestOrder(Request $request, array $orderData) {
        $customer = $this->createGuestCustomer($request);
        $order = $this->createOrder($request, $orderData, $customer);
        
        $this->processOrder($order, $customer);
        
        return response()->json([
            'status' => 'success',
            'order_id' => $order->id,
            'invoice_url' => $order->order_url_semantic
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

    private function createOrderContentJSON ($orderContent) {
        //&productId_3=3&quantityProdId_3=1&priceProdId_3=340&discountTypeProdId=2&discountSummProdId=10&prodPriceRegular=350&productId_5=5&quantityProdId_5=1&priceProdId_5=3490&discountTypeProdId=1&discountSummProdId=500&prodPriceRegular=3990&productId_8=8&quantityProdId_8=1&priceProdId_8=14540&discountTypeProdId=2&discountSummProdId=450&prodPriceRegular=14990&productId_9=9&quantityProdId_9=1&priceProdId_9=3870&discountTypeProdId=2&discountSummProdId=120&prodPriceRegular=3990
        //&productId_5=5&quantityProdId_5=1&priceProdId_5=3490&discountTypeProdId=1&discountSummProdId=500&prodPriceRegular=3990
    }
    
    private function resolveOrderStatusId(Request $request):int {
        return match ($request->input('paymentMethod')) {
            'invoice' => OrderStatus::RESERVED,    // 2
            'online'  => OrderStatus::CONFIRMED,   // 3
            default   => OrderStatus::PENDING      // 1
        };
    }

    /**
     * Определяет метод оплаты на основе запроса
     * 
     * @param Request $request
     * @return int Константа из PaymentMethod::*
     */
    private function resolvePaymentMethod(Request $request):int {
        // добавим валидацию... не уверен, что она здесь нужна, но пусть будет: 
        $request->validate([
            'paymentMethod' => ['required', 'in:online,invoice'],
            'customer.type' => ['sometimes', 'in:legal,individual,guest']
        ]);

        return PaymentMethod::forRequest($request)->value;
    }
            
}