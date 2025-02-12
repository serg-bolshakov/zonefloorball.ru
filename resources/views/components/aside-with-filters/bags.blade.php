@php //var_dump($asideWithFilters['categories'][0]); @endphp
@if($asideWithFilters['categories'])
    <div class="prop-list">  
        <h2>{{ $asideWithFilters['categories'][0]['category'] }}</h2>   
        
        @foreach($asideWithFilters['categories'] as $key=>$value)
            @if(isset($value['prop_url_semantic']) && ($key != 0)) 
            <div>  
                <input type="checkbox" {{ $value['isPropChecked'] }}
                    id="category_{{ $value['url_semantic'] }}" name="category[]" value="{{ $value['url_semantic'] }}">
                <label for="category_{{ $value['url_sematic'] }}" class = "label-hook__value-view">{{ $value['category_view_2'] }}</label>
            </div>
            @elseif(!empty($value['model']) && $key != 0)
            <a href="/products/catalog?{{ $value['url_semantic'] }}=model&model={{ $value['model'] }}">{{ $value['model'] }}</a> 
            @elseif(!empty($value['url_semantic']) && $key != 0)
            <div>  
                <input type="checkbox" {{ $value['isPropChecked'] }}
                    id="category_{{ $value['url_semantic'] }}" name="category[]" value="{{ $value['url_semantic'] }}">
                <label for="category_{{ $value['url_semantic'] }}" class = "label-hook__value-view">{{ $value['category_view_2'] }}</label>
            </div>
            @php //var_dump($asideWithFilters['categories'][0]); @endphp
            @elseif($key != 0)
            <h2>{{ $asideWithFilters['categories'][$key][0]['category_view_2'] }}</h2>
                <ul class="prodsubcat-list__catalog--menu">
                @foreach($asideWithFilters['categories'][$key] as $subCatKey=>$subCatValue)
                    @if(isset($subCatValue['url_semantic']) && ($subCatKey != 0)) 
                    <li>
                        <div>  
                            <input type="checkbox" {{ $subCatValue['isPropChecked'] }} id="category_{{ $subCatValue['url_semantic'] }}" name="category[]" value="{{ $subCatValue['url_semantic'] }}">
                            <label for="category_{{ $subCatValue['url_semantic'] }}" class = "label-hook__value-view">{{ $subCatValue['category_view_2'] }}</label>
                        </div>
                    </li>
                    @endif
                @endforeach
                </ul> 
            @endif
        @endforeach
    </div>  
@endif

@if($asideWithFilters['brands'])
    <div class="pop-up__checkbox-block-hint">Бренд
        <div class="pop-up__checkbox-block-hint-text">
            <x-articles.brands-about />
        </div>
    </div>
    <div class="prop-list">
        @foreach ($asideWithFilters['brands'] as $filterBrand)  
        <div>
            <input type="checkbox" {{ $filterBrand['isBrandChecked'] }} id="brand_{{ $filterBrand['brand'] }}" name="brand[]" value="{{ $filterBrand['brand'] }}">
            <label for="brand_{{ $filterBrand['brand'] }}" class="label-brand__value-view">{{ $filterBrand['brand_view'] }}</label>
        </div>
        @endforeach
    </div>
@endif