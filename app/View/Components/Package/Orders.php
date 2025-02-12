<?php

namespace App\View\Components\Package;
use Illuminate\Http\Request; // подключим класс Request
use App\Models\Product;
use App\Models\Transport;
use App\Models\Order;
use App\Models\OrdersCount;
use App\Models\OrderStatus;
use App\Models\ProductReport;
use App\Models\User;

use App\Traits\CategoryTrait;
use App\Traits\DateTrait;
use App\Traits\OrderHelperTrait;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

use Illuminate\Support\Facades\Auth; 
# вам часто будет требоваться взаимодействовать с текущим аутентифицированным пользователем. 
# При обработке входящего запроса вы можете получить доступ к аутентифицированному пользователю с помощью метода user фасада Auth:

class Orders extends Component
{
    use CategoryTrait;
    use DateTrait;
    use OrderHelperTrait;
    
    public function __construct(Request $request)
    {
        $this->request = $request;        
        $this->ordersIds = '';
        
        // если в хранилище браузера юзера есть заказы, мы получаем их здесь в результате однократного срабатывания формы из JS:
        if($request->orderslistfromlocalstorage)            {  $this->ordersIds = $request->orderslistfromlocalstorage;         }
        if($request->orderslistfromlocalstorageinheader)    {  $this->ordersIds = $request->orderslistfromlocalstorageinheader; }

        // если пользователь запросил просмотр заказа, записываем в свойство id-заказа, требующее просмотр деталей:
        if($request->orderactionselected && $request->orderactionselected == 'order-check-content') {
            $this->checkOrderNumber = $request->getorderinfonumber;
        }       
    }

    public function render(): View|Closure|string
    {
        if(Auth::check()) {
            // Получаем пользователя с загруженным отношением rank
            $user = Auth::user()->load('rank');
            
            // если авторизовано юридическое лицо, получаем его вместе с представителем:
            if($user->client_type_id == '2') {
                $orderClientTypeId = 2;
                $representPerson = User::find($user->this_id);
            }
        }

        $prodsInOrdersIdsJsonStr = $this->ordersIds;
        $prodsInOrdersIdsArr = json_decode($prodsInOrdersIdsJsonStr);
        
        $info = $orders = $ordersArr = [];

        // Если пользователь авторизован:
        if(Auth::check()) {
            // получить к нему доступ можем и так: Auth::user() ... и так: $request->user()
            $user = Auth::user();
            // посмотрим его историю заказов:
            $orders = Order::with(['status'])->where('order_client_type_id', $user->client_type_id)->where('order_client_id', $user->id)->get();
        } else {
            // если заказы(покупки) есть в хранилище браузера неавторизованного пользователя, то мы их получаем из БД по id, 
            // полученным из json-строки в результате одноразового срабатывания формы:
            if(!empty($prodsInOrdersIdsArr)) {
                # с помощью метода with заранее подгружаем две связанные модели и в этом случае при переборе товаров не будет обращений к БД при каждой итерации цикла:
                $orders = Order::with(['status'])->whereIn('id', $prodsInOrdersIdsArr)->where('is_tracking_by_client', 1)->orderByDesc('created_at')->get();
            } 
        }

        if(!empty($orders)) {
            $i = 0;
            foreach($orders as $order) {
                $ordersArr[$i]['id'] = $order->id;
                $ordersArr[$i]['order_number'] = $order->order_number;
                $ordersArr[$i]['order_date'] = $this->date_ru($order->order_date);
                $ordersArr[$i]['products_amount'] = $order->products_amount;
                $ordersArr[$i]['order_delivery_cost'] = $order->order_delivery_cost;
                $ordersArr[$i]['order_status_type_view'] = $order->status->order_status_type_view;
                $ordersArr[$i]['order_delivery_num'] = $order->order_track_num;
                $ordersArr[$i]['updated_at'] = $this->date_ru($order->updated_at);
                $ordersArr[$i]['order_cost'] = number_format((((float)$priceProducts = $order->products_amount) + ((float)$priceDelivery = $order->order_delivery_cost)), 0,",", " "); 
                $i++;
            }
        }

        $info['ordersList'] = $ordersArr;

        // если был запрос на просмотр деталей заказа, получаем его из БД, и результаты передаем в представление:
        if(isset($this->checkOrderNumber)) {

            $orderToBeCheckedNum = $this->checkOrderNumber;
            $orderToBeChecked = Order::with(['status'])->where('order_number', $orderToBeCheckedNum)->first();
            // dd($orderToBeChecked);
            $info['orderselectednumber']                = $orderToBeChecked->order_number;
            $info['orderrecipient']                     = $orderToBeChecked->order_recipient_names;
            $info['orderrecipienttel']                  = $orderToBeChecked->order_recipient_tel;
            $info['orderdeliveryaddress']               = $orderToBeChecked->order_delivery_address;
            $info['productsamount']                     = number_format(((float)$orderToBeChecked->products_amount), 0,",", " ");
            $info['orderdeliverycost']                  = $orderToBeChecked->order_delivery_cost;
            $info['ordertotalamount']                   = number_format(((float)$orderToBeChecked->products_amount) + ((float)$orderToBeChecked->order_delivery_cost), 0,",", " ");
            //$info['orderdeliverydate']                = $orderToBeChecked->order_number; - в таблице orders нет такого поля
            // получаем оформленные заказе товары (id, quantity, price), - нужно "распарсить" $orderContent:
            $info['productsList'] = $this->getOrderedProducts($orderToBeChecked->order_content);
        }

        if(isset($info['productsList']) && !empty($info['productsList'])) {
            // Извлекаем нужные элементы из productsList
            $orderdiscountsumm                  = $info['productsList']['orderdiscountsumm'];
            $ordertotalamountinregularprices    = $info['productsList']['ordertotalamountinregularprices'];
            
            // Удаляем их из productsList
            unset($info['productsList']['orderdiscountsumm']);
            unset($info['productsList']['ordertotalamountinregularprices']);

            // Добавляем их на уровень вверх
            $info['orderdiscountsumm']               = $orderdiscountsumm;
            $info['ordertotalamountinregularprices'] = $ordertotalamountinregularprices;
        }
        
        // dd($info);
        return view('components.package.orders', [
            'data' => $info,
        ]);
    }

