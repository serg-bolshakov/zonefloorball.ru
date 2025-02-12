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