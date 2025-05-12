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
    use App\Http\Resources\ProductCollection;
    
    use Illuminate\Support\Facades\Auth;
    use Inertia\Inertia;

    class InitialDataController extends Controller {
        public function index(Request $request) {

            \Log::debug('InitialDataController Session Check', [
                'request' => $request->all(),
                'user' => Auth::user(),
            ]);
            
            try {
                $user = $request->user();   // если пользователь авторизован: $user = Auth::user();
                # Метод url вернет URL без строки запроса, а метод fullUrl, включая строку запроса:
                $userData = $this->getUserAuthData($user, $request->url());
                
                return response()->json([
                    'user' => $user ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'client_type_id' => $user->client_type_id,
                        'client_rank_id' => $user->client_rank_id,
                    ] : null,
                    
                    'categoriesMenuArr' => $this->getCategoriesMenu(),
                    'categoriesInfo' => Category::all(),
                    
                    'authBlockContentFinal' => $userData['auth_content'],
                    'cart' => $userData['cart'],
                    'favorites' => $user?->favorites?->product_ids 
                        ? json_decode($user->favorites->product_ids, true) 
                        : [],
                    'orders' => [] // Заполняется отдельным запросом
                ]);
                    
            } catch (\Exception $e) {
                return response()->json([
                    'error' => 'Ошибка загрузки данных в InitialDataController',
                    'details' => config('app.debug') ? $e->getMessage() : null
                ], 500);
            }
        }

        // Выносим работу с пользователем в отдельный метод
        private function getUserAuthData(?User $user, string $currentUrl): array {
            if (!$user) {
                return [
                    'auth_content' => 'Дорогой гость, вы можете: <br><span>'
                        . '<a href="/login">авторизоваться</a> или '
                        . '<a href="/register">зарегистрироваться</a>.</span>'
                        . '<p>Не получили письмо с подтверждением? '
                        . '<a href="/resend-verification-email">Запросите повторно</a></p>',
                    'cart' => [],
                ];
            }

            $isProfilePage = preg_match('#/profile[/]?$#', $currentUrl);
            
            return [
                'auth_content' => $user->name . ',<br>мы рады общению. Вы можете: '
                    . '<br><a href="' . ($isProfilePage ? '/' : '/profile') . '">'
                    . ($isProfilePage ? 'выйти из профиля' : 'войти в профиль') 
                    . '</a> или <a href="/logout">выйти из системы</a>',
                'cart' => Cart::where('user_id', $user->id)->pluck('products'),
            ];
        }

        // эта функция выбирает товары, а нужно передать на фронт сторку id-шников
        private function getFavoritesProducts(Request $request) {
            \Log::debug('InitialDataController getFavoritesProducts', [
                'session_id' => session()->getId(),
                'cookies_received' => $request->cookies->all(),
                'user_id' => auth()->id()
            ]);
            $favoritesIds = json_decode(Auth::user()?->favorites->product_ids) ?? [];
            
            \Log::debug('InitialDataController $favoritesIds', [
                '$favoritesIds' => $favoritesIds,
            ]);

            if (empty($favoritesIds)) {
                return [];
            } 

            $products = Product::with(['actualPrice', 'regularPrice', 'productReport', 'productShowCaseImage'])
            ->where('product_status_id', '=', 1)
            ->whereIn('id', $favoritesIds)
            ->get();   
                /*\Log::debug('InitialDataController getFavoritesProducts', [
                    '$favoritesIds' => $favoritesIds,
                    '$favoritescookie' => $request->cookie('favorites', '[]'),
                    'cookies' => $request->cookie,
                    '$products' => $products,
                ]);*/
            return new ProductCollection($products);
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