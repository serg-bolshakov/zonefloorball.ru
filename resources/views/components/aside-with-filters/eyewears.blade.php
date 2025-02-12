    <div class="checkbox-filters__param">
        Размер
    </div>
    <div class="prop-list">
        @foreach ($asideWithFilters['filterEyewearsSizes'] as $filterEyewearsSize)
            <div>
                <input type="checkbox" {{ $filterEyewearsSize['isPropChecked'] }} id="size_{{ $filterEyewearsSize['size_value'] }}" 
                name="size[]" value="{{ $filterEyewearsSize['size_value'] }}">
                <label for="size_{{ $filterEyewearsSize['size_value'] }}">
                    <div class="pop-up__checkbox-block-prop-hint">{{ $filterEyewearsSize['size_value'] }}
                        <div class="pop-up__checkbox-block-prop-hint-text">{{ $filterEyewearsSize['size_recommendation'] }}</div>
                    </div>
                </label>
            </div>
        @endforeach
    </div>
       
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