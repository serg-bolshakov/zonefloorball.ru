<?php
// app/Http/Controllers/ProductController.php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;      // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;                 // подключаем класс модели к контроллеру, теперь мы можем использовать эту модель внутри методов контроллера...

use App\Http\Resources\ProductResource; // Вместо того чтобы вручную собирать данные в массив $productsArr, пробуем использовать ресурсы (Resources) в Laravel. Ресурсы позволяют преобразовывать модели и коллекции в JSON-структуру, что упрощает работу с данными.
                                        // В нашем случае нам нужно вернуть список товаров, пробуем использовать ресурс коллекции: php artisan make:resource ProductCollection
use App\Http\Resources\ProductCollection;
use App\Services\Catalog\CatalogServiceFactory;
use App\Services\Catalog\UrlParserService;
use App\Services\Catalog\CategoryService;

use App\Traits\CategoryTrait;
use App\Traits\ArrayTrait;
use App\Traits\FilterTrait;

class ProductController extends Controller
{
    use ArrayTrait, CategoryTrait, FilterTrait;
    protected $urlParser;

    public function __construct(UrlParserService $urlParser, CategoryService $categoryService) {
        $this->urlParser       = $urlParser;
        $this->categoryService = $categoryService;
    }
    
    public function index(Request $request) {
        // Получаем данные из URL
        $categoryId = $this->urlParser->getCategoryId();
       
        $filters    = $this->urlParser->getFilters();
        $filtersArr = $this->urlParser->getFilters();

        // Получаем информацию о категории
        $categoryUrlSemantic = $this->getCategoryUrlSemantic();
        $categoryInfo = $this->categoryService->getCategoryInfo($categoryUrlSemantic);
        
        // dump($filters);
        // dump($categoryUrlSemantic);
        // dd($categoryId);

        $perPage    = (int)$request->input('perPage', 6);
        $page       = (int)$request->input('page', 1);
        $sortBy     = $request->input('sortBy', 'actual_price');
        $sortOrder  = $request->input('sortOrder', 'asc');
        
        // Создаём базовый запрос
        $query = Product::query()
            ->with(['category', 'brand', 'properties', 'productShowCaseImage',])
            // ->where('product_status_id', '=', 1) - перенес! Фильтр по статусу уже применяется в BaseFilterService

            /*  набор фильтров, который был изначально... 
                ->when($filterBrandSet, function ($query, $filterBrandSet) {
                    $query->whereIn('brand_id', $filterBrandSet);
                })
                ->when($filterSizeSet, function ($query, $filterSizeSet) {
                    $query->whereIn('size_id', $filterSizeSet);
                })
                ->when($filterHookBladeProdIds, function ($query, $filterHookBladeProdIds) {
                    $query->whereIn('id', $filterHookBladeProdIds);
                })
                ->when($filterBladeStiffnessProdIds, function ($query, $filterBladeStiffnessProdIds) {
                    $query->whereIn('id', $filterBladeStiffnessProdIds);
                })
                ->when($filterHookStickProdIds, function ($query, $filterHookStickProdIds) {
                    $query->whereIn('id', $filterHookStickProdIds);
                })
                ->when($filterStickSizesSet, function ($query, $filterStickSizesSet) {
                    $query->whereIn('size_id', $filterStickSizesSet);
                })
                ->when($filterStickShaftFlexProdIds, function ($query, $filterStickShaftFlexProdIds) {
                    $query->whereIn('id', $filterStickShaftFlexProdIds);
                })
                ->when($filterProdPropIds, function ($query, $filterProdPropIds) {
                    $query->whereIn('id', $filterProdPropIds);
                })
                ->when($categoriesIdsArr, function ($query, $categoriesIdsArr) {
                    $query->whereIn('category_id', $categoriesIdsArr);
                })
                ->whereRaw($whereFromCategoryList) 
                ->whereRaw($whereFromProdModel)
            */
            
            /* Теперь мы можем присоединить этот подзапрос к основному запросу через joinSub: https://github.com/russsiq/laravel-docs-ru/blob/9.x/docs/queries.md#full-text-where-clauses
               Вы можете использовать методы joinSub, leftJoinSub и rightJoinSub, чтобы присоединить запрос к подзапросу. 
               Каждый из этих методов получает три аргумента: подзапрос, псевдоним таблицы и замыкание, определяющее связанные столбцы. 
               В нашем случае мы получим коллекцию продуктов, где каждая запись продукта также содержит временную метку created_at последней занесённой в базу цене продукт
            
                ->leftJoinSub($latestActualPrice, 'actual_prices', function ($join) {
                    $join->on('products.id', '=', 'actual_prices.product_id');
                })
                ->leftJoinSub($latestRegularPrice, 'regular_prices', function($join) {
                    $join->on('products.id', '=', 'regular_prices.product_id');
                })
                ->select('products.*', 'actual_prices.price_value as actual_price', 'regular_prices.price_value as regular_price')
            */

            ->orderBy($sortBy, $sortOrder)
        ;

        // Применяем подзапросы для цен
        $this->applyPriceSubqueries($query);
       
        // Выбираем сервис для фильтрации
        $filterService = CatalogServiceFactory::create($categoryUrlSemantic, $query);

        // Применяем фильтры
        $filteredQuery = $filterService->applyFilters($filters);

        // Пагинация
        $products = $filteredQuery->paginate($perPage, ['*'], 'page', $page);
        
        // dd('!');
        /* Комментируем "ручное"заполнение массива - пробуем по-новому...
            $productsArr = [];
            $i = 0;

            if(!empty($products)) {    
                foreach($products as $product) {
                    $productsArr[$i]['title'] = $product->title;
                    $productsArr[$i]['prod_url_semantic'] = $product->prod_url_semantic;
                    $productsArr[$i]['img_link'] = $product->productShowCaseImage->img_link;
                    $productsArr[$i]['category'] = $product->category->category;
                    $productsArr[$i]['brand'] = $product->brand->brand ?? NULL;
                    $productsArr[$i]['model'] = $product->model  ?? NULL;
                    $productsArr[$i]['marka'] = $product->marka  ?? NULL;
                    $productsArr[$i]['price_actual'] = $product->actualPrice->price_value  ?? NULL;
                    $productsArr[$i]['price_regular'] = $product->regularPrice->price_value  ?? NULL;
                    $productsArr[$i]['prod_status'] = $product->product_status_id;
                    $i++;
                }

                # сортируем массив по цене товара: 
                $key = 'price_actual'; 
                $orderSort = SORT_ASC;
                $productsArr = $this->array_multisort_value($productsArr, $key, $orderSort);
                //dump($productsArr);
                $prodQuantity = count($productsArr);
            }
            // dd($productsArr);
            // dd($prodQuantity);
            
            return view('components.assortiment-cards', [
                'productsArr' => $productsArr,
                'prodQuantity' => $prodQuantity,
            ]);   
        */

        // dd($products);
        // Формируем данные для ответа
        $responseData = [
            'title' => $categoryInfo ? $categoryInfo->tag_title : 'Флорбольный каталог',
            'robots' => 'INDEX,FOLLOW',
            'description' => $categoryInfo ? $categoryInfo->meta_name_description : 'Всё для флорбола. Найти, выбрать и купить лучшую экипировку для флорбола для детей и взрослых от ведущего мирового производителя.',
            'keywords' => $categoryInfo ? $categoryInfo->meta_name_keywords : 'Товары для флорбола, флорбольная экипировка для взрослых и детей. Флорбольные клюшки, мячи, борта, ворота. Для вратарей.',
            'catalogCategoryName' => $categoryInfo ? $categoryInfo->category_title : 'Каталог флорбольных товаров',
            'catalogCategoryTitleImg' => $categoryInfo ? $categoryUrlSemantic : 'catalog-title',
            'catName' => $categoryInfo ? $categoryInfo->category_view_2 : 'Полный каталог флорбольных товаров',
            'catDescription' => $categoryInfo ? $categoryInfo->cat_description : 'Ведущий мировой производитель флорбольной экипировки представлен нами в России 
                с момента зарождения этой игры в 1993-м году у нас в стране. Сегодня Юнихок (UNIHOC) - официальный партнёр и спонсор международной федерации флорбола (IFF), 
                производит высококачественную и профессиональную экипировку для игроков всех возрастов и квалификации. 
                Бренд ZONE вошёл в историю в 2011-м году, произведя революцию в самом понимании и представлении игры в флорбол. 
                Это, пожалуй, лучшее, что есть на сегодня в мире.',
            'filtersSetComponent' => $categoryInfo ? $categoryUrlSemantic : '',
            'products' => new ProductCollection($products),  // Inertia.js использует JSON для передачи данных между Laravel и React. Когда мы передаём объект ProductCollection, он сериализуется в JSON. В процессе сериализации некоторые свойства объекта LengthAwarePaginator (например, lastPage, total, perPage и т.д.) могут быть преобразованы в массивы, если они имеют сложную структуру или если в процессе сериализации происходит дублирование данных - это проблема: в react мы получаем не значения, а массиивы значений (дублирование), что приводит к проблемам при рендеринге данных
            // 'products' => (new ProductCollection($products))->response()->getData(true),
            'filters' => $filters,
            'sortBy' => $sortBy,
            'sortOrder' => $sortOrder,
            'categoryId' => $categoryId,
        ];
        //dd($responseData);
        // Возвращаем ответ
        // return $categoryInfo
        //     ? view('catalog.category', $responseData)
        //     : Inertia::render('Catalog', $responseData);
        return Inertia::render('Catalog', $responseData);
        
    }

