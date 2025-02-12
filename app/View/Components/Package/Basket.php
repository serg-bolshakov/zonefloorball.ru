<?php

namespace App\View\Components\Package;
use Illuminate\Http\Request; // подключим класс Request
use App\Models\Product;
use App\Models\Transport;
use App\Models\Order;
use App\Models\OrdersCount;
use App\Models\ProductReport;
use App\Models\User;
use App\Models\Discount;

use App\Services\DiscountService;

use App\Traits\CategoryTrait;
use App\Traits\CalculateDiscountTrait;
use App\Traits\OrderHelperTrait;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

use Illuminate\Support\Facades\Auth; // Получение аутентифицированного пользователя 16.12.2024 
# вам часто будет требоваться взаимодействовать с текущим аутентифицированным пользователем. 
# При обработке входящего запроса вы можете получить доступ к аутентифицированному пользователю с помощью метода user фасада Auth:

# для отправки по электронной почте уведомления продавцу, что формлен новый заказ, импортируем:
use App\Mail\NewOrder;
use App\Mail\NewOrderForCustomer;
use App\Mail\OrderInvoice;
use App\Mail\OrderReserve;

use Illuminate\Support\Facades\Mail;        // Чтобы отправить сообщение, используем метод to фасада Mail

class Basket extends Component
{
    use CategoryTrait;
    use OrderHelperTrait;
    use CalculateDiscountTrait;
    
    public function __construct(Request $request)
    {
        // dd($request);
        
        $this->request = $request;        // это используется!
        $this->transport = '0';
        
        if($request->transport)         { $request->flash();                                }    // Метод flash класса Illuminate\Http\Request будет сохранять входные данные в сессии, чтобы они были доступны только во время следующего запроса пользователя к приложению:
        if($request->old('transport'))  { $this->transport = $request->old('transport');    }    // Чтобы получить кратковременно сохраненные входные данные из предыдущего запроса, вызовите метод old экземпляра Illuminate\Http\Request. Метод old извлечет ранее записанные входные данные из сессии:    

        // если в теле запроса мы видим orgerContent, значит это новый заказ    
        if($request->orderContent)      { $this->orderContent = $request->orderContent; $request->flash(); }     
    }

