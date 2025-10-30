<?php

namespace App\Traits;

use Illuminate\Support\Facades\DB;  // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды

trait CategoryTrait {
    
    #  "grips"
    public function getCategoryUrlSemantic() {
        $routeUri = $_SERVER['REQUEST_URI'] ?? request()->getRequestUri() ?? '';
        $routeUri = explode('?', $routeUri);
        $routeUri = $routeUri[0];
        // dd(basename($routeUri));
        return basename($routeUri);
    }

    #  "/products/catalog/grips"
    public function getRouteUri() {
        $routeUri = $_SERVER['REQUEST_URI'] ?? request()->getRequestUri() ?? '';
        $routeUri = explode('?', $routeUri);
        $routeUri = $routeUri[0];

        return $routeUri;
    }

    #  "?brand%5B%5D=unihoc"
    public function getRequestStr() {
        $requestStr = $_SERVER['REQUEST_URI'] ?? request()->getRequestUri() ?? '';
        $requestStr = explode('?', $requestStr);
        $requestStr = $requestStr[1];

        return $requestStr;
    }

    public function getCategoryIdViaUrl() {
        
        $categoryUrlSemantic = $this->getCategoryUrlSemantic();
        // dd($categoryUrlSemantic);
        
        $categoryId = DB::table('categories')
            ->select('id')
            ->where('url_semantic', '=', $categoryUrlSemantic)
            ->first();
        if($categoryId) {
            return $categoryId->id;
        } else {
            return NULL;
        }
    }

    public function getCategoryIdViaSlug($categoryUrlSemantic) {
              
        $categoryId = DB::table('categories')
            ->select('id')
            ->where('url_semantic', '=', $categoryUrlSemantic)
            ->first();
        if($categoryId) {
            return $categoryId->id;
        } else {
            return NULL;
        }
    }

