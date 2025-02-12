<?php

namespace App\View\Components;
use Illuminate\Http\Request; // подключим класс Request
use Illuminate\Support\Facades\DB;  // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды

use App\Models\Product;
use App\Traits\CategoryTrait;
use App\Traits\ArrayTrait;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class AssortimentCards extends Component {

    use CategoryTrait;
    use ArrayTrait;
  
    # для получения данных в классе компонента, для начала объявим атрибут свойством класса компонента:
    public $requestWithFilters;     // a  работает и без записи свойства класса!!!

    # Теперь получим данные атрибута в конструкторе, указав объект запроса параметром действия, используя контроль типов:
    public function __construct(Request $request)
    {
        # у нас будет доступна переменная $request, содержащая нужный нам объект запроса. Получаем GET-запрос из адресной строки и записываем его в свойство:
        $this->requestWithFilters = $request->all();
        // dd($this->requestWithFilters);
        
        # если идёт запрос товаром основной категории, то мы получаем массив всех подкатегорий:
        $this->requestMainCategoryWithSubCats = [];
        if(empty($request->all())) { // в этом случае мы получаем запрос на ТОЛЬКО НА ОСНОВНУЮ категорию товаров, можем определить id  
            $this->requestMainCategoryWithSubCats = $this->getCategoryProducts($this->getCategoryIdViaUrl()); 
        }
    }


    public function render(): View|Closure|string
    {
        $categoriesIdsArr = [];
        $categoriesIdsStr = '';

        $categoryId = $this->getCategoryIdViaUrl();
        $filtersArr = $this->requestWithFilters;
        
        $whereFromCategoryList = $whereFromProdModel = '1';
        
        // dump($categoryId);

        if(!empty($categoryId)) { 
            if(array_key_exists('category', $filtersArr)) {
            //dd($categoryId);    
                $categoriesIdsStr = '';
                //dd($filtersArr);
                foreach($filtersArr['category'] as $key=>$categorySlug) {
                    //dd($category);
                    $categoryId = $this->getCategoryIdViaSlug($categorySlug);
                    $categoriesIdsStr .= $categoryId . ','; 
                }

                $categoriesIdsStr = trim($categoriesIdsStr, ',');

                //dd($categoriesIdsStr);
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
        
        // dd($this->requestWithFilters);
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
                //dd('!!!');
                //dd($filtersArr);
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


        $products = Product::with(['actualPrice', 'regularPrice', 'category', 'brand', 'properties'])
            ->where('product_status_id', '=', 1)
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
        ->get();
        // dd($products);
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
    }
}