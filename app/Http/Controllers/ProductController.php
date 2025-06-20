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
        $responseData = $this->getResponseData($request);
        return Inertia::render('Catalog', $responseData);
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
        // Получаем данные из URL
        $categoryId = $this->urlParser->getCategoryId();
       
        $filters    = $this->urlParser->getFilters();
        $filtersArr = $this->urlParser->getFilters();

        // Получаем информацию о категории
        $categoryUrlSemantic = $this->getCategoryUrlSemantic();
        $categoryInfo = $this->categoryService->getCategoryInfo($categoryUrlSemantic);

        $perPage    = (int)$request->input('perPage', 6);
        $page       = (int)$request->input('page', 1);
        $sortBy     = $request->input('sortBy', 'actual_price');
        $sortOrder  = $request->input('sortOrder', 'asc');

        // Создаём базовый запрос
        $query = Product::query()
            ->with(['category', 'brand', 'properties', 'productShowCaseImage',])
           
            /*  набор фильтров, который был изначально... 
                ...
                ->when($categoriesIdsArr, function ($query, $categoriesIdsArr) {
                    $query->whereIn('category_id', $categoriesIdsArr);
                })
                ->whereRaw($whereFromCategoryList) 
                ->whereRaw($whereFromProdModel)
            */
            
            ->orderBy($sortBy, $sortOrder)
        ;

        // Поиск по каталогу
        $searchTerm = $request->input('search');
        $searchType = $request->input('searchType', 'title'); // По умолчанию поиск по наименованию товара

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
       
        // Выбираем сервис для фильтрации
        $filterService = CatalogServiceFactory::create($categoryUrlSemantic, $query);

        // Применяем фильтры
        $filteredQuery = $filterService->applyFilters($filters);
        
        // Пагинация
        $products = $filteredQuery->paginate($perPage, ['*'], 'page', $page);
        // dump(new ProductCollection($products));
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
            //'filters' => $filters,
            'sortBy' => $sortBy,
            'sortOrder' => $sortOrder,
            'search' => $request->input('search', ''),
            'searchType' => $request->input('searchType', 'title'),
            'categoryId' => $categoryId,
            'categoryInfo' => $categoryInfo ?? '',
        ];
        //dd($responseData);
        return $responseData;
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
