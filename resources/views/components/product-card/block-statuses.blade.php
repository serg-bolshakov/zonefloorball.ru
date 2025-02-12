@if($data)
    @if ($data['productReport']->on_sale)
        <div class="card-product__detail-status">В продаже:<br> {{ $data['productReport']->on_sale }}&nbsp;{{ $data['productUnit']->unit_prod_value_view }}</div>
        @else
        <div class="card-product__detail-status">В продаже<br>нет</div>
        @if($data['productReport']->coming_soon)
            <div class="card-product__detail-status">Скоро будет</div>
        @endif
    @endif

    @if($data['productReport']->reserved)
        <div class="card-product__detail-status">Резерв:<br> {{ $data['productReport']->reserved }}&nbsp;{{ $data['reservedProductUnitValueView'] }}</div>
    @endif
@else>
    <div class="card-product__detail-status">В архиве</div>
@endif

@if($data)
    <img id="buttonFromProductCardPutProductForFavorites" src="/storage/icons/favorite.png" alt="favorite-logo" title="Добавить в избранное">
@endif
    
@if($data['productReport']->on_sale)
    <button id="buttonFromProductCardPutProductForBasket" class = "card-product__basket-button" value="В корзину">В корзину</button>
@endif 
    
<input id="hiddenInputFromProductCardWithInfoForBasket" type="hidden" data-productid="{{ $data->id }}" data-productarticle="{{ $data->article }}" 
    data-productname="{{ $data->title }}" data-productpriceactual="{{ $data['actualPrice']->price_value }}" 
    data-productquantityonsale="{{ $data['productReport']->on_sale }}" data-producturlsemantic="{{ $data->prod_url_semantic }}"
    data-productimglink="{{ $data['productMainImage']->img_link }}" 
    data-productpriceregular="{{ $data['regularPrice']->price_value }}" 
    data-productpricespecial="<?= ($data['regularPrice']->price_value == $data['actualPrice']->price_value) ? '' :  $data['actualPrice']->price_value ?>" 
    data-productpricespecialdate="{{ $data['actualPrice']->date_end }}" 
name="hiddenInputFromProductCard" value=""> 

<script src="{{ asset('js/add-product-to-package.js') }}"></script>