    public function getMenuCategories($brandId = 0) {
        
        $res = [];

            if($brandId == 0) {
                $whereFromProdList = $whereFromPropList = '1';
            } else {
                $whereFromProdList = "products.brand_id = $brandId";
                $whereFromPropList = "properties.brand_id = $brandId";
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
                
                // if(str_contains($parentsIdsStr, ',')) {     // Passing null to parameter #1 ($haystack) of type string is deprecated in C:\OSPanel\domains\laravel.local\laravel.local\app\Traits\CategoryTrait.php on line 85
                if(!empty($parentsIdsStr) && str_contains($parentsIdsStr, ',')) {    
                    $parentCategoriesArr = explode(',', $parentsIdsStr);
                    $categories->forget($key)->all();
                    
                    foreach($parentCategoriesArr as $parentCategory) {
                        $copy_of_object = clone $category;
                        $copy_of_object->parent_id = $parentCategory;
                        $categories[] = $copy_of_object;
                    }
                }
            }

            $stickSeries = DB::table('properties')
                    ->select('properties.id', 'properties.category_id', 'properties.brand_id', 'properties.prop_title', 
                    'properties.prop_value', 'properties.prop_value_view', 'properties.prop_url_semantic')
                    ->join('product_property', 'properties.id', '=', 'product_property.property_id')
                    ->join('products', 'products.id', '=', 'product_property.product_id')
                ->whereRaw($whereFromPropList)
                ->where('properties.category_id', '=', '1')
                ->where('properties.prop_title', '=', 'serie')
                ->where('products.product_status_id', '<>', '2')
                ->distinct()
            ->get();

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
                if(!$key) {
                    foreach($group as $mainElem) {
                        if($mainElem->id == 1) {  
                            foreach($stickSeries as $serie) {
                                $rowSerie[$serie->id] = $serie;    
                            }

                            $row[$mainElem->id] = $rowSerie;
                            $row[$mainElem->id][0] = $mainElem;
                            $res = $row;
                            //dump($res);
                        } else {
                            $currentCategoryId = $mainElem->id;
                            $rowModel = [];
                            foreach($prodModels as $model) {
                                if($model->category_id == $currentCategoryId) {
                                    $rowModel[] = $model; 
                                }   
                            }

                            if(isset($rowModel)) {                            
                                # у нас элемент с ключом [0] зарезервирован для описания категории товаров... но при переборе моделей товаров создаётся тоже элемент с ключом [0], который потом "затирается" категорией и мы его теряем - делаем так, чтобы нумерация ключей массива начиналась с единицы: 
                                $rowModelArrLength = count($rowModel);                      // считаем сколько элементов в массиве моделей
                                $rowModelArrKeys = [];                  
                                for($i=1; $i<=$rowModelArrLength; $i++) {
                                    $rowModelArrKeys[] = $i;                                // заполняем массив ключей, начиная с 1
                                }
                                $rowModelArr = array_combine($rowModelArrKeys, $rowModel);  // создаём новый массив моделй с ключами от единицы - далее используем именно этот массив:
                                
                                $row[$mainElem->id] = $rowModelArr;
                                $row[$mainElem->id][0] = $mainElem;
                                $res = $row;
                            } else {
                                $row[$mainElem->id] = $mainElem;
                                $row[$mainElem->id][0] = $mainElem;
                                $res = $row;
                            }
                        }
                    }
                } else {
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
                        } else {
                            // dump($hasParentCategory);
                            if(!isset($row[$hasParentCategory][$key][0])) { 
                                $catalogCategory = DB::table('categories')->where('id', $key)->get();
                                $row[$hasParentCategory][$key][0] = $catalogCategory[0];
                            }
                            $row[$hasParentCategory][$key][$subMainElem->id] = $subMainElem;
                            $res = $row;
                        }
                    }
                }
            }
            //dump($res);
        return $res;
    }    
    
    //public function getBrandedCategoriesMenuArrCopyFromGoalie($brandId, $categoryId) {
    // почти копия getBrandedCategoriesMenuArrMainCategory($brandId, $categoryId), в отличие от неё getBrandedCategoriesMenuStrForParentCategory возвращает строку: "catIds" => "9,10,11,12,17,13,14,15" в виде строки
        /*  array:2 [▼ // app\Http\Controllers\GoalieAsideFiltersController.php:31
                8 => array:7 [▼
                    0 => {#722 ▶}
                    9 => {#627 ▶}
                    10 => {#626 ▶}
                    11 => {#624 ▶}
                    12 => {#623 ▶}
                    17 => {#655 ▶}
                    16 => array:4 [▼
                    0 => {#720 ▶}
                    13 => {#625 ▶}
                    14 => {#622 ▶}
                    15 => {#621 ▶}
                    ]
                ]
                "catIds" => "9,10,11,12,17,13,14,15"
                ]
        */
    // getBrandedCategoriesMenuArrMainCategory:
        /* array:2 [▼ // app\Http\Controllers\GoalieAsideFiltersController.php:32
            8 => array:6 [▼
                0 => {#715 ▶}
                9 => {#627 ▶}
                10 => {#626 ▶}
                11 => {#624 ▶}
                12 => {#623 ▶}
                17 => {#632 ▶}
            ]
            "catIds" => array:5 [▼
                0 => 9
                1 => 10
                2 => 11
                3 => 12
                4 => 17
            ]
            ]
        */

    public function getBrandedCategoriesMenuStrForParentCategory($brandId, $categoryId) {
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

    public function getBrandedCategoriesMenuArrMainCategory($brandId, $categoryId) {

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
            if(!empty($parentsIdsStr) && str_contains($parentsIdsStr, ',')) {
                $parentCategoriesArr = explode(',', $parentsIdsStr);
                $categories->forget($key)->all();
                
                foreach($parentCategoriesArr as $parentCategory) {
                    $copy_of_object = clone $category;
                    $copy_of_object->parent_id = $parentCategory;
                    $categories[] = $copy_of_object;
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
        
        # оставляем только "нужную" категорию:        
        /* $groupedCategories = array_filter($groupedCategories, function ($k) use ($categoryId){
                 return $k == $categoryId;
             },
             ARRAY_FILTER_USE_KEY
         );
        */
        
        $groupedCategories = $groupedCategories->filter(function ($value, $key) use ($categoryId){
            return $key == $categoryId;
        });
        
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
        
        $res['catIds'] = array_unique($categoryIds);
        //dd($res);
        return $res;
    }

    public function getCategoryMenuArr($categoryId) {
        
        $res = [];
        $categoryIds = [];

        # выбираем категории (подкатегории), где есть товары в наличии, для продажи или для заказа (не архивированные)
        $categories = DB::table('categories')
        ->join('products', 'categories.id', '=', 'products.category_id') 
        ->where('products.product_status_id', '<>', '2')
        ->distinct()
        ->get('categories.*');
        
        # некоторые категории являются потомками от нескольких категорий (например, у нас "Баулы" относятся к категории "Сумки и чехлы", а так же являются подкатегорией "Вратарям") 
        # - проверяем есть ли такие категории и, для вывода во всплывающем меню хедера, разбиваем такие категории на отдельные элементы массива:
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
        
        $groupedCategories = $categories->groupBy('parent_id');

        # смотрим, если у основной категории есть потомки, - выводим основную категорию вместе с потомками
        # если у основной категории нет потомков, - выводим её ... здесь переделываем исходник из Goalie.php:

        if($groupedCategories->has($categoryId)) {
            // dd($groupedCategories);            
            foreach($groupedCategories as $key=>$group) {
                if($key) {
                    //dump($categoryId);
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
            // dd($categoryId);
            # оставляем только "нужную" категорию:        
            $res = array_filter($res, function ($k) use ($categoryId){
                        return $k == $categoryId;
                    },
                    ARRAY_FILTER_USE_KEY
                );
            // dd($res);
        } else {
            foreach($categories as $key => $category) {
                if($category->id == $categoryId) {
                    $res[$category->id] = $category;
                    $categoryIds[] = $category->id;
                    break;
                }
            } 
        }

        // $res['catIds'] = array_unique($categoryIds);
        // $res['catIds'] = implode(',', $res['catIds']);
        // dd($res);
        return $res;
    }

    public function getCategoryProducts($categoryId) {
        // уже подразумеваем, что сюда пришёл запрос на получение товаров из основной категории товаров, у которой parent_id = NULL
        $res = [$categoryId];
        
        # выбираем нужную категорию (и её подкатегории)
        $categories = DB::table('categories')
        ->distinct()
        ->get('categories.*');

        # некоторые категории являются потомками от нескольких категорий (например, у нас "Баулы" относятся к категории "Сумки и чехлы", а так же являются подкатегорией "Вратарям") 
        # - проверяем есть ли такие категории и, разбиваем такие категории на отдельные элементы массива:
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
        
        $groupedCategories = $categories->groupBy('parent_id');
        
        # смотрим, если у основной категории есть потомки, - выводим основную категорию вместе с потомками
        # если у основной категории нет потомков, - выводим её ...
        if($groupedCategories->has($categoryId)) {
            foreach($groupedCategories as $key=>$group) {
                if($key == $categoryId) {
                    foreach($group as $subMainElem) {
                        $res[] = $subMainElem->id;
                        # обратиться к БД и узнать, есть ли у этой подкатегории дети:
                        $hasChildrenCategory = DB::table('categories')->where('parent_id', $subMainElem->id)->value('id');
                        if($hasChildrenCategory) {
                            $subMainElemChildren = DB::table('categories')->where('parent_id', $subMainElem->id)->pluck('id');
                            if(!empty($subMainElemChildren)) {
                                foreach($subMainElemChildren as $child) {
                                    $res[] = $child;
                                }
                            }
                        }
                    }
                }
            }
        }
        //dd($res);
        return $res;
    }
}