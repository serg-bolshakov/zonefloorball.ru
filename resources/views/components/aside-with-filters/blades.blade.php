<div class="pop-up__checkbox-block-hint">Хват (игровая сторона)
    <div class="pop-up__checkbox-block-hint-text">
        <x-articles.hook-side />
    </div>
</div>      


<div class="prop-list">
    @foreach ($asideWithFilters['filtersHookBlade'] as $filterHookBlade)
        <div>
            <input type="checkbox" {{ $filterHookBlade['isPropChecked'] }}
            id="hook_blade_{{ $filterHookBlade['prop_value'] }}" name="hook_blade[]" value="{{ $filterHookBlade['prop_value'] }}">
            <label for="hook_blade_{{ $filterHookBlade['prop_value'] }}">{{ $filterHookBlade['prop_value_view'] }}</label>
        </div>
    @endforeach
</div>


<div class="pop-up__checkbox-block-hint">Степень жёсткости крюка
    <div class="pop-up__checkbox-block-hint-text">
        <x-articles.blade-stiffness />
    </div>
</div>

<div class="prop-list">
    @foreach ($asideWithFilters['filtersBladeStiffness'] as $filterBladeStiffness)    
        <div>
            <input type="checkbox" {{ $filterBladeStiffness['isPropChecked'] }} id="blade_stiffness_{{ $filterBladeStiffness['prop_value'] }}" name="blade_stiffness[]" value="{{ $filterBladeStiffness['prop_value'] }}">
            <label for="blade_stiffness_{{ $filterBladeStiffness['prop_value'] }}">{{ $filterBladeStiffness['prop_value_view'] }}</label>
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