    protected function applyPriceSubqueries($query) {
        // Подзапрос для актуальной цены
        // в части получения цен переходим из модели использования with на join: создаём подзапросы, которые будут возвращать только последние цены для каждого товара. 
        // Это аналогично тому, что делает ofMany в отношениях, но на уровне SQL:
        $latestActualPrice = DB::table('prices as p1')
            ->select('p1.product_id', 'p1.price_value')
            ->where('p1.date_end', '>', now())
            ->orWhereNull('p1.date_end')
            ->whereRaw('p1.id = (
                SELECT MAX(p2.id)
                FROM prices as p2
                WHERE p2.product_id = p1.product_id
                AND p2.price_type_id = 2
            )');

        // подзапрос для регулярной цены. Этот подзапрос вернёт последнюю регулярную цену для каждого товара:
        $latestRegularPrice = DB::table('prices as p1')
        ->select('p1.product_id', 'p1.price_value')
        ->where('p1.price_type_id', '=', 2)
        ->whereRaw('p1.id = (
            SELECT MAX(p2.id)
            FROM prices as p2
            WHERE p2.product_id = p1.product_id
            AND p2.price_type_id = 2
        )');

        // Присоединяем подзапросы
        $query
            ->leftJoinSub($latestActualPrice, 'actual_prices', function ($join) {
                $join->on('products.id', '=', 'actual_prices.product_id');
            })
            ->leftJoinSub($latestRegularPrice, 'regular_prices', function ($join) {
                $join->on('products.id', '=', 'regular_prices.product_id');
            })
            ->select('products.*', 'actual_prices.price_value as actual_price', 'regular_prices.price_value as regular_price');
    }
}
