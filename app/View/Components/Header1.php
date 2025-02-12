<?php
// дата актуальности: 17.12.2024, 11:30

namespace App\View\Components;
use Illuminate\Http\Request; // подключим класс Request
use Illuminate\Support\Facades\DB;  // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

use App\Models\Category; // для получения данных из БД сначала нужно "заюзать" модель категорий
use App\Models\Brand;
use App\Models\Property;
use App\Models\Product;
use App\Models\Person;
use App\Models\Organization;
use App\Models\Order;

use Illuminate\Support\Facades\Auth; // Получение аутентифицированного пользователя 16.12.2024 
# вам часто будет требоваться взаимодействовать с текущим аутентифицированным пользователем. 
# При обработке входящего запроса вы можете получить доступ к аутентифицированному пользователю с помощью метода user фасада Auth:

class Header extends Component
{
    public function __construct(Request $request)
    {
       # Чтобы получить полный URL для входящего запроса, можно использовать методы url или fullUrl. 
       # Метод url вернет URL без строки запроса, а метод fullUrl, включая строку запроса:
       $this->locationString = $request->url();
       //$request->session()->flush();
       dump($request->session()->all());

       $user = Auth::user();
       dump($user);

       if (Auth::check()) {
        dump($request->user());
       }

       dump(session('status'));
       dump(session('_previous.url'));
    }