    public function render(): View|Closure|string
    {
        $user = '';
        $representPerson = ''; // Представитель компании
        $rankDiscount = $rankDiscountPercent = NULL;
        $orderClientTypeId = 1;

        // если пользователь авторизован, нужно получить его данные для возможного оформления заказов:
        if(Auth::check()) {
            // Получаем пользователя с загруженным отношением rank
            $user = Auth::user()->load('rank');
            
            // если авторизовано юридическое лицо, получаем его вместе с представителем:
            if($user->client_type_id == '2') {
                $orderClientTypeId = 2;
                $representPerson = User::find($user->this_id);
            }
        }

        // dd($this->request);
        if($this->request->orderContent)      { 
            // сначала нужно получить номер нового заказа:
            $orderNumber = $this->checkCountOrdersParams($orderClientTypeId);

            $orderStatusId            = 1;    // on default - pending
            // если товар резервируется, мы должны указать статус заказа id = 2 (reserved):
            if    ($this->request->actionButton == 'reserve') { $orderStatusId = 2; }
            elseif($this->request->actionButton == 'pay')     { $orderStatusId = 3; }       // confirmed

            $orderPaymentMethodId     = 2;    // on default - online
            if    ($this->request->actionButton == 'reserve' && $this->request->orderClientId == '2') { 
                $orderPaymentMethodId = 4;  // bank_transfer
            }

            $orderRecipientNames = '';
            if    (isset($user->client_type_id) && ($user->client_type_id == '1')) {$orderRecipientNames = $user->pers_surname . ' ' . $user->name; }
            elseif(isset($user->client_type_id) && ($user->client_type_id == '2')) {$orderRecipientNames = $user->name;   }

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
            if(!Auth::check() && $this->request->orderClientId == '0') {
                $newUnregisterdCustomer = new User;
                $newUnregisterdCustomer->client_rank_id = 8;        // Не зарегистрированный
                $newUnregisterdCustomer->user_access_id = 6;        // guest   
                $newUnregisterdCustomer->name = $this->request->orderRecipientName;
                $newUnregisterdCustomer->pers_surname = $this->request->orderRecipientSurname;
                $newUnregisterdCustomer->pers_tel = $this->request->orderRecipientTel;
                $newUnregisterdCustomer->delivery_addr_on_default = $this->request->orderDeliveryAddress;
                $newUnregisterdCustomer->action_auth_id = "0";
                $newUnregisterdCustomer->save();
                $newUnregisterdCustomerId = $newUnregisterdCustomer->id;
                //dump($newUnregisterdCustomerId);

                // добавляем в БД новый заказ и получаем его id, который можно будет сразу использовать... 
                $newOrder = new Order;
                $newOrder->seller_id = $this->request->orderSellerId;
                $newOrder->order_number = $orderNumber;
                $newOrder->order_client_type_id = 1;                // person - Физическое лицо
                $newOrder->order_client_rank_id = 8;                // Не зарегистрированный
                $newOrder->order_client_id = $newUnregisterdCustomerId;
                $newOrder->products_amount = $this->request->orderProductsAmount;
                $newOrder->order_delivery_cost = $this->request->orderDeliveryCost;
                $newOrder->is_order_amount_includes_taxes = $this->request->isOrderAmountIncludesTaxes;
                $newOrder->order_payment_method_id = $this->request->orderPaymentMethodId;
                $newOrder->order_transport_id = $this->request->orderTransportId;
                $newOrder->order_delivery_address = $this->request->orderDeliveryAddress;
                $newOrder->order_recipient_names = $this->request->orderRecipientNames;
                $newOrder->order_status_id = $orderStatusId;
                $newOrder->order_recipient_tel = $this->request->orderRecipientTel;
                $newOrder->order_content = $this->request->orderContent;
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

                // записываем в сессию id нового заказа:
                session()->flash('newOrderId', $newOrderId);
                session()->flash('flash', 'Спасибо за заказ! Мы уже начали собирать его. Остаёмся на связи!');
/*
                // Подготовка данных для отправки в Robokassa
                $merchantLogin = "demo"; // Идентификатор магазина
                $password1 = "password_1"; // Пароль #1 из настроек Robokassa
                $merchantLogin = "demo"; // Идентификатор магазина
                $password1 = "password_1"; // Пароль #1 из настроек Robokassa
                $outSum = "100.00"; // Сумма заказа
                $invId = 123; // Уникальный идентификатор заказа
                $description = "Покупка спортивных товаров"; // Описание заказа

                // Формируем контрольную сумму
                $signatureValue = md5("$merchantLogin:$outSum:$invId:$password1");

                // Формируем URL для перенаправления пользователя на страницу оплаты
                $robokassaUrl = "https://auth.robokassa.ru/Merchant/Index.aspx?" .
                    "MerchantLogin=$merchantLogin&OutSum=$outSum&InvId=$invId" .
                    "&Description=$description&SignatureValue=$signatureValue";

                // Перенаправляем пользователя на страницу оплаты
                header("Location: $robokassaUrl");
                exit;
*/
                return redirect('/');
            // если заказ оформляет зарегистрированный пользователь - смотрим это физическое лицо или юридическое (orderClientTypeId)
            } elseif(!empty($user)) {
                // создаём заказ от авторизованного(!) пользователя: добавляем в БД новый заказ и получаем его id, который можно будет сразу использовать... 
                $newOrder = new Order;
                $newOrder->seller_id = $this->request->orderSellerId;
                $newOrder->order_number = $orderNumber;
                $newOrder->order_client_type_id = $user->client_type_id;
                $newOrder->order_client_rank_id = $user->client_rank_id;
                $newOrder->order_client_id = $user->id;
                $newOrder->products_amount = $this->request->orderProductsAmount;
                $newOrder->order_delivery_cost = $this->request->orderDeliveryCost;
                $newOrder->is_order_amount_includes_taxes = $this->request->isOrderAmountIncludesTaxes;
                $newOrder->order_payment_method_id = $orderPaymentMethodId;
                $newOrder->order_transport_id = $this->request->orderTransportId;
                $newOrder->order_delivery_address = $this->request->orderDeliveryAddress;
                $newOrder->order_recipient_names = $orderRecipientNames;
                $newOrder->order_status_id = $orderStatusId;
                $newOrder->order_recipient_tel = $orderRecipientTel;
                $newOrder->order_content = $this->request->orderContent;
                $newOrder->is_client_informed = 1;
                $newOrder->save();
                $newOrderId = $newOrder->id;
                
                // ставим в резерв, оформленные в заказе товары (id, quantity), - нужно "распарсить" $orderContent:
                // $this->makeReserveForOrderedProducts($this->request->orderContent);

                // логируем полученные покупателем скидки: вызываем сервис для логирования (применения - закомментировал) скидок:
                // если они есть...
                $discountService = new DiscountService();
                $discountService->applyDiscount($newOrder, $user);
                
                // Создаём экземпляр Mailable
                if($user->client_type_id == '1') {
                    $orderMail = new OrderReserve($newOrder, $user);
                } elseif($user->client_type_id == '2') {
                    $orderMail = new OrderInvoice($newOrder, $user);
                }
                
                // Генерируем уникальное имя для PDF
                $sanitizedOrderNumber = $orderMail->sanitizeOrderNumber($orderNumber);
                $salt = $orderMail->encryptOrderNumber($sanitizedOrderNumber);
                $relativePath = 'storage/invoices/invoice_' . $sanitizedOrderNumber . '_' . $salt . '.pdf';

                // Сохраняем путь к PDF в базу данных
                $newOrder->order_url_semantic = $relativePath;
                $newOrder->save();

                if($user->client_type_id == '1') {
                    // Пересоздаём экземпляр OrderReserve с обновлённым объектом $newOrder
                    $orderMail = new OrderReserve($newOrder, $user);
                } elseif ($user->client_type_id == '2') {
                    // Пересоздаём экземпляр OrderInvoice с обновлённым объектом $newOrder
                    $orderMail = new OrderInvoice($newOrder, $user);
                }

                // Генерируем и сохраняем PDF
                $orderMail->buildPdfAndSave($relativePath);

                // Отправляем письмо для юридических лиц - это счёт на предоплату
                Mail::to('serg.bolshakov@gmail.com')
                //->bcc(['ralphseonn@gmail.com', 'ivkrlv@yandex.ru'])
                ->send($orderMail);

                // записываем в сессию id нового заказа:
                session()->flash('newOrderId', $newOrderId);
                session()->flash('flash', 'Спасибо за заказ! Мы уже начали собирать его. Остаёмся на связи!');

                return redirect('/profile');
            }          
        }      

        $info = [];
        $info['transportInfo']['delivery_way_view'] = '';
        $info['transportInfo']['delivery_cost'] = '';
        $info['transportInfo']['delivery_method_id'] = '';
        $info['neworderid'] = '';

        if(session('newOrderId')) { $info['neworderid'] = session('newOrderId'); }

        if($this->transport > 0) {
            $transportId = $this->transport;
            $transport = Transport::where('id', $transportId)->first();
            $info['transportInfo']['delivery_way_view'] = $transport->delivery_way_view;
            $info['transportInfo']['delivery_cost'] = $transport->delivery_cost;
            $info['transportInfo']['delivery_method_id'] = $transport->id;
        }

        $prodsInBasketIdsArr = [];

        $prodsInBasketIdsStr = $this->request->basketlistfromlocalstorage;
        $data = json_decode($prodsInBasketIdsStr);
        // dd($data);
        if($data) {
            foreach($data as $key=>$elem) {
                $prodsInBasketIdsArr[] = $key;
            }
        } 
        
        $productsArr = [];
        
        if(!empty($prodsInBasketIdsArr)) {
           
            $products = Product::with(['actualPrice', 'regularPrice', 'productReport', 'productShowCaseImage'])
                ->where('product_status_id', '=', 1)
                ->when($prodsInBasketIdsArr, function ($query, $prodsInBasketIdsArr) {
                    $query->whereIn('id', $prodsInBasketIdsArr);
                })
            ->get();
            
            $i = 0;
        
            // если пользователь авторизован, мы должны проверить какие скидки ему доступны (по умолчанию, согласно рангу):
            if(!empty($user->rank->price_discount) && ($user->rank->price_discount > 0)) {
                $rankDiscountPercent = $user->rank->price_discount;
            }

            foreach($products as $product) {
                $key = $product->id;
                $prodQuantityInBasket = $data->$key->quantity;
                $prodQuantityOnSale = $product->productReport->on_sale;
                
                $productsArr[$i]['id'] = $product->id;
                $productsArr[$i]['title'] = $product->title;
                $productsArr[$i]['prod_url_semantic'] = $product->prod_url_semantic;
                $productsArr[$i]['img_link'] = $product->productShowCaseImage->img_link;
                $productsArr[$i]['on_sale'] = $product->productReport->on_sale;
                $productsArr[$i]['article'] = $product->article;
                
                $productsArr[$i]['price_actual'] = $product->actualPrice->price_value  ?? NULL;
                $productsArr[$i]['price_regular'] = $product->regularPrice->price_value  ?? NULL;
                
                // Работаем с примененим системы скидок:
                $productsArr[$i]['price_with_rank_discount'] = $productsArr[$i]['percent_of_rank_discount'] = NULL;
                $productsArr[$i]['price_with_action_discount'] = $productsArr[$i]['summa_of_action_discount'] = NULL; // это скидки по "акциям"

                // если в корзину идёт регулярная цена (без скидки), подсчитаем цену со скидкой, в зависимости от ранга покупателя: 
                if(+$product->actualPrice->price_value == +$product->regularPrice->price_value) {
                    if($rankDiscountPercent) {
                        $productsArr[$i]['price_with_rank_discount'] = round($product->regularPrice->price_value - ($product->regularPrice->price_value * ($rankDiscountPercent / 100))); 
                        $productsArr[$i]['percent_of_rank_discount'] = $rankDiscountPercent;
                    }
                } elseif(+$product->actualPrice->price_value < +$product->regularPrice->price_value) {
                    // если есть специальная цена, нужно посмотреть какая цена меньше, ту и показываем => скидки не суммируем!
                    $actualPrice = $product->actualPrice->price_value;
                    $regularPrice = $product->regularPrice->price_value;
                    $possiblePriceWithDiscount = round($regularPrice - ($regularPrice * ($rankDiscountPercent / 100)));
                    if($possiblePriceWithDiscount < $actualPrice) {
                        $productsArr[$i]['price_with_rank_discount'] = $possiblePriceWithDiscount;
                        $productsArr[$i]['percent_of_rank_discount'] = $rankDiscountPercent;
                    } else {
                        // выводим для покупателя его выгоду от покупки товара по цене со кидкой по акции:
                        $productsArr[$i]['summa_of_action_discount'] = $regularPrice - $actualPrice;
                    }
                }
                
                $productsArr[$i]['date_end'] = NULL;
                if(+$product->actualPrice->price_value < +$product->regularPrice->price_value) {
                    $productsArr[$i]['price_special'] = $product->actualPrice->price_value;
                    $productsArr[$i]['date_end'] = $product->actualPrice->date_end  ?? NULL;
                } else {
                    $productsArr[$i]['price_special'] = NULL;
                }

                if(+$prodQuantityInBasket <= +$prodQuantityOnSale) {
                    $productsArr[$i]['quantity_to_buy'] = $prodQuantityInBasket;
                } elseif(+$prodQuantityInBasket > +$prodQuantityOnSale) {
                    $productsArr[$i]['quantity_to_buy'] = $prodQuantityOnSale;
                } else {
                    $productsArr[$i]['quantity_to_buy'] = '1';
                }
                
                $productsArr[$i]['prod_status'] = $product->product_status_id;
                $i++;
            }
        }
        //dd($productsArr);
        $info['products'] = $productsArr;
        
        //dd($user);    
        return view('components.package.basket', [
            'data' => $info,
            'user' => $user,
            'representPerson' => $representPerson,
        ]);
    }

