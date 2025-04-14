<?php
    namespace App\Http\Controllers;
    use Illuminate\Http\Request;        // подключим класс Request
    use Illuminate\Support\Facades\DB;  // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды
    use App\Models\Product;             // подключаем класс модели, теперь мы можем использовать эту модель внутри методов контроллера...
    use App\Models\Category;
    use App\Models\Brand;
    use App\Models\ProductStatus;
    use App\Models\Person;
    use App\Models\Organization;
    use App\Models\Order;
    use App\Models\User;
    use App\Models\Favorite;
    use App\Models\Cart;
    
    use Illuminate\Support\Facades\Auth;
    use Inertia\Inertia;

    class InitialDataController extends Controller {
        public function index(Request $request) {
            try {
                # Метод url вернет URL без строки запроса, а метод fullUrl, включая строку запроса:
                $locationString = $request->url();
                $authBlockContentFinal = $userType = $user_id = '';
                $userStatus = 'Гость';
        
                $cart = $favorites = $orders = [];
                $cartTotal = $favoritesTotal = $ordersTotal = 0;

                $loginLink  = '/login'   ;
                $regLink    = '/register';
                $logoutLink = '/logout'  ;
                $userAuthedOrdersCount = 0;
            
                // если пользователь авторизован:
                $user = Auth::user();
                    
                if (!empty($user)) {
                    // dump($user->name);
                    $authBlockTextContent = $user->name . ',<br>мы рады общению. Вы можете:';
                    $userType = $user->client_type_id;
                    $user_id  = $user->id;
                    $userName = $user->name;

                    $favorites = Favorite::where('user_id', $user_id)->pluck('product_ids');
                    $cart = Cart::where('user_id', $user_id)->pluck('products');
        
                    // посмотрим его историю заказов (смотрим только количество заказов - это для обозначения в иконке "Заказы" в хедере):
                    $userAuthedOrdersCount = Order::where('order_client_type_id', $userType)->where('order_client_id', $user_id)->count();
                    // dump($userAuthedOrdersCount);
                    // определяем полномочия юзера:
                    $userAccessId = $user->user_access_id;
        
                    if(!preg_match('#/profile[/]?$#', $locationString)) {
                        $authBlockHref = '/profile';
                        $authBlockHrefText = 'войти в профиль';
                        $authBlockHref_2 = '/logout';
                        $authBlockHrefText_2 = 'выйти из системы';
                        $authBlockContentFinal = $authBlockTextContent . '<br>' . '<a href = "' . $authBlockHref . '">' . $authBlockHrefText . '</a>' . ' или ' .
                        '<a href = "' . $authBlockHref_2 . '">' . $authBlockHrefText_2 . '</a>';
                    } elseif(preg_match('#/profile[/]?$#', $locationString) && true) {
                        $authBlockHref = '/';
                        $authBlockHrefText = 'выйти из профиля';
                        $authBlockHref_2 = '/logout';
                        $authBlockHrefText_2 = 'выйти из системы';
                        $authBlockContentFinal = $authBlockTextContent . '<br>' . '<a href = "' . $authBlockHref . '">' . $authBlockHrefText . '</a>' . ' или ' .
                        '<a href = "' . $authBlockHref_2 . '">' . $authBlockHrefText_2 . '</a>';
                    }
                } else {
                    $authBlockTextContent = 'Дорогой гость, вы можете: ';
                    $authBlockHref = $loginLink;
                    $authBlockHrefText = 'авторизоваться';
                    $authBlockHref_2 = $regLink;
                    $authBlockHrefText_2 = 'зарегистрироваться';
                    $authBlockHrefText_3 = 'Не получили письмо с подтверждением?';
                    $authBlockContentFinal = $authBlockTextContent . '<br /><span>' . '<a href="' . $authBlockHref . '">' . $authBlockHrefText . '</a>' . ' или ' .
                    '<a href="' . $authBlockHref_2 . '">' . $authBlockHrefText_2 . '</a>.</span><p>' . $authBlockHrefText_3 . '<a href="/resend-verification-email">Запросите повторно</a></p>';
                }
                    
                $categoriesMenuArr = $this->getCategoriesMenu();
                // dd($categoriesMenuArr);

                // Прлучаем информацию о категориях. Планируем использовать для маппинга при выводе подменю категории в навбар-е хлебных крошек
                $categoriesInfo = Category::all(); 
                
                return response()->json([
                    'user' => $user,
                    'categoriesMenuArr' => $categoriesMenuArr,
                    'categoriesInfo' => $categoriesInfo,
                    'authBlockContentFinal' => $authBlockContentFinal,
                    'cart' => $cart,
                    'favorites' => $favorites,
                    'cartTotal' => $cartTotal,
                    'favoritesTotal' => $favoritesTotal,
                    'orders' => $orders,
                    'ordersTotal' => $ordersTotal,
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'error' => $e->getMessage(),
                ], 500);
            }
        }
        
            private function getBrandedCategoriesMenuArr($brandId = 0) {
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
                        if(isset($parentsIdsStr) && str_contains($parentsIdsStr, ',')) {
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
                    // dd($res);
                return $res;
            }

            private function getCategoriesMenu() {
                $categoriesMenuArr = [];
        
                # выбираем известные бренды:
                $brands = Brand::select('id', 'brand')->get();
        
                # и для каждого бренда запускаем выборку доступных категорий товаров для всплывающего меню:
                foreach($brands as $brand) {
                    $brandId = $brand->id;
                    $categoriesMenuArr[$brand->brand] = $this->getBrandedCategoriesMenuArr($brandId);
                }
        
                # и общий каталог товаров без учёта бренда:
                //$categoriesMenuArr['UnihocZoneRussia'] = $this->getBrandedCategories();
                $categoriesMenuArr['UnihocZoneRussia'] = $this->getBrandedCategoriesMenuArr();
                // dd($categoriesMenuArr);
                return $categoriesMenuArr;
            }
        
    }