<?php

namespace App\Traits;

use Illuminate\Support\Facades\DB;  // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды
use App\Models\Product;
use App\Models\Property;

trait FilterTrait {
    
    public function getAsideWithFilters($categoryId, $prodStatus = 1) {
        $filters = [];
        
        # если для категории есть только один критерий фильтрации (например, "мячи/обмотки" - только по бренду), то не прибегаем к выборке фильтов данной категории через if
        $filters['brands'] = $this->getAllPossibleBrands($categoryId, $prodStatus);

        /*  на входе мы получили все доступные фильтры по бренду товаров, чтобы добавить атрибут "checked", нам нужно перебрать каждый бренд и проверить был ли он выбран.
            пробовал прямо в цикле добавлять isBrandChecked - не получилось (методы merge & concat - объявлены неизвестными)
            получилось только, если сначала заново создать новую коллекцию (пустую) и уже в неё добавлять изменённые объекты в цикле. На выходе "потеряли" ключ, а он будет нужен при более сложной группировке...
        */
        
        if($filters['brands']) {
            $asideBrandsFiltersChecked = collect([]);
            foreach($filters['brands'] as $filter) {
                $isBrandChecked = '';
                if($this->checkParams('brand', $filter->brand)) {
                    $isBrandChecked = $this->checkParams('brand', $filter->brand);
                }
                $collection = collect($filter);
                $filter = $collection->merge(['isBrandChecked' => $isBrandChecked]);
                $asideBrandsFiltersChecked = $asideBrandsFiltersChecked->concat([$filter]);
            }
            $filters['brands'] = $asideBrandsFiltersChecked;
        }   

        if($categoryId == '1') {
            
            $filterShaftFlexes = $this->getFilterShaftFlexes($prodStatus);
            $filters['filterShaftFlexes'] = $this->getAsideFiltersChecked($filterShaftFlexes, 'shaft_flex', 'prop_value');

            $filterStickSizes = $this->getFilterStickSizes($prodStatus);
            $filters['filterStickSizes'] = $this->getAsideFiltersChecked($filterStickSizes, 'size', 'size_value');
            
            $filterHooksSticks = $this->getAllPossibleHooks($categoryId, $prodStatus); 
            $filters['filterHooks'] = $this->getAsideFiltersChecked($filterHooksSticks, 'hook', 'prop_value');

        } elseif($categoryId == '2') {
            
            $filterHooksBlades= $this->getAllPossibleHooks($categoryId, $prodStatus);
            $filters['filtersHookBlade'] = $this->getAsideFiltersChecked($filterHooksBlades, 'hook_blade', 'prop_value');
            
            $filterHooksStiffness = $this->getFiltersBladeStiffness($categoryId, $prodStatus);
            $filters['filtersBladeStiffness'] = $this->getAsideFiltersChecked($filterHooksStiffness, 'blade_stiffness', 'prop_value');

        } elseif($categoryId == '7') {
            
            $filterEyewearsSizes = $this->getFilterSizes($categoryId, $prodStatus);
            $filters['filterEyewearsSizes'] = $this->getAsideFiltersChecked($filterEyewearsSizes, 'size', 'size_value');
        } 
        //dd($filters);
        return $filters ;
    }

    // выбираем доступные размеры для указанной категории товаров
    public function getFilterSizes($categoryId, $prodStatus = 1) {

        if($prodStatus == 2) {
            $whereFromProdStatus = '1';
        } else {
            $whereFromProdStatus = "products.product_status_id = $prodStatus";
        }

        $filtersCategorySizes = DB::table('products')->whereRaw($whereFromProdStatus)
            ->select('size_title', 'size_value', 'size_recommendation')
            ->join('sizes', 'products.size_id', '=', 'sizes.id') 
            ->where('sizes.category_id', '=', $categoryId) 
            ->distinct()
            ->get();
        return $filtersCategorySizes;
    }

    public function getFiltersBladeStiffness($categoryId = 2, $prodStatus = 1){

        if($prodStatus == 2) {
            $whereFromProdStatus = '1';
        } else {
            $whereFromProdStatus = "products.product_status_id = $prodStatus";
        }

        $filtersBladeStiffness = DB::table('products')->whereRaw($whereFromProdStatus)
            ->select('properties.prop_title', 'properties.prop_value', 'properties.prop_value_view')
            ->leftJoin('product_property', 'product_property.product_id', '=', 'products.id') 
            ->leftJoin('properties', 'properties.id', '=', 'product_property.property_id') 
            ->where('properties.prop_title', 'LIKE', 'blade_stiffness') 
            ->distinct()
            ->get();
        return $filtersBladeStiffness;
    }

    public function getAllPossibleBrands($categoryId = 0, $prodStatus = 1) {

        if($categoryId == 0) {
            $whereFromProdCat = '1';
        } else {
            $whereFromProdCat = "categories.id = $categoryId";
        } 

        if($prodStatus == 2) {
            $whereFromProdStatus = '1';
        } else {
            $whereFromProdStatus = "products.product_status_id = $prodStatus";
        }
        
        $brands = DB::table('brands')
            ->join('products', 'brands.id', '=', 'products.brand_id') 
            ->join('categories', 'categories.id', '=', 'products.category_id') 
            ->whereRaw($whereFromProdCat) 
            ->whereRaw($whereFromProdStatus) 
            ->distinct()
            ->get('brands.*');

        return $brands;
    }

