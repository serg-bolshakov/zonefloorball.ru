<?php
// app/Http/Controllers/Admin/AdminProductsController.php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;      // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;                 // подключаем класс модели к контроллеру, теперь мы можем использовать эту модель внутри методов контроллера...

use App\Http\Resources\AdminProductResource; // Вместо того чтобы вручную собирать данные в массив $productsArr, пробуем использовать ресурсы (Resources) в Laravel. Ресурсы позволяют преобразовывать модели и коллекции в JSON-структуру, что упрощает работу с данными.
                                        // В нашем случае нам нужно вернуть список товаров, пробуем использовать ресурс коллекции: php artisan make:resource ProductCollection
use App\Http\Resources\AdminProductCollection;
use App\Services\Catalog\CatalogServiceFactory;
use App\Services\Catalog\UrlParserService;
use App\Services\Catalog\CategoryService;

use App\Traits\CategoryTrait;
use App\Traits\ArrayTrait;
use App\Traits\FilterTrait;

class AdminProductsController extends Controller
{
    use ArrayTrait, CategoryTrait, FilterTrait;
    protected $urlParser;

    public function __construct(UrlParserService $urlParser, CategoryService $categoryService) {
        $this->urlParser       = $urlParser;
        $this->categoryService = $categoryService;
    }
    
    public function index(Request $request) {
        /*\Log::debug('AdminProductsController begin', [
            '$request' => $request->all(),
        ]);*/
        try {
            $responseData = $this->getResponseData($request);
            // dd($responseData);
            return Inertia::render('AdminProductsTable', $responseData);
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
                
        $searchTerm = $request->input('search');
        $searchType = $request->input('searchType', 'article'); // По умолчанию поиск по артикулу

        // Создаём базовый запрос
        $query = Product::query()
            ->with(['category', 'brand', 'properties', 'productShowCaseImage', 'productReport'])            
            ->orderBy($sortBy, $sortOrder)
        ;

        if ($searchTerm) {
            $query->where(function($q) use ($searchTerm, $searchType) {
                $terms = explode(' ', trim($searchTerm));
                
                if ($searchType === 'article') {
                    $q->where('article', 'LIKE', "%{$searchTerm}%");
                }  elseif ($searchType === 'id') {
                    if (is_numeric($searchTerm)) {
                        $q->where('id', $searchTerm);
                    }
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

        // Выбираем сервис для фильтрации
        $filterService = CatalogServiceFactory::create($categoryUrlSemantic, $query);

        // Применяем фильтры
        $filteredQuery = $filterService->applyFilters($filters);
        // dd($filteredQuery);

        // Пагинация
        $products = $filteredQuery->paginate($perPage, ['*'], 'page', $page);
        // dd($products);
        // Формируем данные для ответа
        $responseData = [
            'title' => 'Админка. Каталог товаров',
            'robots' => 'NOINDEX,NOFOLLOW',
            'description' => '',
            'keywords' => '',
            'catalogCategoryName' => $categoryInfo ? $categoryInfo->category_title : 'Каталог товаров',
            'catalogCategoryTitleImg' => $categoryInfo ? $categoryUrlSemantic : 'catalog-title',
            'catName' => $categoryInfo ? $categoryInfo->category_view_2 : 'Полный каталог товаров',
            'catDescription' => '',
            'products' => new AdminProductCollection($products),  // Inertia.js использует JSON для передачи данных между Laravel и React. Когда мы передаём объект ProductCollection, он сериализуется в JSON. В процессе сериализации некоторые свойства объекта LengthAwarePaginator (например, lastPage, total, perPage и т.д.) могут быть преобразованы в массивы, если они имеют сложную структуру или если в процессе сериализации происходит дублирование данных - это проблема: в react мы получаем не значения, а массиивы значений (дублирование), что приводит к проблемам при рендеринге данных
            'sortBy' => $sortBy,
            'sortOrder' => $sortOrder,
            'search' => $request->input('search', ''),
            'searchType' => $request->input('searchType', 'article'),
            'categoryId' => $categoryId,
            'categoryInfo' => $categoryInfo,
        ];
        // dd($responseData);
        return $responseData;
    }

    protected function applyPriceSubqueries($query) {
        
        $latestActualPrice = DB::table('prices as p1')
        ->select('p1.product_id', 'p1.price_value', 'p1.price_type_id', 'p1.date_start', 'p1.date_end')
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
        ->select('p1.product_id', 'p1.price_value', 'p1.price_type_id', 'p1.date_start', 'p1.date_end')
        ->where('p1.price_type_id', '=', 2)
        ->whereRaw('p1.id = (
            SELECT MAX(p2.id)
            FROM prices as p2
            WHERE p2.product_id = p1.product_id
            AND p2.price_type_id = 2
        )');

        $latestSpecialPrice = DB::table('prices as p1') // price_type_id = 3 - price_special
        ->select('p1.product_id', 'p1.price_value', 'p1.price_type_id', 'p1.date_start', 'p1.date_end')
        ->where(function ($query) {
            // Условия на период действия
            $query->where(function ($subQ) {
                $subQ->where('date_end', '>', now())
                    ->orWhereNull('date_end');
            })
            // Условия на начало действия - ТОЛЬКО действующие акции
            ->where(function ($subQ) {
                $subQ->where('date_start', '<=', now())
                    ->orWhereNull('date_start');
            });
        })
        ->whereRaw('p1.id = (
            SELECT MAX(p2.id)
            FROM prices as p2
            WHERE p2.product_id = p1.product_id
            AND p2.price_type_id = 3        
        )');

        $latestPreorderPrice = DB::table('prices as p1')
        ->select('p1.product_id', 'p1.price_value', 'p1.price_type_id', 'p1.date_start', 'p1.date_end')
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
            ->leftJoinSub($latestSpecialPrice, 'special_prices', function ($join) {
                $join->on('products.id', '=', 'special_prices.product_id');
            })
            ->leftJoinSub($latestPreorderPrice, 'preorder_prices', function ($join) {
                $join->on('products.id', '=', 'preorder_prices.product_id');
            })
            // ->select('products.*', 'actual_prices.price_value as actual_price', 'regular_prices.price_value as regular_price', 'special_prices.price_value as special_price', 'preorder_prices.price_value as preorder_price');
            ->select([
                'products.*',
                // Actual price
                'actual_prices.price_value as actual_price',
                'actual_prices.date_start as actual_price_date_start', 
                'actual_prices.date_end as actual_price_date_end',
                'actual_prices.price_type_id as actual_price_type_id', // для проверки
                // Regular price  
                'regular_prices.price_value as regular_price',
                'regular_prices.date_start as regular_price_date_start',
                'regular_prices.date_end as regular_price_date_end',
                'regular_prices.price_type_id as regular_price_type_id', 
                // Special price
                'special_prices.price_value as special_price', 
                'special_prices.date_start as special_price_date_start',
                'special_prices.date_end as special_price_date_end',
                'special_prices.price_type_id as special_price_type_id', 
                // Preorder price
                'preorder_prices.price_value as preorder_price',
                'preorder_prices.date_start as preorder_price_date_start',
                'preorder_prices.date_end as preorder_price_date_end',
                'preorder_prices.price_type_id as preorder_price_type_id'
            ]);
    }
}
