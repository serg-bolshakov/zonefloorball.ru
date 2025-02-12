<?php

namespace App\View\Components\Package;
use Illuminate\Http\Request; // подключим класс Request
use App\Models\Product;
use App\Models\Transport;
use App\Models\Order;
use App\Models\OrdersCount;
use App\Models\ProductReport;
use App\Models\Person;

use App\Traits\CategoryTrait;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Basket extends Component
{
    use CategoryTrait;
    
    public function __construct(Request $request)
    {
        $this->request = $request;        // это используется!
        $this->transport = '0';

        if($request->transport)         { $request->flash();                                }    // Метод flash класса Illuminate\Http\Request будет сохранять входные данные в сессии, чтобы они были доступны только во время следующего запроса пользователя к приложению:
        if($request->old('transport'))  { $this->transport = $request->old('transport');    }    // Чтобы получить кратковременно сохраненные входные данные из предыдущего запроса, вызовите метод old экземпляра Illuminate\Http\Request. Метод old извлечет ранее записанные входные данные из сессии:    

        if($request->orderContent)      { $this->orderContent = $request->orderContent; $request->flash(); }            
    }

    public function render(): View|Closure|string
    {
        // если поступает запрос на добавление нового заказа, записываем его в сессию, при этом получая номер заказа:
        if($this->request->orderContent)      { 
            // сначала нужно получить номер нового заказа:
            $orderNumber = $this->checkCountOrdersParams($this->request->orderSellerId);
           
            // если заказ размещает незарегистрированный пользователь - мы создаём нового "юзера", получаем его id и используем этот id для идентификации заказа
            if($this->request->orderClientId == '0') {
                $newUnregisterdCustomer = new Person;
                $newUnregisterdCustomer->client_rank_id = $this->request->orderClientRankId;
                $newUnregisterdCustomer->pers_name = $this->request->orderRecipientName;
                $newUnregisterdCustomer->pers_tel = $this->request->orderRecipientTel;
                $newUnregisterdCustomer->pers_surname = $this->request->orderRecipientSurname;
                $newUnregisterdCustomer->pers_addr = $this->request->orderDeliveryAddress;
                $newUnregisterdCustomer->action_auth_id = "0";
                $newUnregisterdCustomer->save();
                $newUnregisterdCustomerId = $newUnregisterdCustomer->id;
                //dump($newUnregisterdCustomerId);

                // добавляем в БД новый заказ и получаем его id, который можно будет сразу использовать... 
                $newOrder = new Order;
                $newOrder->seller_id = $this->request->orderSellerId;
                $newOrder->order_number = $orderNumber;
                $newOrder->order_client_type_id = $this->request->orderClientTypeId;
                $newOrder->order_client_rank_id = $this->request->orderClientRankId;
                $newOrder->order_client_id = $newUnregisterdCustomerId;
                $newOrder->products_amount = $this->request->orderProductsAmount;
                $newOrder->order_delivery_cost = $this->request->orderDeliveryCost;
                $newOrder->is_order_amount_includes_taxes = $this->request->isOrderAmountIncludesTaxes;
                $newOrder->order_payment_method_id = $this->request->orderPaymentMethodId;
                $newOrder->order_transport_id = $this->request->orderTransportId;
                $newOrder->order_delivery_address = $this->request->orderDeliveryAddress;
                $newOrder->order_recipient_names = $this->request->orderRecipientNames;
                $newOrder->order_recipient_tel = $this->request->orderRecipientTel;
                $newOrder->order_content = $this->request->orderContent;
                $newOrder->save();
                $newOrderId = $newOrder->id;
                
                // ставим в резерв, оформленные в заказе товары (id, quantity), - нужно "распарсить" $orderContent:
                $this->makeReserveForOrderedProducts($this->request->orderContent);
                
                //$this->order_email_registration($orderContent, $orderNumber);

                // записываем в сессию id нового заказа:
                session()->flash('newOrderId', $newOrderId);

                return redirect('/');
            // если заказ оформляет зарегистрированный пользователь - смотрим это физическое лицо или юридическое (orderClientTypeId)
            } elseif($this->request->orderClientTypeId == '1') {
                // получаем реквизиты зарегистрированного и авторизованного пользователя из БД
                $userType = session('user_type');
                $user_id  = session('id');
                $person = Person::select('pers_surname', 'pers_name', 'pers_tel')->where('client_type_id', $userType)->where('id', $user_id)->first();
                
                // создаём заказ от физического лица:
                // добавляем в БД новый заказ и получаем его id, который можно будет сразу использовать... 
                $newOrder = new Order;
                $newOrder->seller_id = $this->request->orderSellerId;
                $newOrder->order_number = $orderNumber;
                $newOrder->order_client_type_id = $this->request->orderClientTypeId;
                $newOrder->order_client_rank_id = $this->request->orderClientRankId;
                $newOrder->order_client_id = $this->request->orderClientId;
                $newOrder->products_amount = $this->request->orderProductsAmount;
                $newOrder->order_delivery_cost = $this->request->orderDeliveryCost;
                $newOrder->is_order_amount_includes_taxes = $this->request->isOrderAmountIncludesTaxes;
                $newOrder->order_payment_method_id = $this->request->orderPaymentMethodId;
                $newOrder->order_transport_id = $this->request->orderTransportId;
                $newOrder->order_delivery_address = $this->request->orderDeliveryAddress;
                $newOrder->order_recipient_names = $person->pers_surname . ' ' . $person->pers_name;
                $newOrder->order_recipient_tel = $person->pers_tel;
                $newOrder->order_content = $this->request->orderContent;
                $newOrder->save();
                $newOrderId = $newOrder->id;
                
                // ставим в резерв, оформленные в заказе товары (id, quantity), - нужно "распарсить" $orderContent:
                $this->makeReserveForOrderedProducts($this->request->orderContent);
                
                //$this->order_email_registration($orderContent, $orderNumber);

                // записываем в сессию id нового заказа:
                session()->flash('newOrderId', $newOrderId);

                dump($newOrderId);
                return redirect('/');
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
            //dd($products);
            $i = 0;
        
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

        $info['products'] = $productsArr;
        
        // если пользователь авторизован, нужно получить его данные для возможного оформления заказов:
        $userInfo = [];
        // dump(session()->all());
        if(session()->has('auth')) {
            // если это физическое лицо ("user_type" => 1)
            if(session('user_type') == '1') {
                $userInfo = Person::where('id', session('id'))->first();
                //dump($userInfo);
            }
        }


        //dd($info);    
        return view('components.package.basket', [
            'data' => $info,
            'userInfo' => $userInfo,
        ]);
    }

    private function checkCountOrdersParams($orderSellerId) {
        $currentTime = time();  // значение текущего времени
        $settedMonthStartTime = strtotime('first day of this month 00:00:00');
        $settedMonthEndTime = strtotime('last day of this month 23:59:59');
        $countOrdersThisMonth = 1;
        $lastOrderView = $orderSellerId . '-' . date('y') . '-' . date('m') . '/' . $countOrdersThisMonth;

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
                $lastOrderView = $orderSellerId . '-' . date('y') . '-' . date('m') . '/' . $countOrdersThisMonth;
                $result->count_orders_this_month = "$newCountValue";
                $result->last_order_number_view = "$lastOrderView";
                $result->save();
            }
        }
        return $orderSellerId . '-' . date('y') . '-' . date('m') . '/' . $countOrdersThisMonth;
    }

    private function makeReserveForOrderedProducts($orderContentString) {
        parse_str($orderContentString, $orderContentArr);       // Функция parse_str разбивает строку с GET параметрами в массив
        $productsArr = array_chunk($orderContentArr, 3);        // Функция array_chunk разбивает одномерный массив в двухмерный. true - здесь лишнее, нам ключи не нужны - мы их знаем! (id, quantity, price)...
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
