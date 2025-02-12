@php //var_dump($data) @endphp

<form id="checkfavoritesinlocalstorageform" action="" method="POST">
    @csrf
    <input id="inputForCheckingFavoritesFromLacalStorage" type="hidden" name="favoriteslistfromlocalstorage">
</form>

<div class="basket-wrapper">
            <h1 class="basketTitle">Избранное</h1>
            <div id="favoritesproductsblock">
                @foreach($data as $product)
                
                <div class="basket-row__product">
                    <div class="basket-row__block">
                        <div class="basket-row__new-block-line"></div>
                        <a href="/products/card/{{ $product ['prod_url_semantic'] }}"><img src="/storage/{{ $product ['img_link'] }}" alt="{{ $product ['title'] }}" title="Кликните, чтобы перейти в карточку товара" ></a> 
                    </div>

                    <div class="basket-row__block">
                        <h3>{{ $product ['title'] }}</h3>
                    </div>
                    
                    <div class="basket-row__block favorites-block__price" data-removefromfavorites="{{ $product['id'] }}" data-favoritespriceblockisproductallowed="{{ $product['on_sale'] }}">
                        <div class="basket-res__total">
                            <p>сегодня в продаже: <span class="basket-quantity__span-tag">{{ $product ['on_sale'] }}</span> шт.</p>
                            <div class="basket-delete__product-div">
                                <img class="favorites-img__remove" data-removefromfavorites="{{ $product['id'] }}" src="/storage/icons/icon-trash.png" alt="icon-trash" title="Удалить товар из Избранного">
                                <img class="favorites-img__addtobasket" data-addtobasketfromfavoritesid="{{  $product['id'] }}" 
                                data-addtobasketfromfavoritesarticle="{{ $product['article'] }}"
                                data-addtobasketfromfavoritesname="{{ $product['title'] }}"
                                data-addtobasketfromfavoritesprice="{{ $product['price_regular'] }}"
                                data-addtobasketfromfavoritesurl="{{ $product['prod_url_semantic'] }}"
                                data-addtobasketfromfavoritesimglink="{{ $product['img_link'] }}"
                                data-addtobasketfromfavoritesallowed="{{ $product['on_sale'] }}"
                                src="/storage/icons/icon-shoppingcart.png" alt="icon-shoppingcart" title="Добавить выбранный товар в Корзину для покупок">
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
                    </div>
                @endforeach
            </div>
        </div>

    <script src="{{ asset('js/favoriteschecklocalstorage.js') }}"></script>
    <script src="{{ asset('js/favorites.js') }}"></script>

                       