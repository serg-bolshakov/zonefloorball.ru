<?php
// app/Services/Catalog/UrlParserService.php - сервис, который будет заниматься "парсингом" URL и обработкой параметров запроса.
namespace App\Services\Catalog;

use App\Traits\CategoryTrait;
use App\Traits\ArrayTrait;

use Illuminate\Support\Facades\DB; // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды
use Illuminate\Http\Request;
/* class UrlParserService - как можно было сделать по науке (подумать на досуге - сейчас пока берём тот вариант, который работает)
    class UrlParserService
    {
        protected $request;

        public function __construct(Request $request)
        {
            
            $this->request = $request;
        }

        public function getCategoryId(): ?int
        {
            $category = $this->request->segment(2); // Получаем часть URL, например, "sticks"
            return $this->resolveCategoryId($category); // Преобразуем в ID категории
        }

        public function getFilters(): array
        {
            return $this->request->except(['perPage', 'page', 'sortBy', 'sortOrder']);
        }

        protected function resolveCategoryId(?string $category): ?int
        {
            // Пример логики преобразования категории в ID
            switch ($category) {
                case 'sticks':
                    return 1; // ID для клюшек
                case 'balls':
                    return 2; // ID для мячей
                default:
                    return null; // Общий каталог
            }
        }
    }
*/

class UrlParserService
{
    use CategoryTrait, ArrayTrait;
    
    protected $request;

    public function __construct(Request $request)
    {
        # у нас будет доступна переменная $request, содержащая нужный нам объект запроса. Получаем GET-запрос из адресной строки и записываем его в свойство:
        // $this->requestWithFilters = $request->all();
        $this->requestWithFilters = $request->except(['perPage', 'page', 'sortBy', 'sortOrder']);
        //dd($this->requestWithFilters);
        
        # если идёт запрос товаров основной категории, то мы получаем массив всех подкатегорий:
        $this->requestMainCategoryWithSubCats = [];
        if(empty($request->except(['perPage', 'page', 'sortBy', 'sortOrder']))) { // в этом случае мы получаем запрос на ТОЛЬКО НА ОСНОВНУЮ категорию товаров, можем определить id  
            $this->requestMainCategoryWithSubCats = $this->getCategoryProducts($this->getCategoryIdViaUrl()); 
        }
    }

    public function getCategoryId(): ?int
    {
        return $this->getCategoryIdViaUrl();
    }