    // жёсткость рукояток клюшек
    public function getFilterShaftFlexes($prodStatus = 1) {

        if($prodStatus == 2) {
            $whereFromProdStatus = '1';
        } else {
            $whereFromProdStatus = "products.product_status_id = $prodStatus";
        }

        $filterShaftFlexes = DB::table('products')->whereRaw($whereFromProdStatus)
            ->select('properties.prop_title', 'properties.prop_value', 'properties.prop_value_view')
            ->leftJoin('product_property', 'product_property.product_id', '=', 'products.id') 
            ->leftJoin('properties', 'properties.id', '=', 'product_property.property_id') 
            ->where('properties.prop_title', 'LIKE', 'shaft_flex') 
            ->distinct()
            ->get();
        return $filterShaftFlexes;
    }

    public function getAllPossibleHooks($categoryId = '1', $prodStatus = 1) {
        $hook = '';
        if($categoryId == '1') {
            $hook = 'hook';
        } elseif($categoryId == '2') {
            $hook = 'hook_blade';
        }

        if($prodStatus == 2) {
            $whereFromProdStatus = '1';
        } else {
            $whereFromProdStatus = "products.product_status_id = $prodStatus";
        }
        
        $filterHooks = DB::table('products')->whereRaw($whereFromProdStatus)
            ->select('properties.prop_title', 'properties.prop_value', 'properties.prop_value_view')
            ->leftJoin('product_property', 'product_property.product_id', '=', 'products.id') 
            ->leftJoin('properties', 'properties.id', '=', 'product_property.property_id') 
            ->where('properties.prop_title', 'LIKE', "$hook") 
            ->distinct()
            ->get();
        return $filterHooks;
    }

    // размер клюшек по длине рукоятки
    public function getFilterStickSizes($prodStatus = 1) {
        // Если впоследствии, мы реализуем возможность пользователю выбрать опцию типа: "Включить архивные модели", то передавая значение 2 (id - товара в архиве), мы убираем требование отслеживать статус товара... но не знаю...
        if($prodStatus == 2) {
            $whereFromProdStatus = '1';
        } else {
            $whereFromProdStatus = "products.product_status_id = $prodStatus";
        }

        $filterStickSizes = DB::table('products')->whereRaw($whereFromProdStatus) 
            ->select('size_title', 'size_value', 'size_recommendation')
            ->join('sizes', 'products.size_id', '=', 'sizes.id') 
            ->where('sizes.category_id', '=', '1')
            ->distinct()
            ->get();
        return $filterStickSizes;
    }

    public function checkParams($params, $value){
        if (isset($_GET[$params])) {
            return in_array($value, $_GET[$params]) ? "checked" : "";
        }
        return "";
    }

    public function getAsideFiltersChecked($filtersArr, $propName, $propValue) {
        $asideFiltersChecked = collect([]);
        //dd($filtersArr);
        foreach($filtersArr as $filter) {
            $filterCollection = collect($filter);
            $isPropChecked = $this->checkParams($propName, $filter->$propValue);
            $filter = $filterCollection->merge(['isPropChecked' => $isPropChecked]);
            $asideFiltersChecked = $asideFiltersChecked->concat([$filter]);
        }
        return $asideFiltersChecked;
    }

    public function getSlug() {       
        $routeUri = $_SERVER['REQUEST_URI'];
        $routeUri = explode('?', $routeUri);
        $routeUri = $routeUri[0];

        return basename($routeUri);
    }

    public function getCategoryPossibleBrands($categoryIds = [], $prodStatus = 1) {

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

    # имеет смысл делать фильт по брендам, если брендов больше одного
    public function getCheckedFilterBrandsIfExists($brands) {
        if($brands->count() > 1) {
            $asideBrandsFiltersChecked = collect([]);
            foreach($brands as $filter) {
                $isBrandChecked = '';
                if($this->checkParams('brand', $filter->brand)) {
                    $isBrandChecked = $this->checkParams('brand', $filter->brand);
                }
                $collection = collect($filter);
                $filter = $collection->merge(['isBrandChecked' => $isBrandChecked]);
                $asideBrandsFiltersChecked = $asideBrandsFiltersChecked->concat([$filter]);
            }
          return $asideBrandsFiltersChecked;
        } else {
            return NULL;
        }
    }

    public function getCheckedFilterCategoriesIfExists($categories) {
        if(count($categories) > 2) {
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
                    $collection = $collection->merge(['isPropChecked' => $isPropChecked]);
                    $asideCategoriesFilterChecked = $asideCategoriesFilterChecked->mergeRecursive([$collection]);   // здесь получается так, что результаты одинаковые, если обращаться к разным методам: concat/merge/mergeRecursive - без разницы, результат один и тот же
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
            
            return $arr;
        } else {
            return NULL;
        }
    }    
}   