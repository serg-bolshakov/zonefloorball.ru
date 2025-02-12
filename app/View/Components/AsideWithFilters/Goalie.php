<?php

namespace App\View\Components\AsideWithFilters;
use Illuminate\Http\Request; // подключим класс Request
// use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;  // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

use App\Traits\FilterTrait;

class Goalie extends Component
{   

    use FilterTrait;

    public function __construct(Request $request)
    {
        # у нас будет доступна переменная $request, содержащая нужный нам объект запроса. Получаем GET-запрос из адресной строки и записываем его в свойство:
        $this->requestWithFilters = $request->all();
    }

    public function render(): View|Closure|string
    {
        $categoryId = 8;
        $target = $this->getBrandedCategoriesMenuArr($branId = 0, $categoryId);
        //dd($target);
        $brands = $this->getGoaliePossibleBrands($target['catIds']);
        $asideBrandsFiltersChecked = collect([]);
        foreach($brands as $filter) {
            // dd($filter->brand);
            $isBrandChecked = '';
            if($this->checkParams('brand', $filter->brand)) {
                $isBrandChecked = $this->checkParams('brand', $filter->brand);
            }
            $collection = collect($filter);
            $filter = $collection->merge(['isBrandChecked' => $isBrandChecked]);
            $asideBrandsFiltersChecked = $asideBrandsFiltersChecked->concat([$filter]);
        }
        $asideWithFilters['brands'] = $asideBrandsFiltersChecked;

        
        $categories = $target[$categoryId];
        $asideCategoriesFilterChecked = collect([]);

        foreach($categories as $filter) {
            $isPropChecked = '';
            $collection = collect($filter);
            if(isset($collection['url_semantic']) || $collection->has(['url_semantic'])) {
                if($collection->has(['url_semantic'])) {
                    $isPropChecked = $this->checkParams('category', $collection['url_semantic']);
                } elseif ($collection['url_semantic']) {
                    $isPropChecked = $this->checkParams('category', $collection->url_semantic);
                }
                //dump($collection['url_semantic']);
                //dump($isPropChecked);
                $collection = $collection->merge(['isPropChecked' => $isPropChecked]);
                //dump($collection);
                $asideCategoriesFilterChecked = $asideCategoriesFilterChecked->mergeRecursive([$collection]);   // здесь получается так, что результаты одинаковые, если обращаться к разным методам: concat/merge/mergeRecursive - без разницы, результат один и тот же
                //dump($asideCategoriesFilterChecked);
            } else {
                foreach($filter as $subCatFilter) {
                    $isPropChecked = '';
                    $collection = collect($subCatFilter);
                    if(isset($collection['url_semantic']) || $collection->has(['url_semantic'])) {
                        if($collection->has(['url_semantic'])) {
                            $isPropChecked = $this->checkParams('category', $collection['url_semantic']);
                        } elseif ($collection['url_semantic']) {
                            $isPropChecked = $this->checkParams('category', $collection->url_semantic);
                        }
                        $collection = $collection->merge(['isPropChecked' => $isPropChecked]);  
                        
                        # здесь получается так, что результаты одинаковые, если обращаться к разным методам: 
                        # concat/merge/mergeRecursive - без разницы, результат один и тот же
                        $asideCategoriesFilterChecked = $asideCategoriesFilterChecked->mergeRecursive([$collection]); 
                    }
                }
            }
        }
        //dump($asideCategoriesFilterChecked);
        $asideCategoriesFilterChecked = $asideCategoriesFilterChecked->toArray();
        $arr = [];
        $arrKeysToClearFromNaNValues = [];

        foreach($asideCategoriesFilterChecked as $category) {
            if(!$category['parent_id']) {
                $arr[0] = $category;
            } elseif($category['parent_id'] == $arr[0]['id']) {
                $arr[$category['id']] = $category;
                
            } else {
                if(!isset($arr[$arr[$category['parent_id']]['id']][0])) {
                    $arr[$arr[$category['parent_id']]['id']][0] = $arr[$arr[$category['parent_id']]['id']];
                    $arrKeysToClearFromNaNValues[] = $arr[$arr[$category['parent_id']]['id']]['id'];
                }
                $arr[$arr[$category['parent_id']]['id']][$category['id']] = $category;
            }
        }

        # уберём объекты с нечисловыми ключами:
        foreach($arrKeysToClearFromNaNValues as $key) {
            $arr[$key] = array_filter($arr[$key], function ($k) {
                return ($k == is_numeric($k) || $k == 0);
            },
            ARRAY_FILTER_USE_KEY
            );
        }

        //dump($arr);
        //dump($asideCategoriesFilterChecked);
        //dd($categories);
        
        $asideWithFilters['categories'] = $arr;
        //$asideWithFilters['categories'] = $categories;

        //dd($asideWithFilters);

        return view('components.aside-with-filters.goalie', [
            'asideWithFilters' => $asideWithFilters,
        ]);

    }