    public function render(): View|Closure|string
    {
        $locationString = $this->locationString;
        $authBlockContentFinal = '';
        $userStatus = 'Гость';
        $userType = '';
        $user_id = '';

        $loginLink = $locationString . '?authAction=login';
        $regLink = $locationString . '?authAction=register';
        $logoutLink = $locationString . '?authAction=logout';
        $userAuthedOrdersCount = 0;
      
        // если пользователь авторизован:
        if (session()->has('auth')) {
        
            $authBlockTextContent = session('name', 'Уважаемый посетитель') . ', мы рады общению. Вы можете:';
            $userType = session('user_type');
            $user_id  = session('id');

            // посмотрим его историю заказов (смотрим только количество заказов - это для обозначения в иконке "Заказы" в хедере):
            $userAuthedOrdersCount = Order::where('order_client_type_id', $userType)->where('order_client_id', $user_id)->count();

            // определяем полномочия юзера:
            if($userType == '1') {
                $userAccessId = Person::where('id', $user_id)->first()->user_access_id;
            }

            if(!preg_match('#/lk[/]?$#', $locationString)) {
                $authBlockHref = '/lk';
                $authBlockHrefText = 'войти в профиль';
                $authBlockHref_2 = $locationString . '?authAction=logout';
                $authBlockHrefText_2 = 'выйти из системы';
                $authBlockContentFinal = $authBlockTextContent . '<br>' . '<a href = "' . $authBlockHref . '">' . $authBlockHrefText . '</a>' . ' или ' .
                '<a href = "' . $authBlockHref_2 . '">' . $authBlockHrefText_2 . '</a>';
            } elseif(preg_match('#/lk[/]?$#', $locationString) && true) {
                $authBlockHref = '/';
                $authBlockHrefText = 'выйти из профиля';
                $authBlockHref_2 = $locationString . '?authAction=logout';
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
            $authBlockContentFinal = $authBlockTextContent . '<br><span>' . '<a href = "' . $authBlockHref . '">' . $authBlockHrefText . '</a>' . ' или ' .
            '<a href = "' . $authBlockHref_2 . '">' . $authBlockHrefText_2 . '</a></span>';
        }

        $authAction = '';

        if (isset($_GET['authAction']) && $_GET['authAction'] == 'register') {
            $authAction = 'register';
        } elseif (isset($_GET['authAction']) && $_GET['authAction'] == 'login') {
            $authAction = 'login';
        } elseif (isset($_GET['authAction']) && $_GET['authAction'] == 'logout') {
           // Через глобальный помощник «session» ...
           session()->forget(['auth', 'user_type', 'id', 'user_status', 'name']);                              // пометка об авторизации
           session()->flash('flash', "Вы вышли из системы. Ждём вас снова!");  // с помощью метода flash сохраняем элемент в сессию только для следующего запроса. 
           return redirect('/');
        }       
        
        $categoriesMenuArr = $this->getCategoriesMenu();
        return view('components.header', [
            'categoriesMenuArr' => $categoriesMenuArr,
            'authBlockContentFinal' => $authBlockContentFinal,
            'authAction' => $authAction,
            'userAuthedOrdersCount' => $userAuthedOrdersCount,
            'userType' => $userType,
            'user_id' => $user_id,
            'locationString' => $locationString,
        ]);
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
            //dump($res);
        return $res;
    }

    private function getBrandedCategories($brandId = 0) {
        $brandedCategoriesArr = [];
        
        # если функция вызывается без параметра ($brandId) - это значит, что выбираем данные БЕЗ учёта бренда. Пробовал изменить запросы, манипулируя $whereListFromProp - не получилось...
        if($brandId == 0) {
            $whereFromProdList = $whereFromPropList = '1';
        } else {
            $whereFromProdList = "products.brand_id = $brandId";
            $whereFromPropList = "properties.brand_id = $brandId";
        }   
        
        # выбираем категории (подкатегории), где есть товары в наличии, для продажи или для заказа (не архивированные)
        $categories = Category::join('products', 'categories.id', '=', 'products.category_id')   
        ->whereRaw($whereFromProdList)
        ->where('products.product_status_id', '<>', '2')
        ->distinct()
        ->get('categories.*');
        //dump($categories);

        foreach($categories as $category) {
      
            if($category->parent_id == NULL) {
                
                $brandedCategoriesArr[$category->url_semantic] = $category;
                
                # а, если это клюшки, - то ещё и серии выбираем:
                if($category->id == '1') {
                    $sticksSeries = Property::select('properties.category_id', 'properties.brand_id', 'properties.prop_title', 
                            'properties.prop_value', 'properties.prop_value_view', 'properties.prop_url_semantic')
                            ->join('product_property', 'properties.id', '=', 'product_property.property_id')
                            ->join('products', 'products.id', '=', 'product_property.product_id')
                        ->whereRaw($whereFromPropList)
                        ->where('properties.category_id', '=', '1')
                        ->where('properties.prop_title', '=', 'series')
                        ->where('products.product_status_id', '<>', '2')
                        ->distinct()
                    ->get();
                    // dump($sticksSeries);
                    # здесь заполнить моделями клюшек! 
                    $sticksSeriesArr = [];
                    if(!empty($sticksSeries)) {
                        foreach($sticksSeries as $serie) {
                            $sticksSeriesArr[$serie->prop_value_view] = $serie;
                        }
                    
                    //dump($sticksSeriesArr);
                    //dump($brandedCategoriesArr[$category->url_semantic]->category_view);
                    
                    # stdClass - это объект, а объект передается по ссылке в функции/методы, в отличии от массива. По сути это тот же массив, только в виде класса.
                    # возвращается stdClass от Laravel, мы можем вытащить из него данные в массив через $arr = get_object_vars($std);:
                    # здесь можно данные выводить в массивах разного плана (тот, который нужен будет реально)... хоть вот в таком:

                    //$brandedCategoriesArr[$category->url_semantic] = get_object_vars($brandedCategoriesArr[$category->url_semantic]);
                    $brandedCategoriesArr[$category->url_semantic]['peculiarities'] = $sticksSeriesArr;
                    //$brandedCategoriesArr[$category->url_semantic]['main_parent'] = $category;

                    # надо будет потом подумать в каком виде передавать данные в представление...
                    }
                } else {
                    $productModels = Product::select('products.model')
                        ->whereRaw($whereFromProdList)
                        ->where('products.category_id', '=', $category->id)
                        ->where('products.product_status_id', '<>', '2')
                        ->distinct()
                    ->get();
                    // dump($productModels);
                    # здесь заполнить моделями клюшек! 
                    $productModelsArr = [];
                    if(!empty($productModels)) {
                        foreach($productModels as $model) {
                            //dump($model);
                            $productModelsArr[] = $model->model;
                        }
                    
                    //dump($productModelsArr);
                    //dump($brandedCategoriesArr[$category->url_semantic]->category_view);
                    
                    # stdClass - это объект, а объект передается по ссылке в функции/методы, в отличии от массива. По сути это тот же массив, только в виде класса.
                    # возвращается stdClass от Laravel, мы можем вытащить из него данные в массив через $arr = get_object_vars($std);:
                    # здесь можно данные выводить в массивах разного плана (тот, который нужен будет реально)... хоть вот в таком:

                    //$brandedCategoriesArr[$category->url_semantic] = get_object_vars($brandedCategoriesArr[$category->url_semantic]);
                    $brandedCategoriesArr[$category->url_semantic]['peculiarities'] = $productModelsArr;
                    //$brandedCategoriesArr[$category->url_semantic]['main_parent'] = $category;
                    }
                }

            } else {
                
                # сюда попадают категории, где есть родитель, у которого нет товаров и его нет в $categories ... надо найти этого родителя и записать эту категорию (подкатегорию) в массив родителя (вместе с ним в массив, который передаётся в представление):
                $parentCategoryIdStr = $category->parent_id;
                $parentCategoryIdArr = explode(',', $parentCategoryIdStr );

                $directParentCategories = Category::whereIn('id', $parentCategoryIdArr)->get();
                
                foreach($directParentCategories as $directParentCategory) {
                    //dump($directParentCategory->url_semantic);
                    if($directParentCategory->parent_id == NULL) {
                       # если родителя нет в основном меню, его нужно туда добавить:
                       if(!isset($brandedCategoriesArr[$directParentCategory->url_semantic]) OR empty($brandedCategoriesArr[$directParentCategory->url_semantic])) {
                        $brandedCategoriesArr[$directParentCategory->url_semantic] = $directParentCategory;
                        $brandedCategoriesArr[$directParentCategory->url_semantic]['peculiarities'] = [];
                       } 
                       # если напрямую делать, высвечивалась ошибка: Indirect modification of overloaded element of App\Models\Category has no effect - пришлось "мудрить" и выдумывать $targetArr
                       $currentCategoryArr[$category->url_semantic] = $category; 
                       $brandedCategoriesArr[$directParentCategory->url_semantic]['peculiarities'] = $currentCategoryArr;
                                               
                    } else { 
                        //dump($directParentCategory->url_semantic);    // - additional-protection
                        //dump($category->parent_id);                   // 16 = Дополнительная защита

                        # если категория-родитель сама является подкатегорией, нужно найти её родителя:               
                        $superParentCategoryIdStr = $directParentCategory->parent_id;
                        //dump($superParentCategoryIdStr);              // - 8
                        $superParentCategoryIdArr = explode(',', $superParentCategoryIdStr );
                        $superMainParentCategories = Category::whereIn('id', $superParentCategoryIdArr)->get();
                        //dump($superMainParentCategories);
                        foreach($superMainParentCategories as $superMainParentCategory) {
                            
                            //dump($superMainParentCategory->url_semantic);
                            if($superMainParentCategory->parent_id == NULL) {  
                               //dump($category->url_semantic);
                                # если super-родителя нет в основном меню, его нужно туда добавить:
                                if(!isset($brandedCategoriesArr[$superMainParentCategory->url_semantic]) OR empty($brandedCategoriesArr[$superMainParentCategory->url_semantic])) {
                                    $superMainParent = $brandedCategoriesArr[$superMainParentCategory->url_semantic] = $superMainParentCategory;
                                    $superMainParentPecsArr = $brandedCategoriesArr[$superMainParentCategory->url_semantic]['peculiarities'] = [];
                                    // dump('0');
                                } else {
                                    //dump('1');
                                    $superMainParent        = $brandedCategoriesArr[$superMainParentCategory->url_semantic];                    // goalie
                                    $superMainParentPecsArr = $brandedCategoriesArr[$superMainParentCategory->url_semantic]['peculiarities'];   // pants, shlemy...
                                }                   

                                # если direct-родителя нет в основном меню, его нужно туда добавить:
                                if(!isset($brandedCategoriesArr[$superMainParentCategory->url_semantic]['peculiarities'][$directParentCategory->url_semantic]) OR empty($brandedCategoriesArr[$superMainParentCategory->url_semantic]['peculiarities'][$directParentCategory->url_semantic])) {
                                    //dump($directParentCategory->url_semantic);  // additional-protection
                                    $currentCategoryArr[$directParentCategory->url_semantic] = $directParentCategory;                 // - нужна, чтобы получать наименование категории и выводить в тегах
                                    //$currentCategoryArr[$directParentCategory->url_semantic]['peculiarities1'] = $category;         // - работает
                                    //$currentCategoryArr[$directParentCategory->url_semantic]['peculiarities1'][$category->url_semantic] = $category;         // - НЕ работает, а вот именно это надо!
                                    $currentCategoryArr[$directParentCategory->url_semantic][$category->url_semantic] = $category;  // тоже работает - пока её берём!

                                    $brandedCategoriesArr[$superMainParentCategory->url_semantic]['peculiarities'] = $currentCategoryArr;
                                    //dump($brandedCategoriesArr[$superMainParentCategory->url_semantic]['peculiarities'][$directParentCategory->url_semantic]);
                                    
                                }  else {
                                    $currentCategoryArr[$directParentCategory->url_semantic][$category->url_semantic] = $category;  // тоже работает - пока её берём!
                                    $brandedCategoriesArr[$superMainParentCategory->url_semantic]['peculiarities'] = $currentCategoryArr;
                                }
                                
                            }
                            
                        }

                    }
                }
            }
        }
        return $brandedCategoriesArr;
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

        return $categoriesMenuArr;
    }
}
