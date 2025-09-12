<?php
// app/Http/Controllers/ProductsTableController.php
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

class ProductsTableController extends Controller
{
    use ArrayTrait, CategoryTrait, FilterTrait;
    protected $urlParser;

    public function __construct(UrlParserService $urlParser, CategoryService $categoryService) {
        $this->urlParser       = $urlParser;
        $this->categoryService = $categoryService;
    }
    
    public function index(Request $request) {
        \Log::debug('ProductsTableController begin', [
            '$request' => $request->all(),
        ]);
        try {
            $responseData = $this->getResponseData($request);
            // dd($responseData);
            return Inertia::render('ProductTable', $responseData);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function catalogApi(Request $request) {
        try {
            $responseData = $this->getResponseData($request);
            return $responseData;
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    protected function getResponseData(Request $request) {
        
        // dd($request);
        
        // Получаем данные из URL
        $categoryId = $this->urlParser->getCategoryId();            // не работает корректно для http://127.0.0.1:8000/profile/products-table?category=balls&page=1 -> возвращает null 
        // Получаем информацию о категории
        $categoryUrlSemantic = $this->getCategoryUrlSemantic();     // в нашем случае это работает некорретно, но переопределяется, если пошло что-то не так в условии if(empty($categoryId)) ниже

        // если null, пробуем по-дугому:
        if(empty($categoryId)) {
            // $request->category; - это в нашем случае будет: ball или $categoryUrlSemantic
            $categoryUrlSemantic = $request->category;
            $categoryId = $this->getCategoryIdViaSlug($categoryUrlSemantic);
        }
        
        $filters    = $this->urlParser->getFilters();
        $filtersArr = $this->urlParser->getFilters();

        $categoryInfo = null;
        if(!empty($categoryUrlSemantic)) { $categoryInfo = $this->categoryService->getCategoryInfo($categoryUrlSemantic); }

        $perPage    = (int)$request->input('perPage', 10);
        $page       = (int)$request->input('page', 1);
        $sortBy     = $request->input('sortBy', 'actual_price');
        $sortOrder  = $request->input('sortOrder', 'asc');
        $tableMode  = $request->input('tableMode', 'cart');
        
        $searchTerm = $request->input('search');
        $searchType = $request->input('searchType', 'article'); // По умолчанию поиск по артикулу

        // Создаём базовый запрос
        $query = Product::query()
            ->with(['category', 'brand', 'properties', 'productShowCaseImage', 'productReport'])            
            ->orderBy($sortBy, $sortOrder)
        ;

        if ($tableMode === 'preorder') {
            // Только товары для предзаказа (on_preorder > 0)
            $query->whereHas('productReport', function($q) {
                $q->where('on_preorder', '>', 0);
            });
        } else {
            // Только товары в наличии (on_sale > 0)
            $query->whereHas('productReport', function($q) {
                $q->where('on_sale', '>', 0);
            });
        }

        if ($searchTerm) {
            $query->where(function($q) use ($searchTerm, $searchType) {
                $terms = explode(' ', trim($searchTerm));
                
                if ($searchType === 'article') {
                    $q->where('article', 'LIKE', "%{$searchTerm}%");
                } else {
                    foreach ($terms as $term) {
                        if (strlen($term) >= 3) { // Ищем только слова от 3 символов
                            $q->where(function($subQuery) use ($term) {
                                $subQuery->where('title', 'LIKE', "%{$term}%")
                                        ->orWhere('meta_name_description', 'LIKE', "%{$term}%");
                            });
                        }
                    }
                }
            });
        }

        // Применяем подзапросы для цен
        $this->applyPriceSubqueries($query);

        // $test = $query->get();
        // dd($test);
        // dd($test->pluck('id', 'article')); // Ищем дубликаты


        /* $latestPreorderPrice = DB::table('prices as p1')
        ->select('p1.product_id', 'p1.price_value')
        ->where(function($query) {
            $query->where('p1.date_end', '>', now())
                ->orWhereNull('p1.date_end');
        })
        ->whereRaw('p1.id = (
            SELECT MAX(p2.id)
            FROM prices as p2
            WHERE p2.product_id = 221
            AND p2.price_type_id = 3
        )')
        ->get();
        dd($latestPreorderPrice);*/

        // Выбираем сервис для фильтрации
        $filterService = CatalogServiceFactory::create($categoryUrlSemantic, $query);

        // Применяем фильтры
        $filteredQuery = $filterService->applyFilters($filters);
        // dd($filteredQuery);

        // $test = $filteredQuery->get();
        // dd($test);
        // dd($test->pluck('id', 'article')); // Ищем дубликаты
        
        // Пагинация
        $products = $filteredQuery->paginate($perPage, ['*'], 'page', $page);
        // dd(new ProductCollection($products));
        // dd($products);
        // Формируем данные для ответа
        $responseData = [
            'title' => 'Личный кабинет. Флорбольный каталог',
            'robots' => 'NOINDEX,NOFOLLOW',
            'description' => '',
            'keywords' => '',
            'catalogCategoryName' => $categoryInfo ? $categoryInfo->category_title : 'Каталог флорбольных товаров',
            'catalogCategoryTitleImg' => $categoryInfo ? $categoryUrlSemantic : 'catalog-title',
            'catName' => $categoryInfo ? $categoryInfo->category_view_2 : 'Полный каталог флорбольных товаров',
            'catDescription' => '',
            'products' => new ProductCollection($products),  // Inertia.js использует JSON для передачи данных между Laravel и React. Когда мы передаём объект ProductCollection, он сериализуется в JSON. В процессе сериализации некоторые свойства объекта LengthAwarePaginator (например, lastPage, total, perPage и т.д.) могут быть преобразованы в массивы, если они имеют сложную структуру или если в процессе сериализации происходит дублирование данных - это проблема: в react мы получаем не значения, а массиивы значений (дублирование), что приводит к проблемам при рендеринге данных
            //'filters' => $filters,
            'sortBy' => $sortBy,
            'sortOrder' => $sortOrder,
            'tableMode' => $tableMode,
            'search' => $request->input('search', ''),
            'searchType' => $request->input('searchType', 'article'),
            'categoryId' => $categoryId,
            'categoryInfo' => $categoryInfo,
        ];
        // dd($responseData);
        return $responseData;
    }

    protected function applyPriceSubqueries($query) {
        // Подзапрос для актуальной цены
        // в части получения цен переходим из модели использования with на join: создаём подзапросы, которые будут возвращать только последние цены для каждого товара. 
        // Это аналогично тому, что делает ofMany в отношениях, но на уровне SQL:
        
        $latestActualPrice = DB::table('prices as p1')
        ->select('p1.product_id', 'p1.price_value')
        ->where(function($query) {
            $query->where('p1.date_end', '>', now())
                ->orWhereNull('p1.date_end');
        })
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

        $latestActionPrice = DB::table('prices as p1') // price_type_id = 3 - price_special
        ->select('p1.product_id', 'p1.price_value')
        ->where(function($query) {
            $query->where('p1.date_end', '>', now())
                ->orWhereNull('p1.date_end');
        })
        ->whereRaw('p1.id = (
            SELECT MAX(p2.id)
            FROM prices as p2
            WHERE p2.product_id = p1.product_id
            AND p2.price_type_id = 3        
        )');

        $latestPreorderPrice = DB::table('prices as p1')
        ->select('p1.product_id', 'p1.price_value')
        ->where(function($query) {
            $query->where('p1.date_end', '>', now())
                ->orWhereNull('p1.date_end');
        })
        ->whereRaw('p1.id = (
            SELECT MAX(p2.id)
            FROM prices as p2
            WHERE p2.product_id = p1.product_id
            AND p2.price_type_id = 4
        )');

        // Присоединяем подзапросы
        $query
            ->leftJoinSub($latestActualPrice, 'actual_prices', function ($join) {
                $join->on('products.id', '=', 'actual_prices.product_id');
            })
            ->leftJoinSub($latestRegularPrice, 'regular_prices', function ($join) {
                $join->on('products.id', '=', 'regular_prices.product_id');
            })
            ->leftJoinSub($latestActionPrice, 'action_prices', function ($join) {
                $join->on('products.id', '=', 'action_prices.product_id');
            })
            ->leftJoinSub($latestPreorderPrice, 'preorder_prices', function ($join) {
                $join->on('products.id', '=', 'preorder_prices.product_id');
            })
            ->select('products.*', 'actual_prices.price_value as actual_price', 'regular_prices.price_value as regular_price', 'action_prices.price_value as action_price', 'preorder_prices.price_value as preorder_price');
    }
}
