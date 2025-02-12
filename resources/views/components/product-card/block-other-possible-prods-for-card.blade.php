@if(isset($resultOtherProductsForCard['resultpossibleHookForProductCard']))
    <!-- <div class="cardProduct-props__item"> -->
        <div class="cardProduct-props__item-hook-title fs12">
            Хват (игровая сторона): 
        </div>

        @if(($resultOtherProductsForCard['propHook'] !== 'Левый' AND !empty($resultOtherProductsForCard['resultpossibleHookForProductCard'])) OR (!empty($resultOtherProductsForCard['resultpossibleHookForProductCard']) AND $resultOtherProductsForCard['resultpossibleHookForProductCard']->prop_value == 'left'))
        <div class="cardStick-props__item-hook">
            <a href="{{ $resultOtherProductsForCard['resultpossibleHookForProductCard']->prod_url_semantic }}">{{ $resultOtherProductsForCard['resultpossibleHookForProductCard']->prop_value_view }}</a>
        </div>
        @elseif($resultOtherProductsForCard['propHook'] == 'Левый')
        <div class="cardStick-props__item-hook-active">
            {{ $resultOtherProductsForCard['propHook'] }}
        </div>
        @endif

        @if(($resultOtherProductsForCard['propHook'] !== 'Правый' AND !empty($resultOtherProductsForCard['resultpossibleHookForProductCard'])) OR (!empty($resultOtherProductsForCard['resultpossibleHookForProductCard']) and ($resultOtherProductsForCard['resultpossibleHookForProductCard']->prop_value) == 'right'))
        <div class="cardStick-props__item-hook">
            <a href="{{ $resultOtherProductsForCard['resultpossibleHookForProductCard']->prod_url_semantic }}">{{ $resultOtherProductsForCard['resultpossibleHookForProductCard']->prop_value_view }}</a>
        </div>
        @elseif ($resultOtherProductsForCard['propHook'] == 'Правый')
        <div class="cardStick-props__item-hook-active">
            {{ $resultOtherProductsForCard['propHook'] }}
        </div>
        @endif
    <!-- </div> -->
@elseif(!empty($resultOtherProductsForCard['propHook']))
        <div class="cardProduct-props__item-hook-title fs12">
            Хват (игровая сторона): 
        </div>
        <div class="cardStick-props__item-hook-active">
            {{ $resultOtherProductsForCard['propHook'] }}
        </div>
@endif

@if(isset($resultOtherProductsForCard['possibleShaftLengthForProductCard']) && !empty($resultOtherProductsForCard['possibleShaftLengthForProductCard']))
    <div class="cardProduct-props__item">
        <div class="cardStick-props__item-shaftLength-title fs12">
            Длина рукоятки (см):
        </div>

        @foreach ($resultOtherProductsForCard['possibleShaftLengthForProductCard'] as $possibleShaftLengthForProductCard)
            <div class="{{ $possibleShaftLengthForProductCard['classCurrent'] }}"><a href="{{ $possibleShaftLengthForProductCard['prod_url_semantic'] }}">{{ $possibleShaftLengthForProductCard['size_value'] }}</a></div>
        @endforeach
    </div>
@endif()

@if(isset($resultOtherProductsForCard['products']))
    <div class="card-product__{{ $resultOtherProductsForCard['classComponent'] }}-choice">         
    @if($resultOtherProductsForCard['choiceComment'])
    <div class="d-flex flex-wrap card-product__dif-props">
        {!! $resultOtherProductsForCard['choiceComment'] !!}
    @endif
        
    @foreach ($resultOtherProductsForCard['products'] as $product)
    <a href="{{ $product->prod_url_semantic }}">
        @if($resultOtherProductsForCard['href'])<img src="/storage/{{ $product->img_link }}" alt="{{ $product->colour }}" title ="{{ $product->colour }}">@endif</a>
    @endforeach
        
    @if($resultOtherProductsForCard['choiceComment'])
    </div>
    @endif    
    </div>    
@endif