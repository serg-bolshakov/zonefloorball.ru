<?php
// app/Http/Controllers/BagsAsideFiltersController.php

    namespace App\Http\Controllers;
    
    use App\Traits\FilterTrait;
    use Inertia\Inertia;

    class BagsAsideFiltersController extends Controller {
        use FilterTrait;
        public function index() {
            try {
                $asideWithBagsFilters = $this->getAsideWithFilters($categoryId = 5, $prodStatus = 1); // этот метод для сумок и мчей не работает!
                return response()->json([
                    'asideWithBagsFilters' => $asideWithBagsFilters,
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'error' => $e->getMessage(),
                ], 500);
            }
        }
    }

    /** надо будет подумать: добавить один чехол для клюшки, например!!! и довести до ума... пока отложим...
     namespace App\View\Components\AsideWithFilters;

            class Bags extends Component
            {   

                use FilterTrait;
                use CategoryTrait;

                public function __construct(Request $request)
                {
                    # у нас будет доступна переменная $request, содержащая нужный нам объект запроса. Получаем GET-запрос из адресной строки и записываем его в свойство:
                    $this->requestWithFilters = $request->all();
                }

                public function render(): View|Closure|string
                {
                    $categoryUrlSemantic = $this->getCategoryUrlSemantic();
                    $categoryId = $this->getCategoryIdViaUrl();
                    $target = $this->getBrandedCategoriesMenuArrMainCategory($branId = 0, $categoryId);
                    $brands = $this->getCategoryPossibleBrands($target['catIds']);
                    
                    # если в категории товары одного бренда, нет смысла делать фильтр по бренду:
                    $asideWithFilters['brands'] = $this->getCheckedFilterBrandsIfExists($brands);

                    # тоже, проверяем если категория не одна...
                    $categories = $target[$categoryId];
                    $asideWithFilters['categories'] = $this->getCheckedFilterCategoriesIfExists($categories);

                    //dd($asideWithFilters);

                    return view("components.aside-with-filters.$categoryUrlSemantic", [
                        'asideWithFilters' => $asideWithFilters,
                    ]);

                }

            } 
     
     */