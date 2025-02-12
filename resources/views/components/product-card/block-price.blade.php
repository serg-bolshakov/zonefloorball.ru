@if(!empty($productPrices))

<div class="cardProduct-productPrice__block">
    <div>Лучшая цена</div>
    @if($productPrices['actualPrice']->price_value < $productPrices['regularPrice']->price_value) 
        <div class="cardProduct-priceCurrentSale"><?php echo number_format($price= $productPrices['actualPrice']->price_value, 0,",", " " ); ?> <sup>&#8381;</sup></div>
        <div class="cardProduct-priceBeforSale"><?php echo number_format($price= $productPrices['regularPrice']->price_value, 0,",", " " ); ?> <sup>&#8381;</sup></div>
        <div class="cardProduct-priceDiscountInPercentage">- <?= $discount = ceil(100 - ($price= $productPrices['actualPrice']->price_value) / ($price= $productPrices['regularPrice']->price_value) * 100); ?>&#37;</div>
    @else
        <div class="cardProduct-priceCurrent"><?php echo number_format($price= $productPrices['regularPrice']->price_value, 0,",", " " ); ?> <sup>&#8381;</sup></div>
    @endif
        @if ($productPrices['actualPrice']->date_end) 
        <div class="cardProduct-priceValidPeriod">действует до: {{ $productPrices['actualPrice']->date_end }}</div>
        @endif
</div>

@endif