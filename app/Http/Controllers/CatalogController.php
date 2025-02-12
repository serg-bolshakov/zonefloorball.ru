<?php
    namespace App\Http\Controllers;
    
    use Illuminate\Http\Request;        // подключим класс Request
    use Illuminate\Support\Facades\DB;  // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды
    
    use App\Models\Brand;               // подключаем класс модели к контроллеру, теперь мы можем использовать эту модель внутри методов контроллера...
    use App\Models\Category;
    use App\Models\Product;

    use App\Traits\CategoryTrait;
    use App\Traits\ArrayTrait;
    use App\Traits\FilterTrait;

    class CatalogController extends Controller {
        use ArrayTrait;
        use CategoryTrait;
        use FilterTrait;

        public $requestWithFilters;
        public function __construct(Request $request)
        {
            # у нас будет доступна переменная $request, содержащая нужный нам объект запроса. Получаем GET-запрос из адресной строки и записываем его в свойство:
            $this->requestWithFilters = $request->all();
            // dd($this->requestWithFilters);
        }

        public function index(Request $request) {
            $categoryId = $this->getCategoryIdViaUrl();
            $filtersArr = $this->requestWithFilters;

// 08.01.2025: столкнулся такой штукой, что то, что должно работать как задумано, не работает корректно в гул хроме на большом экране
// в EDGE везде и в гугл хроме на мобильных - всё работает как задумано
// смотрел код - всё должно рабоать как нужно... пока оставим...
// этот код пытался встроить от попыток хоть что-то сделать... и констуктор пришил тоже в этих же порывах...
/*            if(empty($categoryId) && !empty($filtersArr)) {
                // dd('!');
                $categoryUrlSemantic = array_key_first($filtersArr);                        // Получить первый ключ заданного массива array, не затрагивая внутренний указатель массива.
                $categoryId = $this->getCategoryIdViaSlug($categoryUrlSemantic);            // если изначально id категории был неопределен - пробуем его получить
                // dd($categoryId);
                # если категория товара определена, получаем запрашиваемое свойство:
                if(!empty($categoryId)) {
                    $prodPropTitle = $filtersArr[$categoryUrlSemantic];
                    // dd($prodPropTitle);
                    # если это модель, то просто делаем выборку подходящих товаров из $products:
                    if(!empty($prodPropTitle) && $prodPropTitle == 'model') {
                        $prodPropModelValue = $filtersArr['model'];
                        $whereFromCategoryList = "category_id = $categoryId";
                        $whereFromProdModel = "model LIKE '$prodPropModelValue'";
                        // dd($prodPropModelValue);
                    } elseif(!empty($prodPropTitle) && $prodPropTitle == 'serie') {
                        $prodPropUrlSemantic = $filtersArr[$prodPropTitle];
                        $prodPropId = DB::table('properties')->where('prop_title', '=', $prodPropTitle)->where('prop_url_semantic', '=', $prodPropUrlSemantic)->value('id'); 
                        $filterProp[] = $prodPropId;
                        
                        $prodIds = DB::table('product_property')->select('product_id')->whereIn('property_id',  $filterProp)->get();
                        foreach ($prodIds as $prodId) {
                            $filterProdPropIds[] = $prodId->product_id;
                        }

                        $whereFromCategoryList = "category_id = $categoryId";
                    } else {
                        $whereFromCategoryList = "category_id = $categoryId";
                    }
                }           
            }
*/
            $categoryUrlSemantic = $this->getCategoryUrlSemantic();
            $categoryInfo = DB::table('categories')->where('url_semantic', '=', $categoryUrlSemantic)->first();
            // dd($request);
            if(!empty($categoryInfo)) {
                
                $asideWithFilters = $this->getAsideWithFilters($categoryInfo->id, 1); 
                
                return view('catalog.category', [
                    'title' => $categoryInfo->tag_title,
                    'robots' => 'INDEX,FOLLOW',
                    'description' => $categoryInfo->meta_name_description,
                    'keywords' => $categoryInfo->meta_name_keywords,
                    'catalogCategoryName' => $categoryInfo->category_title,
                    'catalogCategoryTitleImg' => $categoryUrlSemantic,
                    'catName' => $categoryInfo->category_view_2,
                    'catDescription' => $categoryInfo->cat_description,
                    'filtersSetComponent' => "aside-with-filters.$categoryUrlSemantic",
                    'asideWithFilters' => $asideWithFilters,
                ]);

            } else {
                $categoriesMenuArr = $this->getMenuCategories();    // это боковое меню - в данном случае аккордеон товарных категорий
                // dd('!');
                return view('catalog.index', [
                    'title' => 'UnihocZoneRussia. Каталог товаров для флорбола',
                    'robots' => 'INDEX,FOLLOW',
                    'description' => 'Всё для флорбола. Найти, выбрать и купить лучшую экипировку для флорбола для детей и взрослых от ведущего мирового производителя.',
                    'keywords' => 'Товары для флорбола, флорбольная экипировка для взрослых и детей. Флорбольные клюшки, мячи, борта, ворота. Для вратарей.',
                    'catalogCategoryName' => 'Каталог флорбольных товаров',
                    'catalogCategoryTitleImg' => 'catalog-title',
                    'categoriesMenuArr' => $categoriesMenuArr,
                ]);
            }
        }
    }
        