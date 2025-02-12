<div>
    <!-- Act only according to that maxim whereby you can, at the same time, will that it should become a universal law. - Immanuel Kant -->
</div>

<div class="pop-up__checkbox-block-hint">Хват (игровая сторона)
    <div class="pop-up__checkbox-block-hint-text">
    <x-articles.hook-side />
    </div>
</div>
<div class="prop-list">
    @foreach ($asideWithFilters['filterHooks'] as $filterHook)
        <div>  
            <input type="checkbox" {{ $filterHook['isPropChecked'] }}
                id="hook_{{ $filterHook['prop_value'] }}" name="hook[]" value="{{ $filterHook['prop_value'] }}">
            <label for="hook_{{ $filterHook['prop_value'] }}" class="label-hook__value-view">{{ $filterHook['prop_value_view'] }}</label>
        </div>
    @endforeach
</div>

<div class="pop-up__checkbox-block-hint">Длина рукоятки (см)
    <div class="pop-up__checkbox-block-hint-text">
        <x-articles.shaft-length />
    </div>
</div>
<div class="prop-list">
    @foreach ($asideWithFilters['filterStickSizes'] as $filterStickSize)
        <div>
            <input type="checkbox" {{ $filterStickSize['isPropChecked'] }} id="size_{{ $filterStickSize['size_value'] }}" 
            name="size[]" value="{{ $filterStickSize['size_value'] }}">
            <label for="size_{{ $filterStickSize['size_value'] }}"><div class="pop-up__checkbox-block-prop-hint">{{ $filterStickSize['size_value'] }}<div class="pop-up__checkbox-block-prop-hint-text">{{ $filterStickSize['size_recommendation'] }}</div></div></label>
        </div>
    @endforeach
</div>

<div class="pop-up__checkbox-block-hint">Индекс жёсткости рукоятки
    <div class="pop-up__checkbox-block-hint-text">
        <x-articles.shaft-flex />
    </div>
</div>

<div class="prop-list">
    @foreach ($asideWithFilters['filterShaftFlexes'] as $filterShaftFlex)
    <div>
        <input type="checkbox" {{ $filterShaftFlex['isPropChecked'] }} id="shaft_flex_{{ $filterShaftFlex['prop_value'] }}" name="shaft_flex[]" value="{{ $filterShaftFlex['prop_value'] }}">
        <label for="shaft_flex_{{ $filterShaftFlex['prop_value'] }}">{{ $filterShaftFlex['prop_value_view'] }}</label>
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