    private function getBrandedCategoriesMenuArr($brandId, $categoryId) {

        $res = [];
        $categoryIds = [];

        if($brandId == 0) {
            $whereFromProdList = '1';
        } else {
            $whereFromProdList = "products.brand_id = $brandId";
        } 

        # выбираем категории (подкатегории), где есть товары в наличии, для продажи или для заказа (не архивированные)
        $categories = DB::table('categories')
        ->join('products', 'categories.id', '=', 'products.category_id') 
        ->whereRaw($whereFromProdList) 
        ->where('products.product_status_id', '<>', '2')
        ->distinct()
        ->get('categories.*');
        
        # некоторые категории являются потомками от нескольких категорий (например, у нас "Баулы" относятся к категории "Сумки и чехлы", а так же являются подкатегорией "Вратарям") - проверяем есть ли такие категории и, для вывода во всплывающем меню хедера, разбиваем такие категории на отдельные элементы массива:
        foreach($categories as $key=>$category) {
            $parentsIdsStr = $category->parent_id; 
            if(!empty($parentsIdsStr)) {
                if(str_contains($parentsIdsStr, ',')) {
                    $parentCategoriesArr = explode(',', $parentsIdsStr);
                    $categories->forget($key)->all();
                    
                    foreach($parentCategoriesArr as $parentCategory) {
                        $copy_of_object = clone $category;
                        $copy_of_object->parent_id = $parentCategory;
                        $categories[] = $copy_of_object;
                    }
                }
            }
        }

        $prodModels = DB::table('products')
            ->select('products.category_id', 'products.brand_id', 'products.model', 'categories.url_semantic')
            ->leftJoin('categories', 'categories.id', '=', 'products.category_id') 
            ->whereRaw($whereFromProdList)
            ->where('products.product_status_id', '<>', '2')
            ->distinct()
        ->get();
        
        $groupedCategories = $categories->groupBy('parent_id');
        //dump($groupedCategories);
        foreach($groupedCategories as $key=>$group) {
            if($key) {
                //dump($key);
                //dump($group);
                foreach($group as $subMainElem) {
                    # обратиться к БД и узнать, есть ли у этой подкатегории родитель:
                    $hasParentCategory = DB::table('categories')->where('id', $subMainElem->parent_id)->value('parent_id');
                    if(!$hasParentCategory) {
                        if(!isset($row[$key][0])) { 
                            $catalogCategory = DB::table('categories')->where('id', $key)->get();
                            $row[$key][0] = $catalogCategory[0];
                        }
                        $row[$key][$subMainElem->id] = $subMainElem;
                        $res = $row;
                        $categoryIds[] = $subMainElem->id; // выбираем для бренд-фильтра
                    } else {
                        // dump($hasParentCategory);
                        if(!isset($row[$hasParentCategory][$key][0])) { 
                            $catalogCategory = DB::table('categories')->where('id', $key)->get();
                            $row[$hasParentCategory][$key][0] = $catalogCategory[0];
                        }
                        $row[$hasParentCategory][$key][$subMainElem->id] = $subMainElem;
                        $res = $row;
                        $categoryIds[] = $subMainElem->id; // выбираем для бренд-фильтра
                    }
                }
            }
        }
        //dd($categoryId);
        # оставляем только "вратарскую" категорию:        
        $res = array_filter($res, function ($k) use ($categoryId){
                    return $k == $categoryId;
                },
                ARRAY_FILTER_USE_KEY
            );

        # переберём массив и проверим на checked:
        $goalieCategories = $res[$categoryId];

        $res['catIds'] = array_unique($categoryIds);
        //dd($res);
        return $res;
    }

    private function getGoaliePossibleBrands($categoryIds = [], $prodStatus = 1) {

        if(empty($categoryIds)) {
            $whereFromProdCat = '1';
        } else {
            $str = implode(',', $categoryIds);
            $whereFromProdCat = "categories.id IN ($str)";
        } 

        if($prodStatus == 1) {
            $whereFromProdStatus = '1';
        } else {
            $whereFromProdStatus = "'1' OR products.product_status_id = $prodStatus";
        }
        
        $brands = DB::table('brands')
            ->join('products', 'brands.id', '=', 'products.brand_id') 
            ->join('categories', 'categories.id', '=', 'products.category_id') 
            ->whereRaw($whereFromProdCat) 
            ->whereRaw($whereFromProdStatus) 
            ->distinct()
            ->get('brands.*');
        //dd($brands);
        return $brands;
    }
}