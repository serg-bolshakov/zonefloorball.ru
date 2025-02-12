<x-maket-main>
    <x-slot:title>Карта сайта</x-slot>
    <x-slot:robots>FOLLOW,INDEX</x-slot>
    <x-slot:description>Карта сайта интернет-магазина флорбольной экипировки</x-slot>
    <x-slot:keywords>флорбольная экипировка всё для флорбола unihoc zone юнихок алетерс зоун</x-slot> 
    
    {{-- @section('content') --}}
    
    <div class="sitemap">
        <div class="sitemap-content">
            <h1 class="text-align-center">Карта сайта</h1>
            
            <h2 class="margin-bottom12px"><a href="/">Главная</a></h2>
            <h2 class="margin-bottom12px"><a href="/products/catalog">Каталог</a></h2>
            
            @foreach($categories as $category)
            <div class="margin-bottom12px">
            @if(isset($category[0]))
                <div class="margin-bottom8px"><a href="/products/catalog?{{ $category[0]->url_semantic}}"><h2>{{ $category[0]->category_view}}</h2></a></div>
                <div class="margin-left12px">
                    @foreach($category as $key=>$value)  
                        <!-- <div class="">                                -->
                        @if(isset($value->prop_url_semantic) && ($key != 0)) 
                        <div><a href="/products/catalog?{{ $category[0]->url_semantic}}={{ $value->prop_title }}&{{ $value->prop_title }}={{ $value->prop_url_semantic }}">{{ $value->prop_value_view }}</a></div>
                        @elseif(!empty($value->model) && $key != 0)
                        <div><a href="/products/catalog?{{ $value->url_semantic }}=model&model={{ $value->model }}">{{ $value->model }}</a></div> 
                        @elseif(!empty($value->url_semantic) && $key != 0)
                        <div><a href="/products/{{ $category[0]->url_semantic }}?category%5B%5D={{ $value->url_semantic }}">{{ $value->category_view_2 }}</a></div> 
                        @php //var_dump($category[0]); @endphp
                        @elseif($key != 0)
                        {{-- <a href="/products/catalog?">{{ $category[$key][0]->category_view_2}}</a> --}}
                        <p class="margin-top12px"><strong>{{ $category[$key][0]->category_view_2}}</strong></p>
                            <ul class="prodsubcat-list__pop-up">
                            @foreach($category[$key] as $subCatKey=>$subCatValue)
                                @if(isset($subCatValue->url_semantic) && ($subCatKey != 0))
                                <li><a href="/products/catalog?{{ $subCatValue->url_semantic }}">{{ $subCatValue->category_view_2 }} </a></li>
                                @endif
                            @endforeach
                            </ul> 
                        @endif
                        <!-- <div> -->
                    @endforeach
                </div>
            @endif
            <hr>
            </div>
            @endforeach
        </div>
    </div>
    {{-- @endsection --}}

</x-maket-main>

{{-- 
    
    Мои действия:
    1) Установил пакет spatie/laravel-sitemap
    2) Создал контроллер для генерации карты на сайте php artisan make:controller SitemapController
    3) Добавил маршрут в routes/web.php: Route::get('/generate-sitemap', [SitemapController::class, 'generate']);
    
    Далее создаём HTML-карту сайта:
    1) Контроллер: php artisan make:controller SiteMapController
    2) Представление: resources/views -> sitemap.blade.php
    3) Маршрут: Route::get('/sitemap', [SiteMapController::class, 'index']);
    
    Для того, чтобы карта была актуальной, настраиваем автоматическое обновление XML-карты (с помощью планировщика задач Laravel (cron)):    
    А)  сначала будем прописывать логику генерации сайта, для этого создаем команду: 
        php artisan make:command GenerateSitemap    // Console command [C:\OSPanel\domains\version3\app\Console\Commands\GenerateSitemap.php] created successfully.
    Б) настроим планировщик: в файле app/Console/Kernel.php добавим команду:
    protected function schedule(Schedule $schedule)
        {
            $schedule->command('sitemap:generate')->daily();
        }
        
    Для проверки, чтобы всё работает запускаем команду: php artisan sitemap:generate

    Теперь всё реализуем "шаг за шагом"...
--}}