    private function getOrderedProducts($orderContentString) {
        $res = [];
        $i = 0;
        $res['orderdiscountsumm']                  = 0;
        $res['ordertotalamountinregularprices']    = 0;
        
        $productsArr = $this->getProductsArrayFromQuerySrting($orderContentString);

        foreach($productsArr as $product) {
            $prodId = $res[$i]['id'] = $product[0];
            $prodQuantity = $res[$i]['prodQuantity'] = $product[1];
            $prodPrice = $res[$i]['prodPrice'] = number_format((float)$product[2], 0,",", " ");
            $prodAmount = $res[$i]['prodAmount'] = number_format(((float)$product[1] * (float)$product[2]), 0,",", " ");
            $prodRegularPrice = $res[$i]['prodRegularPrice'] = number_format(((float)$product[5]), 0,",", " ");
            $prodDiscountSumm = $res[$i]['prodDiscountSumm'] = number_format(((float)$product[4]), 0,",", " ");
            // для получения наименования товарной позиции, данные берём из БД:
            $prodInfo = Product::select('title', 'prod_url_semantic')->find($prodId);
            $prodTitle = $res[$i]['prodTitle'] = $prodInfo->title;
            $prodUrlSemantic = $res[$i]['prodUrlSemantic'] = $prodInfo->prod_url_semantic;
            if(!empty($product[4])) {
                $res['orderdiscountsumm'] += (float)$product[4];
            }
            if(!empty($product[5])) {
                $res['ordertotalamountinregularprices'] += (float)$product[5] * (float)$product[1];
            } else {
                $res['ordertotalamountinregularprices'] += (float)$product[2] * (float)$product[1];
            }
            $i++;
        }
        $res['orderdiscountsumm']                  = number_format((float)$res['orderdiscountsumm'], 0,",", " ");
        $res['ordertotalamountinregularprices']    = number_format((float)$res['ordertotalamountinregularprices'], 0,",", " ");
        return $res;
    }

}
