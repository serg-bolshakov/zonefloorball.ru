<?php
    namespace App\Http\Controllers;
    use Illuminate\Support\Facades\DB;  // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды
    use App\Models\Product;             // подключаем класс модели, теперь мы можем использовать эту модель внутри методов контроллера...
    use App\Models\Category;
    use App\Models\ProductStatus;
    

    class IndexController extends Controller {
        public function index() {
/*                      
            $res = [];

            $brandId = 0;
            if($brandId == 0) {
                $whereFromProdList = $whereFromPropList = '1';
            } else {
                $whereFromProdList = "products.brand_id = $brandId";
                $whereFromPropList = "properties.brand_id = $brandId";
            } 

            # выбираем категории (подкатегории), где есть товары в наличии, для продажи или для заказа (не архивированные)
            $categories = DB::table('categories')
            ->join('products', 'categories.id', '=', 'products.category_id') 
            ->leftJoin('product_statuses', 'products.id', '=', 'product_statuses.product_id')  
            ->whereRaw($whereFromProdList) 
            ->where('product_statuses.archieved', '<>', '1')
            ->distinct()
            ->get('categories.*');
            //dump($categories);

            $stickSeries = DB::table('properties')
                    ->select('properties.id', 'properties.category_id', 'properties.brand_id', 'properties.prop_title', 
                    'properties.prop_value', 'properties.prop_value_view', 'properties.prop_url_semantic')
                    ->join('product_property', 'properties.id', '=', 'product_property.property_id')
                    ->join('products', 'products.id', '=', 'product_property.product_id')
                    ->leftJoin('product_statuses', 'products.id', '=', 'product_statuses.product_id') 
                ->whereRaw($whereFromPropList)
                ->where('properties.category_id', '=', '1')
                ->where('properties.prop_title', '=', 'series')
                ->where('product_statuses.archieved', '<>', '1')
                ->distinct()
            ->get();

            $prodModels = DB::table('products')
                ->select('category_id', 'brand_id', 'model')
                ->leftJoin('product_statuses', 'products.id', '=', 'product_statuses.product_id') 
                ->whereRaw($whereFromProdList)
                ->where('product_statuses.archieved', '<>', '1')
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
                                    $rowModel[] = $model->model; 
                                }   
                            }

                            if(isset($rowModel)) {
                                $row[$mainElem->id] = $rowModel;
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
                            //dump($key);
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
          
*/
            return view('index.index', [
                'title' => 'UnihocZoneRussia Флорбольная экипировка.Всё для флорбола. Купить',
                'robots' => 'INDEX,FOLLOW',
                'description' => 'Найти, выбрать и купить товары для флорбола для детей и взрослых. Всё для флорбола от ведущего мирового производителя.',
                'keywords' => 'Клюшки для флорбола, обувь, очки, сумки и чехлы для взрослых и детей. Флорбольные ворота и мячи.',
            ]);
        }
    }