@php //var_dump($user); var_dump('!!!!!!!!!!!!!!!!!!!!!!!!!!'); @endphp
@php //var_dump($user); @endphp
<div class="basket-wrapper">
    <h1 class="basketTitle"></h1>
    
    @if($data['products'])
        {{ date('d'.'-'.'m'.'-'.'Y') }}
        <div id="basketproductsblock">
            @foreach($data['products'] as $product)
            
            <div class="basket-row__product">
                <div class="basket-row__block">
                    <div class="basket-row__new-block-line"></div>
                    <a href="/products/card/{{ $product ['prod_url_semantic'] }}"><img src="/storage/{{ $product ['img_link'] }}" alt="{{ $product ['title'] }}" title="Кликните, чтобы перейти в карточку товара" ></a> 
                </div>

                <div class="basket-row__block">
                    <h3>{{ $product ['title'] }}</h3>
                </div>
                
                <div class="basket-row__block basket-block__price" data-removefrombasket="{{ $product['id'] }}" data-basketpriceblockisproductallowed="{{ $product['on_sale'] }}">
                    <div class="basket-res__total">
                        <p>сегодня в продаже: <span class="basket-quantity__span-tag" data-soldprodid="{{  $product['id'] }}">{{ $product ['on_sale'] }}</span> шт.</p>
                        <div class="basket-delete__product-div">
                            <img class="basket-img__remove" data-removefrombasket="{{ $product['id'] }}" src="/storage/icons/icon-trash.png" alt="icon-trash" title="Удалить товар из корзины">
                            <img class="basket-img__addtofavorites" data-addtofavoritesfrombasketid="{{  $product['id'] }}" src="/storage/icons/favorite.png" alt="icon-favorites" title="Добавить выбранный товар в Избранное">
                        </div> 
                    </div>
                
                    <p>по лучшей цене: </p>
                    
                    <div class="basket-row__priceValue d-flex">
                        @if($product['price_special'])
                            <div class="basket-favorites__priceCurrentSale"><?php echo number_format($product['price_special'], 0,",", " " ); ?> <sup>&#8381;</sup></div>
                            <div class="cardProduct-priceBeforSale"><?php echo number_format($product['price_regular'], 0,",", " " ); ?> <sup>&#8381;</sup></div>
                            <div class="basket-favorites__priceDiscountInPercentage">- {{  $discount = ceil(100 - ($product['price_special']) / ($product['price_regular']) * 100); }}&#37;</div>
                        @else
                            <div class="basket-favorites__priceCurrent"><?php echo number_format($product['price_regular'], 0,",", " " ); ?> <sup>&#8381;</sup></div>
                        @endif
                    
                        </div>

                        @if($product['date_end']) 
                        <div class="cardProduct-priceValidPeriod">акция действует до: {{  $product['date_end'] }}</div>
                        @endif

                        @if($product['price_with_rank_discount'])
                            @if($user->client_type_id == '1')
                            <p class="margin-tb12px">но для меня цена лучше: </p>
                            @else
                            <p class="margin-tb12px">но для нас цена лучше: </p>
                            @endif
                            <div class="d-flex padding-left16px">
                                <div class="basket-favorites__priceCurrentSale"><?php echo number_format($product['price_with_rank_discount'], 0,",", " " ); ?> <sup>&#8381;</sup></div>
                                <div class="cardProduct-priceBeforSale"><?php echo number_format($product['price_regular'], 0,",", " " ); ?> <sup>&#8381;</sup></div>
                                <div class="basket-favorites__priceDiscountInPercentage">- {{  $product['percent_of_rank_discount'] }}&#37;</div>
                            </div>
                        @endif
                 
                    </div>

                    <div class="basket-row__product">
                        <p class="basket-Pelem__text-inbasket">В корзине сейчас:</p>
                        @if($product['percent_of_rank_discount'])
                        <div class="d-flex"><p class="padding-left16px margin-bottom8px">по спеццене со скидкой -  </p><p class="margin-bottom8px">{{  $product['percent_of_rank_discount'] }}&#37;</p></div>
                        @endif
                        <div class="basket-row__priceCount">
                            <div class="basket-row__quantity" data-step="1" data-min="1" data-max="100">
                                <input class="basket-row__quantity-number" type="text" name="count_{{ $product['id'] }}" 
                                    data-productid="{{ $product['id'] }}" 
                                    data-productname="{{ $product ['title'] }}" 
                                    data-productquantity="{{ $product['quantity_to_buy'] }}"
                                    data-productquantityallowed="{{ $product['on_sale'] }}"
                                    data-productpriceregular="{{$product['price_regular'] }}"
                                    data-productpriceactual="{{$product['price_actual'] }}"
                                    {{-- data-productpriceactual - используется для формирования строки суммировнаия скидок в проверке заказа --}}
                                    @if(!empty($product['price_with_rank_discount']) && ($product['price_with_rank_discount'] < $product['price_actual']))
                                    data-productpriceforordercontent="{{ $product['price_with_rank_discount'] }}"
                                    @else
                                    data-productpriceforordercontent="{{ $product['price_actual'] }}"
                                    @endif
                                    data-productpricewithrankdiscount="{{ $product['price_with_rank_discount'] }}"
                                    data-productpricewithactiondiscount="{{ $product['summa_of_action_discount'] }}"
                                    @if($product['summa_of_action_discount'])  {{-- пока так считаем скидки для дальгейшего их логирования --}}      
                                    data-productdiscountperunit="{{ $product['summa_of_action_discount'] }}" 
                                    data-productdiscountperproductline="{{ $product['summa_of_action_discount'] * $product['quantity_to_buy'] }}" 
                                    data-productdiscounttypeid="1" {{-- пока хардкодим --}} 
                                    @elseif($product['percent_of_rank_discount'])
                                    data-productdiscountperunit="{{ $product['price_regular'] - $product['price_with_rank_discount'] }}" 
                                    data-productdiscountperproductline="{{ ($product['price_regular'] - $product['price_with_rank_discount']) * $product['quantity_to_buy'] }}"
                                    data-productdiscounttypeid="2" {{-- пока хардкодим --}} 
                                    @else
                                    data-productdiscountperproductline="0"
                                    data-productdiscounttypeid="0" {{--  пока хардкодим --}} 
                                    @endif
                                value="{{ $product['quantity_to_buy'] }}"> 
                                <a class="basket-row__quantity-minus">-</a>
                                <a class="basket-row__quantity-plus">+</a>
                            </div>
                            <a class="basket-row__priceValue">&nbsp;&nbsp;шт.,&nbsp;&nbsp;</a>
                            <a class="basket-row__priceValue">&nbsp;&nbsp;на сумму:&nbsp;&nbsp;</a>
                            @if($product['percent_of_rank_discount'])
                            <div id="basketProductRowTotalAmount_{{ $product['id'] }}" class="basket-row__priceValue" data-discount="{{ ($product['price_regular'] - $product['price_with_rank_discount']) * $product['quantity_to_buy'] }}" data-amount="{{ $product['price_with_rank_discount'] * $product['quantity_to_buy'] }}"><?php echo number_format(($product['price_with_rank_discount'] * $product['quantity_to_buy']), 0,",", " " ); ?> <sup>&#8381;</sup></div>
                            @elseif($product['summa_of_action_discount']) 
                            <div id="basketProductRowTotalAmount_{{ $product['id'] }}" class="basket-row__priceValue" data-discount="{{ $product['summa_of_action_discount'] * $product['quantity_to_buy'] }}" data-amount="{{ $product['price_actual'] * $product['quantity_to_buy'] }}"><?php echo number_format(($product['price_actual'] * $product['quantity_to_buy']), 0,",", " " ); ?> <sup>&#8381;</sup></div>
                            @else
                            <div id="basketProductRowTotalAmount_{{ $product['id'] }}" class="basket-row__priceValue" data-discount="0" data-amount="<?php echo $product['price_actual'] * $product['quantity_to_buy'] ?>"><?php echo number_format(($product['price_actual'] * $product['quantity_to_buy']), 0,",", " " ); ?> <sup>&#8381;</sup></div>
                            @endif
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
        
        <input id="hiddenInputWithDataFromPhpIdInBasket" type="hidden" data-transport="{{ $data['transportInfo']['delivery_way_view'] }}"
        data-transportcost="{{ $data['transportInfo']['delivery_cost'] }}" data-sqldeliverymethodid="{{ $data['transportInfo']['delivery_method_id'] }}" 
        data-postaddbuyerinfovalue="<?php echo !empty($_POST['basketaddrecipientinfo']) ? $_POST['basketaddrecipientinfo'] : '' ?>"
        data-getneworderid="{{ $data['neworderid'] }}"
        data-getusertypeid="{{ $user->client_type_id ?? '' }}"
        data-getuserid="{{ $user->id ?? '' }}"
        data-getuserstatusid="{{ $user->client_rank_id ?? '' }}"
        data-usertelnum = "@if(isset($user->client_type_id) && ($user->client_type_id == '1')) {{ $user->pers_tel }} @elseif(isset($user->client_type_id) && $user->client_type_id == '2') {{ $user->org_tel }} @endif"
        data-isuserpaytaxes = "{{ $user->is_taxes_pay ?? '' }}"
        data-paymentmethod = "<?php // echo (isset($_POST['basketmakeorderandpaymentgetinvoice']) && $_POST['basketmakeorderandpaymentgetinvoice'] == 2) ? '4' : '2' ?>"
        data-basket='<?php // echo $data['basket'] ?? '' ?>'
        data-token="{{ csrf_token() }}"
        name="hiddenInputWithDataFromPhpNameInBasket" value="">

        
        <div id="ordermakingrecipientinfodiv" class="registration-hidden registration-addition">

            @if(!empty($user) and $user->client_type_id == '2')
            <form action="" method="POST">        
                <p class="registration-form__input-item"><span class="registration-form__title">Заказчик/плательщик: </span></p>
                <p class="registration-form__title">{{ $user->name }}</p>
                <p class="registration-form__input-item">Представитель организации:</p>
                <p class="padding-left16px">{{ $representPerson->pers_surname }} {{ $representPerson->name }}</p>
                <p class="padding-left16px margin-top8px">Телефон:  {{ $representPerson->pers_tel }}</p>
                {{-- Эти абзацы "загружали" страницу ненужной информацией (для юридических лиц, по крайней мере) - просто "убрал" их с экрана --}}
                    <p class="registration-form__input-item d-none">
                        <label class="label" for="name">Имя: </label>
                        <input id="basket-order__recipient-name" class = "registration-form__input cursor-pointer" type="text" readonly disabled id="name" name="name" value="{{ $representPerson->name }}">
                        <span class="registration-error">*<br></span>
                        <span id="ordermakingbuyerinforerrorname" class="registration-error"></span>
                    </p>

                    <p class="registration-form__input-item d-none">
                        <label class="label" for="surname">Фамилия: </label>
                        <input id="basket-order__recipient-surname" class = "registration-form__input cursor-pointer" readonly disabled type="text" id="surname" name="surname" value="{{ $representPerson->pers_surname }}">
                        <span class="registration-error">*<br></span>
                    </p>

                    <p class="registration-form__input-item d-none">
                        <label class="label" for="tel">Номер мобильного телефона: </label>
                        <input id="basketAddRecipientInfoTel" class = "registration-form__input cursor-pointer" readonly disabled type='tel' name="tel" pattern="(\+7)\s[\(][0-9]{3}[\)]\s[0-9]{3}-[0-9]{2}-[0-9]{2}" value="{{ $representPerson->pers_tel }}">
                        <span class="registration-error">*<br></span>
                        <span id="ordermakingbuyerinforerrortel" class="registration-error"></span>
                    </p>
                
                <div id="basketordermakingdeliveryaddressfield" class="registration-form__input-item">
                    <label class="label" for="address">Адрес доставки/получения заказа: <span class="registration-error">*</span></label>
                    <div contenteditable="true" id="basketAddRecipientInfoAddr" class ="registration-form__input-address" name="address"><?php if(isset($_POST['address']) and !empty($_POST['address'])){ echo $_POST['address']; } ?></div>
                    <span class="registration-error">@error('address') {{ $message }} <br> @enderror</span>
                    <span class="productAddition-form__clearance">Адрес доставки/получения заказа должен быть указан, либо он "подгружается" из данных, введённых при выборе способа доставки.</span><br>
                    <span id="ordermakingbuyerinforerroraddr" class="registration-error"></span>
                </div>
                
                <input id="hiddenInputOrderDeliveryAddress" type="hidden" name="basketorderdeliveryaddress" value="">
                
                <p class="registration-form__input-item"><span class="registration-form__star">*</span> - поля, обязательные для заполнения </p>
                
                <div class="d-flex flex-sb padding-left8px padding-right24px">
                    <div id="basketFormConfirmRecientInfoInput" class="order-btn">Подтвердить</div>
                    <a href="" class="order-btn">Отменить</a>
                </div>
                
            </form>
            
            @elseif(!empty($user) and $user->client_type_id == '1') 
                <form action="" method="POST">
                @csrf        
                <p class="registration-form__input-item"><span class="registration-form__title">Получатель заказа</span></p>
                
                <p class="registration-form__input-item">
                    <label class="label" for="name">Имя: </label>
                    <input id="basket-order__recipient-name" class="registration-form__input cursor-pointer" type="text" readonly disabled id="name" name="name" value="{{ $user->name }}">
                    <span class="registration-error">*<br></span>
                    <span id="ordermakingbuyerinforerrorname" class="registration-error"></span>
                </p>

                <p class="registration-form__input-item">
                    <label class="label" for="surname">Фамилия: </label>
                    <input id="basket-order__recipient-surname" class="registration-form__input cursor-pointer" readonly disabled type="text" id="surname" name="surname" value="{{ $user->pers_surname }}">
                    <span class="registration-error">*<br></span>
                    <span id="ordermakingbuyerinforerrorsurname" class="registration-error"></span>
                </p>

                <p class="registration-form__input-item">
                    <label class="label" for="tel">Номер мобильного телефона: </label>
                    <input id="basketAddRecipientInfoTel" class="registration-form__input cursor-pointer" readonly disabled type='tel' name="tel" 
                    pattern="(\+7)\s[\(][0-9]{3}[\)]\s[0-9]{3}-[0-9]{2}-[0-9]{2}" value="{{ $user->pers_tel }}">
                    <span class="registration-error">*<br></span>
                    <span id="ordermakingbuyerinforerrortel" class="registration-error"></span>
                </p>

                <div id="basketordermakingdeliveryaddressfield" class="registration-form__input-item">
                    <label class="label" for="address">Адрес доставки/получения заказа:<span class="registration-error">*</span></label>
                    <div contenteditable="true" id="basketAddRecipientInfoAddr" class="registration-form__input-address" name="address"><?php if(!empty($user->delivery_addr_on_default)){ echo $user->delivery_addr_on_default; } elseif(isset($_POST['address']) and !empty($_POST['address'])){ echo $_POST['address']; } ?></div>
                    <span class="registration-error"><?php // ($persAddrErr != '') ? $persAddrErr . '<br>' : ''  ?></span>
                    <span class="productAddition-form__clearance">Адрес доставки/получения должен быть указан, либо он "подгружается" из данных, введённых при выборе способа доставки.</span><br>
                    <span id="ordermakingbuyerinforerroraddr" class="registration-error"></span>
                </div>
                
                <input id="hiddenInputOrderDeliveryAddress" type="hidden" name="basketorderdeliveryaddress" value="">
                
                <p class="registration-form__input-item"><span class="registration-form__star">*</span> - поля, обязательные для заполнения </p>
                
                <div class="d-flex flex-sb padding-left8px padding-right24px">
                    <div id="basketFormConfirmRecientInfoInput" class="order-btn">Подтвердить</div>
                    <a href="" class="order-btn">Отменить</a>
                </div>
            </form>

            @else   
                <form action="" method="POST"> 
                @csrf
                <p class="order-info__text">Важно! Оформление заказа производится без регистрации и авторизации покупателя! Вы сможете отслеживать изменения статуса и ход доставки только на этом устройстве в разделе "Мои заказы / покупки". Для доступа в "личный кабинет" и получения более детальной информации и специальных цен, рекомендуем <a href="/register">зарегистрироваться</a> в системе или <a href="/login">авторизоваться</a></p>
                <p class="registration-form__input-item"><span class="registration-form__title">Информация о получателе заказа</span></p>
                <p class="registration-form__input-item">
                    <label class="label" for="name">Имя: </label>
                    <input id="basket-order__recipient-name" class="registration-form__input" type="text" required  data-rule="namefieldtext" data-maxlength="30" id="name" name="name" value = "<?php //if (isset ($_POST['name'])) echo $_POST['name'] ?>">
                    <span class="registration-error">*<br><?php // ($nameErr != '') ? $nameErr . '<br>' : ''  ?></span>
                    <span class="productAddition-form__clearance">Имя пишется буквами русского алфавита, должно быть длиной от 1 до 30 символов, может содержать пробел и дефис.</span><br>
                    <span id="ordermakingbuyerinforerrorname" class="registration-error"></span>
                </p>

                <p class="registration-form__input-item">
                    <label class="label" for="surname">Фамилия: </label>
                    <input id="basket-order__recipient-surname" class="registration-form__input" type="text" required data-rule="namefieldtext" data-maxlength="30" id="surname" name="surname" value = "<?php //if (isset ($_POST['surname'])) echo $_POST['surname'] ?>">
                    <span class="registration-error">*<br><?php // ($surNameErr != '') ? $surNameErr . '<br>' : ''  ?></span>
                    <span class="productAddition-form__clearance">Правила написания фамилии такие же, как и для имени (см.выше).</span><br>
                    <span id="ordermakingbuyerinforerrorsurname" class="registration-error"></span>
                </p>

                <p class="registration-form__input-item">
                    <label class="label" for="tel">Укажите номер мобильного телефона: </label>
                    <input id="basketAddRecipientInfoTel" class="registration-form__input" type="tel" data-rule="telnum" required placeholder="+7 (999) 123-45-67" name="tel" pattern="(\+7)\s[\(][0-9]{3}[\)]\s[0-9]{3}-[0-9]{2}-[0-9]{2}" value = "<?php if (isset ($_POST['tel'])) echo $_POST['tel'] ?>">
                    <span class="registration-error">*<br><?php // ($persTelNumErr != '') ? $persTelNumErr . '<br>' : ''  ?></span>
                    <span class="productAddition-form__clearance">Номер телефона вводится в формате: +7 (999) 123-45-67</span><br>
                    <span id="ordermakingbuyerinforerrortel" class="registration-error"></span>
                </p>

                <div id="basketordermakingdeliveryaddressfield" class="registration-form__input-item">
                    <label class="label" for="address">Адрес доставки/получения заказа: <span class="registration-error">*</span></label>
                    <div contenteditable="true" id="basketAddRecipientInfoAddr" class="registration-form__input-address" name="address"><?php // $_POST['address'] ?? ''; ?></div>
                    <span class="registration-error"><?php // ($persAddrErr != '') ? $persAddrErr . '<br>' : ''  ?></span>
                    <span class="productAddition-form__clearance">Адрес доставки/получения должен быть указан, либо он "подгружается" из данных, введённых при выборе способа доставки.</span><br>
                    <span id="ordermakingbuyerinforerroraddr" class="registration-error"></span>
                </div>
                
                <input id="hiddenInputOrderDeliveryAddress" type="hidden" name="basketorderdeliveryaddress" value="">

                <p class="registration-form__input-item"><span class="registration-form__star">*</span> - поля, обязательные для заполнения </p>
                <p class="registration-form__input-item"><span class="registration-error"><?php // ($commonErr != '') ? $commonErr . '<br>' : ''  ?></span></p>

                <div class="d-flex flex-sb padding-left8px padding-right24px">
                    <div id="basketFormConfirmRecientInfoInput" class="order-btn">Подтвердить</div>
                    <a href="" class="order-btn">Отменить</a>
                </div>
            
                </form>
            @endif
        </div>            

        <div id="orderfrombasketdiv" class="registration-hidden">
            @if(!empty($user) and $user->client_type_id == '2')
                <div class="basket-order__confirmation">
                    <form id="basketOrderConfirmationForm" action="" method="POST"> 
                    @csrf
                        <p class="registration-form__input-item"><span class="registration-form__title">Проверьте ваш Новый заказ:</span></p>
                        
                        <!-- <label class="label">Перечень товаров в заказе: </label> -->
                        <div id="basketpreorderedproductscheckingdiv" class="basket-order__product-items">
                            <div class="basket-order__product-item"></div>                     
                        </div>
                        <p id="basketpreorderedproductscheckingtotalproductsamountpelem" class="order-form__total-price-p"></p>
                        
                        <div class="d-flex flex-sb margin-tb12px">
                            <span class="basket-order__product-clearance-span">Обычная стоимость этой корзины:</span>
                            <span id="orderTotalRegular" class="basket-order__product-clearance-span line-through"></span>
                        </div>

                        <div class="d-flex flex-sb margin-tb12px">
                            <span class="basket-order__product-clearance-span">Наша скидка на товары в заказе:</span>
                            <span id="orderTotalDiscount" class="basket-order__product-clearance-span color-green"></span>
                        </div>

                        <p class="registration-form__input-item">
                            <!-- <label class="label" for="name">Выбранный способ доставки заказа: </label> -->
                            <div class="basket-order__product-item basket-order__delivery-way"></div>
                        </p>
                        <p id="basketpreorderedproductscheckingdeliverycostpelem" class="order-form__delivery-cost-p"></p>

                        <div class="order-form__total-price-p d-flex flex-sb margin-tb12px">
                            <span class="basket-order__product-clearance-span">Получатель/Плательщик: </span>
                            <span id="orderBuyerNames" class="basket-order__product-clearance-span">{{ $user->name}}</span>
                        </div>     
                        
                        <div class="order-form__total-price-p d-flex flex-sb margin-tb12px">
                            <span class="basket-order__product-clearance-span">Телефон представителя: </span>
                            <span id="orderBuyerTelNum" class="basket-order__product-clearance-span">{{ $representPerson->pers_tel ?? ''}}</span>
                        </div>           
                    
                        <p class="order-form__delivery-cost-p">Адрес доставки/получения заказа:</p>
                        <div id="basketCheckRecipientInfoAddr" class ="basket-order__product-item" name="address"></div>
                    
                        <div class="d-flex flex-sb margin-tb12px">
                            <span class="basket-order__product-clearance-span">Итоговая стоимость заказа:</span>
                            <span id="orderTotalAmount" class="basket-order__product-clearance-span"></span>
                        </div> 

                        <div id='basketdivforhiddeninputsmakingneworder' class="d-none"></div>

                        {{-- Этот инпут будет хранить значение нажатой кнопки.  --}}
                        <input type="hidden" id="actionButton" name="actionButton" value="">

                        <div class="d-flex flex-sa">
                            <button id="idmakereserveinbasket" type="submit" class="registration-form__submit-btn" name="namemakereserveinbasket" value="1">Получить счёт</button>
                            <button id="idpayfororderinbasket" type="submit" class="registration-form__submit-btn" name="idpayfororderinbasket" value="1">Оплатить картой</button>
                        </div>

                    </form>
                </div>
            @else
                <div class="basket-order__confirmation">
                    <form id="basketOrderConfirmationForm" action="" method="POST"> 
                    @csrf
                        <p class="registration-form__input-item"><span class="registration-form__title">Проверьте ваш заказ:</span></p>
                        
                        <!-- <label class="label">Перечень товаров в заказе: </label> -->
                        <div id="basketpreorderedproductscheckingdiv" class="basket-order__product-items">
                            <div class="basket-order__product-item"></div>                     
                        </div>
                        <p id="basketpreorderedproductscheckingtotalproductsamountpelem" class="order-form__total-price-p"></p>

                        {{-- @if(!empty($user)) --}}
                        <div class="d-flex flex-sb margin-tb12px">
                            <span class="basket-order__product-clearance-span">Обычная стоимость этой корзины:</span>
                            <span id="orderTotalRegular" class="basket-order__product-clearance-span line-through"></span>
                        </div>

                        <div class="d-flex flex-sb margin-tb12px">
                            <span class="basket-order__product-clearance-span">Моя скидка на товары в заказе:</span>
                            <span id="orderTotalDiscount" class="basket-order__product-clearance-span color-green"></span>
                        </div>
                        {{-- @endif --}}

                        <p class="registration-form__input-item">
                            <!-- <label class="label" for="name">Выбранный способ доставки заказа: </label> -->
                            <div class="basket-order__product-item basket-order__delivery-way"></div>
                        </p>
                        <p id="basketpreorderedproductscheckingdeliverycostpelem" class="order-form__delivery-cost-p"></p>

                        <div class="order-form__total-price-p d-flex flex-sb margin-tb12px">
                            <span class="basket-order__product-clearance-span">Получатель: </span>
                            <span id="orderBuyerNames" class="basket-order__product-clearance-span">{{ $user->pers_surname ?? ''}}&nbsp;{{ $user->name ?? ''}}</span>
                        </div>     
                        
                        <div class="order-form__total-price-p d-flex flex-sb margin-tb12px">
                            <span class="basket-order__product-clearance-span">Телефон получателя: </span>
                            <span id="orderBuyerTelNum" class="basket-order__product-clearance-span">{{ $user->pers_tel ?? ''}}</span>
                        </div>           
                    
                        <p class="order-form__delivery-cost-p">Адрес доставки/получения заказа:</p>
                        <div id="basketCheckRecipientInfoAddr" class ="basket-order__product-item" name="address"></div>
                    
                        <div class="d-flex flex-sb margin-tb12px">
                            <span class="basket-order__product-clearance-span">Итоговая стоимость заказа:</span>
                            <span id="orderTotalAmount" class="basket-order__product-clearance-span"></span>
                        </div> 

                        <div id='basketdivforhiddeninputsmakingneworder' class="d-none"></div>

                        {{-- Этот инпут будет хранить значение нажатой кнопки.  --}}
                        <input type="hidden" id="actionButton" name="actionButton" value="">

                        <div class="d-flex flex-sa">
                            @if(empty($user)) 
                                <button id="idmakereserveinbasket" type="" class="registration-form__submit-btn" name="namemakereserveinbasket" value="1">Зарезервировать</button>
                            @else 
                                <button id="idmakereserveinbasket" type="submit" class="registration-form__submit-btn" name="namemakereserveinbasket" value="1">Зарезервировать</button>
                            @endif
                            <button id="idpayfororderinbasket" type="submit" class="registration-form__submit-btn" name="idpayfororderinbasket" value="1">Оплатить</button>
                        </div>
                    </form>
                </div>
            @endif
        </div>

        <div class="russianpost-map__content">
            <p class="russianpost-map__content-text">Для просмотра сроков и стоимости доставки заказа, введите адрес и выберите отделение связи для получения заказа:</p>
            <div id="ecom-widget" class="russianpost-map"></div>
            <div class="map__params"></div>
        </div>

        <div id="myModalReserve" class="modal">
            <div class="modal-content">
                <span id="myModalCloseReserveSpan" class="modal-close">&times;</span>
                @if(!empty($user) and $user->client_type_id == '1')
                <p>Резерв действителен для оплаты в течение 3-х дней.</p><p>Выбранные товары зарезервированы для вас на складе по указанным в документе ценам.</p><p>Благодарим за обращение в нашу компанию. Надеемся на взаимовыгодное сотрудничество.</p>
                <p>Вы уверены, что хотите зарезервировать?</p>
                <button id="confirmReserve">Да. Спасибо.</button>
                @elseif(!empty($user) and $user->client_type_id == '2')
                <p>Счёт действителен для оплаты в течение 3-х банковских дней.</p><p>Товары, указанные в счёте, зарезервированы для вас на складе по указанным в счёте ценам.</p><p>Благодарим за обращение в нашу компанию. Надеемся на взаимовыгодное сотрудничество.</p>
                <button id="confirmReserve">Замечательно!</button>
                @endif
            </div>
        </div>

        <div id="myModalTryToReserveByNlo" class="modal">
            <div class="modal-content">
                <span id="myModalCloseReserveByNloSpan" class="modal-close">&times;</span>
                <p>Только авторизованные пользователи могут зарезервировать товары на три дня, в течение которых заказ, должен быть оплачен.</p><p>Благодарим за обращение в нашу компанию. Надеемся на взаимовыгодное сотрудничество.</p>
                <div class="d-flex flex-sb">
                    <button id="exitMakingOrderWhenNloWantsToReservButton" class="modal-button">Выход</button>
                    <button id="goAheadMakingOrderWhenNloWantsToReservButton" class="modal-button">Понятно</button>
                </div>
            </div>
        </div>

        <div id="myModalPayment" class="modal">
            <div class="modal-content">
                <span id="myModalClosePaymentSpan" class="modal-close">&times;</span>
                @if((!empty($user) and $user->client_type_id == '1') || empty($user))
                <p>Покупка должна принести радость тому, кому она предназначена и удовольствие тому, кто сделал выбор</p><p>Флорбольные товары имеют свою специфику (клюшки, например: длину, хват, жёсткость)...</p>
                <p>Если вы не уверены в своём выборе - вам всегда с радостью помогут наши эксперты...</p>
                <p>Оплачивая заказ, вы подтверждаете, что ознакомлены с правилами оплаты, доставки и возможного возврата заказа.</p><p>После нажатия на кнопку "Оплатить", для проведения он-лайн оплаты и формирования кассового чека, вы будете переадресованы на платёжный сервис "Робокасса".</p><p>Благодарим за обращение в нашу компанию. Надеемся на взаимовыгодное сотрудничество.</p>
                <p>Добро пожаловать!</p>
                <button id="confirmPayment">Всё хорошо. Спасибо.</button>
                @elseif(!empty($user) and $user->client_type_id == '2')
                <p>Вы действуете от имени юридического лица и можете оплатить заказ только бизнес-картой. После нажатия на кнопку "Оплатить", для проведения он-лайн оплаты и списания денежных средств со счёта организации, вы будете переадресованы на платёжный сервис "Робокасса".</p><p>Благодарим за обращение в нашу компанию. Надеемся на взаимовыгодное сотрудничество.</p>
                <button id="confirmPayment">Да. Всё понятно.</button>
                @endif
            </div>
        </div>

        <div id="myModalWantCheaper" class="modal">
            <div class="modal-content">
                <!-- <span id="myModalWantCheaperCloseSpan" class="modal-close">&times;</span> -->
                @if(!empty($user))
                <p>Оформите заказ, зарезервируйте его (срок действия заказа и резерва - три дня).</p><p>Напишите своему персональному эксперту свои пожелания - у нас будет время посмотреть дополнительные варианты скидок.</p><p>Благодарим за обращение в нашу компанию. Надеемся на взаимовыгодное сотрудничество.</p>
                <div class="d-flex flex-sb">
                    <button id="confirmWantCheaperButton" class="modal-button margin-right12px">Понятно. Закрыть окно.</button>
                    <button id="exitMakingOrderButton" class="modal-button margin-left12px">Отменить оформление заказа.</button>
                </div>
                @endif
            </div>
        </div>

        {{-- @else - сюда должны попадать неавторизованные пользователи --}}
        <div id="myModalBeRegisteredOrNotToBe" class="modal">
            <div class="modal-content">
                <p>Важно! Оформление заказа производится без регистрации и авторизации покупателя! Вы сможете отслеживать изменения статуса и ход доставки только на этом устройстве в разделе "Мои заказы / покупки". Для доступа в "личный кабинет" и получения более детальной информации и специальных цен, рекомендуем <a href="/register">зарегистрироваться</a> в системе или <a href="/login">авторизоваться</a></p><p>Благодарим за обращение в нашу компанию. Надеемся на взаимовыгодное сотрудничество.</p>
                <div class="d-flex flex-sb">
                    <button id="exitMakingOrderToBeReficterdButton" class="modal-button margin-right12px">Отменить оформление заказа.</button>
                    <button id="confirmBeRegisteredOrNotToBeButton" class="modal-button margin-left12px">Продолжим без регистрации.</button>
                </div>
            </div>
        </div>
        
        <script src="{{ asset('js/basket.js') }}"></script>
        <script src="https://widget.pochta.ru/map/widget/widget.js"></script>
        <!-- <script>
            ecomStartWidget({
            id: 50051,
            containerId: 'ecom-widget',
            weight: 500, 
            callbackFunction: getChoosedAddressInfoTariffAndDeliveryTime,
            start_location: 'обл Нижегородская, г Нижний Новгород',
            startZip: '603087', 
            dimensions: [{ length: 120, width: 24, height: 8 }]
            });
        </script> -->
        <script src="{{ asset('js/ecomStartWidget.js') }}"></script>  
    
    @endif

</div>



    

    

                       