    private function checkCountOrdersParams($orderClientTypeId) {
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

    private function makeReserveForOrderedProducts($orderContentString) {
        // следующие две строки работают неправильно!!! Оставим на память!!!
        // parse_str($orderContentString, $orderContentArr);       // Функция parse_str разбивает строку с GET параметрами в массив
        // $productsArr = array_chunk($orderContentArr, 6);        // Функция array_chunk разбивает одномерный массив в двухмерный. true - здесь лишнее, нам ключи не нужны - мы их знаем! (id, quantity, price, discountType, discountSumm)...

        $productsArr = $this->getProductsArrayFromQuerySrting($orderContentString);
        foreach($productsArr as $product) {
            $prodId = $product[0];
            $prodQuantity = $product[1];
            $this->putReserveForProduct($prodId, $prodQuantity);
        }
    }

    private function putReserveForProduct($prodId, $prodQuantity) {
        $prodQuantity = (int)$prodQuantity;
        $productReport = ProductReport::where('product_id', $prodId)->first();
        $newValueQuantityOnSale = $productReport->on_sale - $prodQuantity;
        $newValueQuantityOnReserve = (int)$productReport->reserved + $prodQuantity;
        $productReport->on_sale = $newValueQuantityOnSale;
        $productReport->reserved = $newValueQuantityOnReserve;
        $productReport->save();
    }
}
