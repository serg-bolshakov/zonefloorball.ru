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
                <p>Ведущий мировой производитель флорбольной экипировки представлен нами в России 
                с момента зарождения этой игры у нас в стране в 1993-м году. Сегодня Юнихок (UNIHOC) - официальный партнёр и спонсор международной федерации флорбола (IFF), 
                производит высококачественную и профессиональную экипировку для игроков всех возрастов и квалификации. 
                Бренд ZONE вошёл в историю в 2011-м году, произведя революцию в самом понимании и представлении игры в флорбол. 
                Это, пожалуй, лучшее, что есть на сегодня в мире.</p>
            </div>
            
        @foreach($categoriesMenuArr as $category)
            @if(isset($category[0]))
            <button class="accordion">{{ $category[0]->category_view }}</button>
            <div class="panel">
                <p><a href="/products/catalog?{{ $category[0]->url_semantic}}">Смотреть все</a>
                @foreach($category as $key=>$value)                                 
                    @if(isset($value->prop_url_semantic) && ($key != 0)) {{-- сюда только клюшки попадают --}}
                    {{--<p><a href="/products/catalog?{{ $category[0]->url_semantic}}={{ $value->prop_url_semantic }}">{{ $value->prop_value_view }}</a></p> --}}
                    <li><a href="/products/catalog?{{ $category[0]->url_semantic}}=serie&serie={{ $value->prop_url_semantic }}">{{ $value->prop_value_view }}</a></li>
                    @elseif(!empty($value->model) && $key != 0)
                    <li><a href="/products/catalog?{{ $value->url_semantic }}=model&model={{ $value->model }}">{{ $value->model }}</a></li> 
                    @elseif(!empty($value->url_semantic) && $key != 0)
                    <li><a href="/products/{{ $category[0]->url_semantic }}?category%5B%5D={{ $value->url_semantic }}">{{ $value->category_view_2 }}</a></li> 
                    @php //var_dump($category[0]); @endphp
                    @elseif($key != 0)
                    <p><strong !important>{{ $category[$key][0]->category_view_2 }}<strong></p>
                        <ul class="prodsubcat-list__pop-up">@php //var_dump($subCatValue->url_semantic); @endphp
                        @foreach($category[$key] as $subCatKey=>$subCatValue)
                            @if(isset($subCatValue->url_semantic) && ($subCatKey != 0)) 
                            <li><a href="/products/{{ $category[0]->url_semantic }}?category%5B%5D={{ $subCatValue->url_semantic }}">{{ $subCatValue->category_view_2 }} </a></li>
                            @endif
                        @endforeach
                        </ul> 
                    @endif
                @endforeach
            </div>
            @endif
        @endforeach
        </aside>
        <x-assortiment-cards />
    </div>
</x-maket-catalog>