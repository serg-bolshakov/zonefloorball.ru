<x-maket-main>
    <x-slot:title> {{ $title }} </x-slot>
    <x-slot:robots> {{ $robots }} </x-slot>
    <x-slot:description> {{ $description }} </x-slot>
    <x-slot:keywords> {{ $keywords }} </x-slot>
	
	<x-nav-bar />
	
	<main>
        <div class="cardProduct-line__block"> 
            <div class = "cardProduct-block__title">    
                <h1>{{ $prodInfo->title }} </h1>
            </div>
            <div class="cardProduct-block__logo-article">
                @if($prodInfo->brand_id) 
                <img class="cardProduct-logo" src="/storage/{{ $prodInfo['brand']->url }}"  alt="{{$prodInfo['brand']->brand_view}} logo" title ="{{$prodInfo['brand']->brand_view}} logo">
                @endif
                <p class="cardProduct-article__title">Артикульный<br>номер:</p>
                <p class="cardProduct-article__number">{{ $prodInfo->article }}</p>
            </div>
        </div>

        <div class="cardProduct-line__block">
            @if($prodInfo['productMainImage']->img_link)
            <a href="/storage/{{ $prodInfo['productMainImage']->img_link }}">
                <img class="cardProduct__mainImg--{{ $prodInfo['productCardImgOrients'][0]->img_orient }}" src="/storage/{{ $prodInfo['productMainImage']->img_link }}" 
                alt="{{ $prodInfo['category']->category }} {{ $prodInfo['brand']->brand_view }} {{ $prodInfo->model }} {{ $prodInfo->marka }}" title ="Кликни на изображение, чтобы посмотреть его на всём экране.">
            </a>
            @endif

            <div class="cardProduct-props">
                <div class="cardProduct-props__item">
                    <x-product-card.block-other-possible-prods-for-card />
                </div>

                <x-product-card.block-price />
                    
                <div class="card-product__detail-status-block">
                    <x-product-card.block-statuses />
                </div>
        
            </div>
        </div>

        <div class="cardProduct-descDetails__block">
            <div class="cardProduct-props">  
                @if($prodInfo->prod_desc)
                <div class="cardProduct-description">{!! $prodInfo->prod_desc !!}</div>
                @endif
                @if(isset($prodInfo['size']->size_recommendation))
                <div class="cardProduct-productTarget">   
                    <span> {{ $prodInfo['size']->size_recommendation }}</span>
                </div>
                @endif
            </div>
            
            <div class="cardProduct-details">
                <div class = "cardProduct-details__title">
                    <p>Спецификация товара</p>
                </div>
                
                @if($prodInfo->weight)
                    <div class="cardProduct-detail__name">Вес (г):</div>
                    <div class = "cardStick-detail__value">{{ $prodInfo->weight }}</div>
                @endif
                
                @if($prodInfo->material)
                    <div class="cardProduct-detail__name">Материал:</div>
                    <div class="cardStick-detail__value">{{ $prodInfo->material }}</div>
                @endif
                
                @if($prodInfo->iff_id)
                    <div class="cardProduct-detail__name pop-up__cardProduct-hint">Наличие сертификата IFF:
                        <div class="pop-up__cardProduct-hint-text">
                        <x-articles.iff />
                        </div>
                    </div>
                    <div class="cardStick-detail__value">@php echo ($prodInfo->iff_id) == '1' ? 'Да' : 'Нет' @endphp</div>
                @endif

                @if(!empty($prodInfo['properties']))
                    @foreach($prodInfo['properties'] as $prop)
                    <div class="cardProduct-detail__name">{{ $prop->prop_description }}</div>
                    <div class="cardProduct-detail__value">{{ $prop->prop_value_view }}</div>    
                    @endforeach
                @endif

                @if(isset($prodInfo->propSeries) && !empty($prodInfo['propSeries']))
                <div class="cardProduct-detail__name">Специальное направление:</div>
                <div class="cardProduct-detail__value"><?= $prodInfo['propSerie']['prop_value_view']?></div>
                @endif

                @if(isset($prodInfo['propCollection']) && !empty($prodInfo['propCollection']))
                <div class="cardProduct-detail__name">Коллекция:</div>
                <div class="cardProduct-detail__value"><?= $prodInfo['propCollection']['prop_value_view']?></div>
                @endif

            </div>  
                
        </div>

        <div class="cardProduct-imgPromo">
            <x-product-card.block-promo-img />
        </div>  
        
        <input type="hidden" class="product-info__recently-viewed" data-recentviewedid="{{ $prodInfo->id }}" data-recentviewedtitle="{{ $prodInfo->title }}" 
        data-recentviewedpriceregular="{{ $prodInfo['regularPrice']->price_value }}" data-recentviewedpricespecial="{{ $prodInfo['price_special'] }}" 
        data-recentviewedurl="{{ $prodInfo->prod_url_semantic }}" data-recentviewedimgmain="{{ $prodInfo['productMainImage']->img_link }}" 
        data-recentviewedimgshowcase="{{ $prodInfo['productShowCaseImage']->img_link }}">
        

        <x-recently-viewed-products />
        
	</main>	
			
	
</x-maket-main>