    public function getFilters(): array
    {
        $categoryId       = $this->getCategoryId();
        $categoriesIdsArr = [];
        $categoriesIdsStr = '';
        $filtersArr       = $this->requestWithFilters;
        $whereFromCategoryList = $whereFromProdModel = '1';

        if(!empty($categoryId)) { 
            if(array_key_exists('category', $filtersArr)) {
                $categoriesIdsStr = '';
                foreach($filtersArr['category'] as $key=>$categorySlug) {
                    //dd($category);
                    $categoryId = $this->getCategoryIdViaSlug($categorySlug);
                    $categoriesIdsStr .= $categoryId . ','; 
                }
                $categoriesIdsStr = trim($categoriesIdsStr, ',');
            } else {
                $categoriesIdsArr = $this->getCategoryProducts($this->getCategoryIdViaUrl());
                $whereFromCategoryList = '1';
            }

            if(!empty($categoriesIdsStr)) {
                $whereFromCategoryList = "category_id IN ($categoriesIdsStr)"; 
            }
        } 

        $filterBrandSet = $filterSizeSet = $filterHookBladeSet = $filterHookBladeProdIds = 
        $filterBladeStiffnessProdIds = $filterBladeStiffnessPropIds = $filterHookStickProdIds = 
        $filterStickSizesSet = $filterStickShaftFlexProdIds = $filterProdPropIds = [];
        
        //dd($this->requestWithFilters);
        if(!empty($this->requestWithFilters)) {
            // dd($this->requestWithFilters);
            # сюда так же попадают запросы не из категорий (categoryId == null), а из каталога типа :
            /*
                array:2 [▼ // app\View\Components\AssortimentCards.php:41
                "eyewears" => "model"
                "model" => "MATRIX"
                ]
            */

            /* вот это сюда тоже попадает, но пока не обрабатывается никак:
                # если категории не определены, запрос категории отсюда: http://127.0.0.1:8000/products/catalog?goalie => 
                получаем такой реквест для обработки: "goalie" => null - это когда мы выбираем "смотреть все" в каталоге из бокового меню 
            */
            // dd(empty($categoryId) && !empty($filtersArr) && !empty($filtersArr[array_key_first($filtersArr)]));
            if(empty($categoryId) && !empty($filtersArr) && !empty($filtersArr[array_key_first($filtersArr)])) {
                $categoryUrlSemantic = array_key_first($filtersArr);                        // Получить первый ключ заданного массива array, не затрагивая внутренний указатель массива.
                $categoryId = $this->getCategoryIdViaSlug($categoryUrlSemantic);            // если изначально id категории был неопределен - пробуем его получить
                
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
            } elseif(empty($categoryId) && !empty($filtersArr) && empty($filtersArr[array_key_first($filtersArr)])) {
                // dd(empty($categoryId) && !empty($filtersArr) && empty($filtersArr[array_key_first($filtersArr)]));
                $categoryUrlSemantic = array_key_first($filtersArr);                        // Получить первый ключ заданного массива array, не затрагивая внутренний указатель массива.
                $categoryId = $this->getCategoryIdViaSlug($categoryUrlSemantic);            // если изначально id категории был неопределен - пробуем его получить

                # если категория товара определена, получаем категории, где должны быть товары:
                if(!empty($categoryId)) {
                    $target = $this->getCategoryMenuArr($categoryId);

                    if(!empty($target[$categoryId])) {
                        // смотрим только основные родительские категории (у которых нет потомков, но есть товары):
                        if(isset($target[$categoryId]->id)) {
                            array_push($categoriesIdsArr, $target[$categoryId]->id);
                        }

                        foreach($target[$categoryId] as $category) {                           
                            if(isset($category->id)) {
                                $categoriesIdsStr .= $category->id .',';
                                array_push($categoriesIdsArr, $category->id);
                            }elseif(is_array($category)) {
                                foreach($category as $subcategory) {
                                    if(isset($subcategory->id)) {
                                        $categoriesIdsStr .= $subcategory->id .',';
                                        array_push($categoriesIdsArr, $subcategory->id);
                                    }
                                }
                            }
                        }                        
                    }
                }

            } else {
                // dd($filtersArr);
                foreach($filtersArr as $key => $filterArr) {
                    if($key == 'brand') {
                        foreach($filterArr as $filter) {
                            $brandId = DB::table('brands')->where('brand', 'LIKE', $filter)->value('id'); 
                            $filterBrandSet[] = $brandId;
                        }
                    } elseif($key == 'size' && $categoryId == '7') {
                        foreach($filterArr as $filter) {
                            $sizeId = DB::table('sizes')->where('size_title', '=', 'eyewears')->where('size_value', 'LIKE', $filter)->value('id'); 
                            $filterSizeSet[] = $sizeId;
                        }
                    } elseif($key == 'hook_blade') {
                        foreach($filterArr as $filter) {
                            $propId = DB::table('properties')->where('prop_title', '=', 'hook_blade')->where('prop_value', 'LIKE', $filter)->value('id'); 
                            $filterHookBladeSet[] = $propId;
                        }
                        
                        $prodIds = DB::table('product_property')->select('product_id')->whereIn('property_id', $filterHookBladeSet)->get();
                        foreach ($prodIds as $prodId) {
                            $filterHookBladeProdIds[] = $prodId->product_id;
                        }
                    } elseif($key == 'blade_stiffness') {
                        foreach($filterArr as $filter) {
                            $propId = DB::table('properties')->where('prop_title', '=', 'blade_stiffness')->where('prop_value', 'LIKE', $filter)->value('id'); 
                            $filterBladeStiffnessPropIds[] = $propId;
                        }

                        $prodIds = DB::table('product_property')->select('product_id')->whereIn('property_id', $filterBladeStiffnessPropIds)->get();
                        foreach ($prodIds as $prodId) {
                            $filterBladeStiffnessProdIds[] = $prodId->product_id;
                        }
                    } elseif($key == 'hook') {
                        foreach($filterArr as $filter) {
                            $propId = DB::table('properties')->where('prop_title', '=', 'hook')->where('prop_value', 'LIKE', $filter)->value('id'); 
                            $filterHookSticksIds[] = $propId;
                        }
                        
                        $prodIds = DB::table('product_property')->select('product_id')->whereIn('property_id', $filterHookSticksIds)->get();
                        foreach ($prodIds as $prodId) {
                            $filterHookStickProdIds[] = $prodId->product_id;
                        }
                    } elseif($key == 'size' && $categoryId == '1') {
                        foreach($filterArr as $filter) {
                            $sizeId = DB::table('sizes')->where('size_title', '=', 'shaft_length')->where('size_value', '=', $filter)->value('id'); 
                            $filterStickSizesSet[] = $sizeId;
                        }
                    } elseif($key == 'shaft_flex' && $categoryId == '1') {
                        foreach($filterArr as $filter) {
                            $propId = DB::table('properties')->where('prop_title', '=', 'shaft_flex')->where('prop_value', '=', $filter)->value('id'); 
                            $filterStickShaftFlexPropIds[] = $propId;
                        }

                        $prodIds = DB::table('product_property')->select('product_id')->whereIn('property_id',  $filterStickShaftFlexPropIds)->get();
                        foreach ($prodIds as $prodId) {
                            $filterStickShaftFlexProdIds[] = $prodId->product_id;
                        }
                    }
                }
            }
        }
        
        if(empty($categoriesIdsArr)) {  // это значит, что мы запрашиваем основную категорию... со всеми её подкатегориями...
            $categoriesIdsArr = $this->requestMainCategoryWithSubCats;
            $whereFromCategoryList = '1';
        }
        
        // dump($categoriesIdsArr);
        // dd($whereFromCategoryList);

        //dd('finish');
        return $this->requestWithFilters;
    }
}