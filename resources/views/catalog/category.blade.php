<x-maket-catalog>
    <x-slot:title> {{ $title }} </x-slot>
    <x-slot:robots> {{ $robots }} </x-slot>
    <x-slot:description> {{ $description }} </x-slot>
    <x-slot:keywords> {{ $keywords }} </x-slot>
    <x-slot:catalogCategoryName> {{ $catalogCategoryName }} </x-slot>
    <x-slot:catalogCategoryTitleImg> {{ $catalogCategoryTitleImg }} </x-slot>    
   
    <div class="products-content">
        <aside class="aside-with-filters">      
            <div class="category-description">
                <p>{!! $catDescription !!}</p>
            </div>
            
            <div class="products-filter__title">
                <p>Фильтры для категории "{{ $catName }}"</p>
                <img src="/storage/icons/slider.png" alt="slider">
            </div>
            
            <div class="filter-products">
                <form class="checkbox-block" action="" method="get">
                    <x-dynamic-component :component="$filtersSetComponent" />
                    <div class="prop-list">
                        <button type="submit" class="submit" value="submit">Применить</button>
                    </div>
                </form>
            </div>
        </aside>
        <x-assortiment-cards />
    </div>
</x-maket-catalog>