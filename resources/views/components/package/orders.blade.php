<div class="order-wrapper">
<input id="hiddenInputWithDataFromPhpOrders" type="hidden"
data-getorderactionselected="<?= !empty($_GET['orderactionselected']) ? $_GET['orderactionselected'] : '' ?>"
data-updatedorderslist="<?= !empty($data['updatedOrdersList']) ? $data['updatedOrdersList'] : '' ?>"
name="hiddenInputWithDataFromPhpOrders" value="">

@if (isset($data['ordersList']) && !empty($data['ordersList'])) 
    
    <div class="orders-table__scroll">
        <table id="ordersTable">
            <thead>
                <tr>
                    <th>Номер заказа</th>
                    <th>Дата оформления</th>
                    <th>Стоимость заказа</th>
                    <th>Текущий статус</th>
                    <th>Трек доставки / номер машины</th>
                    <th>Расчётная дата поставки / срок доставки</th>
                    <th>Дата обновления</th>
                    <th>Действие</th><!-- проверить адрес доставки / комментарий к заказу / посмотреть заказ / отменить / оставить отзыв / оформить возврат -->
                    <th>Доставка / получение</th>
                    <th>№</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['ordersList'] as $order)
                <tr>
                    <td class="td-left nbsp">{{ $order['order_number'] }}</td>
                    <td class="td-center">{{ $order['order_date'] }}</td>
                    <td class="td-right">{{ $order['order_cost'] }}&nbsp;<sup>&#8381;</sup></td>
                    <td class="nbsp">{{ $order['order_status_type_view'] }}</td>
                    <td class="nbsp">{{ $order['order_delivery_num'] }}</td>
                    <td>{{ $order['order_dispatch_date'] ?? '' }}</td>
                    <td class="td-center">{{ $order['updated_at'] }}</td>
                    <td>
                        <form id="orderChoosingActionForm_{{ $order['id'] ?? 0 }}" class="form" action="" method="GET">
                            <div class="select">
                                <a href="" class="orders-action__select"><?= (!empty($_GET["orderaction ??  0"])) ? 'Выбрана категория: ' . $_GET['orderction'] : 'Посмотреть варианты' ?></a>
                                <ul class="orders-action__drop">
                                    <li><a id="ordersAElemCheckContent_{{ $order['id'] }}" data-action="order-check-content">Посмотреть заказ</a></li>
                                    <!-- <li><a id="ordersAElemDeliveryAddress_{{ $order['id'] }}" data-action="order-check-delivery-address">Адрес доставки</a></li>
                                    <li><a id="ordersAElemWriteMessage_{{ $order['id'] }}" data-action="order-write-message-to-seller">Написать продавцу</a></li>
                                    <li><a id="ordersAElemReply_{{ $order['id'] }}" data-action="order-let-reply">Оставить отзыв</a></li>
                                    <li><a id="ordersAElemReply_{{ $order['id'] }}" data-action="order-repeat">Повторить заказ</a></li>
                                    <li><a id="ordersAElemCancel_{{ $order['id'] }}" data-action="order-cancel">Отменить заказ</a></li>
                                    <li><a id="ordersAElemReturn_{{ $order['id'] }}" data-action="order-return">Оформить возврат</a></li>
                                    <li><a id="ordersAElemDeleteFromList_{{ $order['id'] }}" data-action="order-delete-from-list">Не отслеживать</a></li> -->
                                </ul>
                                
                                <input type="hidden" id="ordersinput_{{ $order['id'] }}" name="getorderinfonumber" value="{{ $order['order_number'] ?? 0 }}" >
                                <input type="hidden" id="orderselect_{{ $order['id'] }}" name="orderactionselected" value="0" >
                            </div>
                        </form>    
                    <td><?php //echo $order['delivery_way_view'] ?></td>
                    <td>{{ $loop->iteration }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else
        <div><h1 class="basketTitle" data-checkordersindb="no-orders-to-be-viewed">У вас пока нет покупок / заказов</h1></div>
    @endif
</div>

<div id="orderCheckContentDiv" class="registration-hidden registration-addition">
@if(isset($data['productsList']) && !empty($data['productsList']))
    <img  class="close-img__order-confirmation" src="/storage/icons/icon-close.png" alt="" title="Супер! Понятно. Закрыть">

    <p class="registration-form__input-item"><span class="registration-form__title">Заказ № {{ $data['orderselectednumber'] ?? '' }}</span></p>
    
    <!-- <label class="label">Перечень товаров в заказе: </label> -->
    <div class="basket-order__product-items">
        @foreach($data['productsList'] as $prod)
        <div class="lk-orders__product-item">
            <a href="/products/card/{{ $prod['prodUrlSemantic'] ?? '' }}" alt="{{ $prod['prodTitle'] ?? '' }}" title="Кликни для перехода в карточку товара" >{{ $prod['prodTitle'] ?? '' }}</a> 
            <div class="d-flex flex-sb margin-bottom8px">
                <p>{{ $prod['prodQuantity'] }} шт. по цене:&nbsp;{{ $prod['prodPrice'] }}&nbsp;<sup>&#8381;</sup>&nbsp;на сумму:</p>
                <p>{{ $prod['prodAmount'] }}&nbsp;<sup>&#8381;</sup></p>
            </div>
            @if(!empty($prod['prodDiscountSumm'])) 
            <div class="d-flex flex-sb margin-bottom8px">
                <p>Применена скидка на товар:&nbsp;</p>
                <p class="color-red">{{ $prod['prodDiscountSumm'] }}&nbsp;<sup>&#8381;</sup></p>
            </div>
            @endif
        </div>
        @endforeach
    </div>
    
    <p class="basket-order__product-clearance">
        <span class="basket-order__product-clearance-span">Всего товаров на сумму:</span>
        @if(!empty($data['orderdiscountsumm']))
        <span class="basket-order__product-clearance-span color-green">{{ $data['productsamount'] ?? '' }}&nbsp;<sup>&#8381;</sup></span>
        @else
        <span class="basket-order__product-clearance-span color-green">{{ $data['productsamount'] ?? '' }}&nbsp;<sup>&#8381;</sup></span>
        @endif
    </p>
    @if(!empty($data['orderdiscountsumm'])) 
    <div class="d-flex flex-sb margin-tb12px">
        <span class="basket-order__product-clearance-span">Обычная стоимость этого заказа:</span>
        <span id="orderTotalRegular" class="basket-order__product-clearance-span line-through">{{ $data['ordertotalamountinregularprices'] }}&nbsp;<sup>&#8381;</sup></span>
    </div>

    <div class="d-flex flex-sb margin-tb12px">
        <span class="basket-order__product-clearance-span">Моя скидка на товары в заказе:</span>
        <span id="orderTotalDiscount" class="basket-order__product-clearance-span color-red">{{ $data['orderdiscountsumm'] }}&nbsp;<sup>&#8381;</sup></span>
    </div>
    @endif
    <p class="registration-form__input-item">
        <!-- <label class="label" for="name">Выбранный способ доставки заказа: </label> -->
        <div class="basket-order__product-item basket-order__delivery-way"></div>
    </p>
    <p class="order-form__delivery-cost-p"></p>

    <div class="order-form__total-price-p d-flex flex-sb margin-tb12px">
        <span class="basket-order__product-clearance-span">Получатель: </span>
        <span id="orderBuyerNames" class="basket-order__product-clearance-span">{{ $data['orderrecipient'] ?? '' }}</span>
    </div>     
    
    <div class="order-form__total-price-p d-flex flex-sb margin-tb12px">
        <span class="basket-order__product-clearance-span">Телефон получателя: </span>
        <span id="orderBuyerTelNum" class="basket-order__product-clearance-span">{{ $data['orderrecipienttel'] ?? '' }}</span>
    </div>           

    <p class="order-form__delivery-cost-p">Адрес доставки/получения заказа:</p>
    <div id="basketCheckRecipientInfoAddr" class="basket-order__product-item" name="address">{{ $data['orderdeliveryaddress'] ?? '' }}</div>

    <p class="basket-order__product-clearance">
        <span class="basket-order__product-clearance-span">Стоимость доставки:</span>
        <span class="basket-order__product-clearance-span color-green">{{ $data['orderdeliverycost'] == 0 ? 'самовывоз без оплаты: 0' : $data['orderdeliverycost'] }}&nbsp;<sup>&#8381;</sup></span>
    </p>

    <p class="order-form__delivery-cost-p">Планируемая дата доставки/получения заказа:</p>
    <div id="basketCheckRecipientInfoAddr" class ="basket-order__product-item" name="address">{{ $data['orderdeliverydate'] ?? '' }}</div>

    <div class="d-flex flex-sb margin-tb12px">
        <span class="basket-order__product-clearance-span">Итоговая стоимость заказа:</span>
        <span id="orderTotalAmount" class="basket-order__product-clearance-span color-green">{{ $data['ordertotalamount'] }}&nbsp;<sup>&#8381;</sup></span>
    </div> 
@endif
</div>
    
<script src="{{ asset('js/orders.js') }}"></script>   