<?php
// app/Http/Controllers/GoalieAsideFiltersController.php

    namespace App\Http\Controllers;
    
    use App\Traits\FilterTrait;
    use App\Traits\CategoryTrait;
    
    class GoalieAsideFiltersController extends Controller {
    
        use FilterTrait;
        use CategoryTrait;

        public function index() {

            // $categoryId = $this->getCategoryIdViaUrl();    // 8
            // для отладки контроллера, пока захардкодим ай-ди:
            $categoryId = 8;

            $target     = $this->getBrandedCategoriesMenuStrForParentCategory($branId = 0, $categoryId);
            // dd($target);


            $brands = $this->getCategoryPossibleBrands($target['catIds']);
            
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

            //dd($target);
            $categories = $target[$categoryId];
            $asideCategoriesFilterChecked = collect([]);
            if(!empty($categories)) {
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
            }
            // dd($asideCategoriesFilterChecked);
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
            
            // dd($asideWithFilters);

            try {
                return response()->json([
                    'asideWithFilters' => [
                        'brands' => $asideWithFilters['brands'],
                        'categories' => array_values($asideWithFilters['categories']), // Преобразуем в индексированный массив
                    ],
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'error' => $e->getMessage(),
                ], 500);
            }
        }
    }

   