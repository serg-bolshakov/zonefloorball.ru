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

    use Inertia\Inertia;

    class CatalogReactController extends Controller {
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
                // dd($categoriesMenuArr);
                return Inertia::render('Catalog', [
                    'title' => 'UnihocZoneRussia. Каталог товаров для флорбола',
                    'robots' => 'INDEX,FOLLOW',
                    'description' => 'Всё для флорбола. Найти, выбрать и купить лучшую экипировку для флорбола для детей и взрослых от ведущего мирового производителя.',
                    'keywords' => 'Товары для флорбола, флорбольная экипировка для взрослых и детей. Флорбольные клюшки, мячи, борта, ворота. Для вратарей.',
                    'catalogCategoryName' => 'Каталог флорбольных товаров',
                    'catalogCategoryTitleImg' => 'catalog-title',
                    'catDescription' => 'Ведущий мировой производитель флорбольной экипировки представлен нами в России 
                            с момента зарождения этой игры у нас в стране в 1993-м году. Сегодня Юнихок (UNIHOC) - официальный партнёр и спонсор международной федерации флорбола (IFF), 
                            производит высококачественную и профессиональную экипировку для игроков всех возрастов и квалификации. 
                            Бренд ZONE вошёл в историю в 2011-м году, произведя революцию в самом понимании и представлении игры в флорбол. 
                            Это, пожалуй, лучшее, что есть на сегодня в мире.',
                    
                    'categoriesMenuArr' => $categoriesMenuArr,
                ]);
            }
        }
    }
        