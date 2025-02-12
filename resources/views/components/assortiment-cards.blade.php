<section class="assortiment-cards">
@php //var_dump($productsArr); @endphp
@for ($i = 0; $i < $prodQuantity; $i++)
    <div class="assortiment-card__block">
        <div class="assortiment-card__block-productImg">
            <a href = "/products/card/{{ $productsArr[$i]['prod_url_semantic'] }}"><img src="/storage/{{ $productsArr[$i]['img_link'] }}" alt="{{ $productsArr[$i]['category'] }} {{ $productsArr[$i]['brand'] }}
            {{ $productsArr[$i]['model'] }} {{ $productsArr[$i]['marka'] }}" title="{{ $productsArr[$i]['category'] }} {{ $productsArr[$i]['brand'] }} {{ $productsArr[$i]['model'] }} {{ $productsArr[$i]['marka'] }}"></a>
        </div>
        <div class="assortiment-card__block-productInfo">   
            <div class="assortiment-card_productName"><a href = "/products/card/{{ $productsArr[$i]['prod_url_semantic'] }}">{{ $productsArr[$i]['title'] }}</a></div>
            <div class="assortiment-card_productPrice">
            
            <?php
                /* 
                если товар в архиве - цену не показываем
                
                если не назначена акция (специальная цена,       
                то полный блок цен не выводится, его пропускаем - 
                выводится только актуальная цена (следующий блок)*/
            ?>
            
            @if($productsArr[$i]['prod_status'] != '2')
                @if($productsArr[$i]['price_actual'] != $productsArr[$i]['price_regular'])
                <p class="priceCurrentSale"><nobr><?= number_format($price= $productsArr[$i]['price_actual'], 0,",", " " ); ?> <sup>&#8381;</sup></nobr></p>
                <p class="priceBeforSale"><nobr><?= number_format($price= $productsArr[$i]['price_regular'], 0,",", " " ); ?> <sup>&#8381;</sup></nobr></p>
                <p class="priceDiscountInPercentage"><nobr>- <?= $discount = ceil(100 - ($price= $productsArr[$i]['price_actual']) / ($price= $productsArr[$i]['price_regular']) * 100); ?>&#37;</nobr></p>
                @else
                <p class="priceCurrent"><nobr><?= number_format($price= $productsArr[$i]['price_regular'], 0,",", " " ); ?> <sup>&#8381;</sup></nobr></p>
                @endif
            @endif
            </div>
        </div>
    </div>
@endfor
</section>