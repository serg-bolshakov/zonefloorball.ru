<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request; 
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\ProductResource; // Вместо того чтобы вручную собирать данные в массив $productsArr, пробуем использовать ресурсы (Resources) в Laravel. Ресурсы позволяют преобразовывать модели и коллекции в JSON-структуру, что упрощает работу с данными.
                                        // В нашем случае нам нужно вернуть список товаров, пробуем использовать ресурс коллекции: php artisan make:resource ProductCollection
use App\Http\Resources\ProductCollection;
use Inertia\Inertia;

use App\Models\Product;

class FavoritesController extends Controller
{

    public function index() {
        try {
            return Inertia::render('FavoritesPage', [
                    'title' => 'Избранное',
                    'robots' => 'NOINDEX,NOFOLLOW',
                    'description' => '',
                    'keywords' => '',
                ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }
/*
    public function getProducts(Request $request) {
        dd($request);
        
        $prodsInFavoriteIdsArr = [];
        $prodsInFavoriteIdsStr = $this->request->favoriteslistfromlocalstorage;
        $productsArr = [];
        $user = NULL;
        $rankDiscount = $rankDiscountPercent = NULL;

        // если пользователь авторизован, нужно получить его данные для возможного оформления заказов:
        if(Auth::check()) {
            // Получаем пользователя с загруженным отношением rank
            $user = Auth::user()->load('rank');
        }
        
        if(!empty($prodsInFavoriteIdsStr)) {
            $prodsInFavoriteIdsArr = explode(',', $prodsInFavoriteIdsStr);
        }
        //dd($prodsInFavoriteIdsStr);
        
        if(!empty($prodsInFavoriteIdsArr)) {
        
            $products = Product::with(['actualPrice', 'regularPrice', 'productReport', 'productShowCaseImage'])
                ->where('product_status_id', '=', 1)
                ->when($prodsInFavoriteIdsArr, function ($query, $prodsInFavoriteIdsArr) {
                    $query->whereIn('id', $prodsInFavoriteIdsArr);
                })
            ->get();
        
            $i = 0;
        
            // если пользователь авторизован, мы должны проверить какие скидки ему доступны (по умолчанию, согласно рангу):
            if(isset($user->rank->price_discount) && ($user->rank->price_discount > 0)) {
                $rankDiscountPercent = $user->rank->price_discount;
            }

            foreach($products as $product) {
                $productsArr[$i]['id'] = $product->id;
                $productsArr[$i]['title'] = $product->title;
                $productsArr[$i]['prod_url_semantic'] = $product->prod_url_semantic;
                $productsArr[$i]['img_link'] = $product->productShowCaseImage->img_link;
                $productsArr[$i]['on_sale'] = $product->productReport->on_sale;
                $productsArr[$i]['article'] = $product->article;
                
                $productsArr[$i]['price_actual'] = $product->actualPrice->price_value  ?? NULL;
                $productsArr[$i]['price_regular'] = $product->regularPrice->price_value  ?? NULL;

                // Работаем с примененим системы скидок:
                $productsArr[$i]['price_with_rank_discount'] = $productsArr[$i]['percent_of_rank_discount'] = NULL;
                $productsArr[$i]['price_with_action_discount'] = $productsArr[$i]['summa_of_action_discount'] = NULL; // это скидки по "акциям"

                // если в корзину идёт регулярная цена (без скидки), подсчитаем цену со скидкой, в зависимости от ранга покупателя: 
                if(+$product->actualPrice->price_value == +$product->regularPrice->price_value) {
                    if($rankDiscountPercent) {
                        $productsArr[$i]['price_with_rank_discount'] = round($product->regularPrice->price_value - ($product->regularPrice->price_value * ($rankDiscountPercent / 100))); 
                        $productsArr[$i]['percent_of_rank_discount'] = $rankDiscountPercent;
                    }
                } elseif(+$product->actualPrice->price_value < +$product->regularPrice->price_value) {
                    // если есть специальная цена, нужно посмотреть какая цена меньше, ту и показываем => скидки не суммируем!
                    $actualPrice = $product->actualPrice->price_value;
                    $regularPrice = $product->regularPrice->price_value;
                    $possiblePriceWithDiscount = round($regularPrice - ($regularPrice * ($rankDiscountPercent / 100)));
                    if($possiblePriceWithDiscount < $actualPrice) {
                        $productsArr[$i]['price_with_rank_discount'] = $possiblePriceWithDiscount;
                        $productsArr[$i]['percent_of_rank_discount'] = $rankDiscountPercent;
                    } else {
                        // выводим для покупателя его выгоду от покупки товара по цене со кидкой по акции:
                        $productsArr[$i]['summa_of_action_discount'] = $regularPrice - $actualPrice;
                    }
                }
                
                $productsArr[$i]['date_end'] = NULL;
                if(+$product->actualPrice->price_value < +$product->regularPrice->price_value) {
                    $productsArr[$i]['price_special'] = $product->actualPrice->price_value;
                    $productsArr[$i]['date_end'] = $product->actualPrice->date_end  ?? NULL;
                } else {
                    $productsArr[$i]['price_special'] = NULL;
                }
                
                // $productsArr[$i]['prod_status'] = $product->product_status_id;
                $i++;
            }
        }
        
            //dd($productsArr);    
        return view('components.package.favorites', [
            'data' => $productsArr,
            'user' => $user,
        ]);
    }
*/

    public function getProducts(Request $request) {
        
        $user = null;
        $rankDiscountPercent = 0;
        $ids = $favoriteProducts = [];

        // если пользователь авторизован, нужно получить его данные для возможного оформления заказов или ещё чего-нибудь:
        if(Auth::check()) {
            // Получаем пользователя с загруженным отношением rank и списком избранного:
            $user = Auth::user()->load(['rank', 'favorite']);

            // Получаем товары избранного авторизованного пользователя:
            /*  $favoriteProducts = Product::whereIn(
                    'id', 
                    $user->favorite->product_ids ?? []
                )->get();
            */
        } 

        $ids = $request->input('ids', '[]'); 

        if(!empty($ids)) {
            $products = Product::with(['actualPrice', 'regularPrice', 'productReport', 'productShowCaseImage'])
                ->where('product_status_id', '=', 1)
                ->when($ids, function ($query, $ids) {
                    $query->whereIn('id', $ids);
                })
            ->get();
        
            $i = 0;
        
            // если пользователь авторизован, мы должны проверить какие скидки ему доступны (по умолчанию, согласно рангу):
            if(isset($user->rank->price_discount) && ($user->rank->price_discount > 0)) {
                $rankDiscountPercent = $user->rank->price_discount;
            }

            foreach($products as $product) {
                $favoriteProducts[$i]['id'] = $product->id;
                $favoriteProducts[$i]['title'] = $product->title;
                $favoriteProducts[$i]['prod_url_semantic'] = $product->prod_url_semantic;
                $favoriteProducts[$i]['img_link'] = $product->productShowCaseImage->img_link;
                $favoriteProducts[$i]['on_sale'] = $product->productReport->on_sale;
                $favoriteProducts[$i]['article'] = $product->article;
                
                $favoriteProducts[$i]['price_actual'] = $product->actualPrice->price_value  ?? NULL;
                $favoriteProducts[$i]['price_regular'] = $product->regularPrice->price_value  ?? NULL;

                // Работаем с примененим системы скидок:
                $favoriteProducts[$i]['price_with_rank_discount'] = $favoriteProducts[$i]['percent_of_rank_discount'] = NULL;
                $favoriteProducts[$i]['price_with_action_discount'] = $favoriteProducts[$i]['summa_of_action_discount'] = NULL; // это скидки по "акциям"

                // если в корзину идёт регулярная цена (без скидки), подсчитаем цену со скидкой, в зависимости от ранга покупателя: 
                if(+$product->actualPrice->price_value == +$product->regularPrice->price_value) {
                    if($rankDiscountPercent > 0) {
                        $favoriteProducts[$i]['price_with_rank_discount'] = round($product->regularPrice->price_value - ($product->regularPrice->price_value * ($rankDiscountPercent / 100))); 
                        $favoriteProducts[$i]['percent_of_rank_discount'] = $rankDiscountPercent;
                    }
                } elseif(+$product->actualPrice->price_value < +$product->regularPrice->price_value) {
                    // если есть специальная цена, нужно посмотреть какая цена меньше, ту и показываем => скидки не суммируем!
                    $actualPrice = $product->actualPrice->price_value;
                    $regularPrice = $product->regularPrice->price_value;
                    $possiblePriceWithDiscount = round($regularPrice - ($regularPrice * ($rankDiscountPercent / 100)));
                    if($possiblePriceWithDiscount < $actualPrice) {
                        $favoriteProducts[$i]['price_with_rank_discount'] = $possiblePriceWithDiscount;
                        $favoriteProducts[$i]['percent_of_rank_discount'] = $rankDiscountPercent;
                    } else {
                        // выводим для покупателя его выгоду от покупки товара по цене со кидкой по акции:
                        $favoriteProducts[$i]['summa_of_action_discount'] = $regularPrice - $actualPrice;
                    }
                }
                
                $favoriteProducts[$i]['date_end'] = NULL;
                if(+$product->actualPrice->price_value < +$product->regularPrice->price_value) {
                    $favoriteProducts[$i]['price_special'] = $product->actualPrice->price_value;
                    $favoriteProducts[$i]['date_end'] = $product->actualPrice->date_end  ?? NULL;
                } else {
                    $favoriteProducts[$i]['price_special'] = NULL;
                }
                
                // $favoriteProducts[$i]['prod_status'] = $product->product_status_id;
                $i++;
            }
        }

        
        // Для дебага используем логи (не dump!)
        \Log::debug('Favorites IDs:', ['ids' => $ids]);
        // \Log::debug('Favorites Products:', ['products' => $favoriteProducts]);
        \Log::debug('Favorites Resources:', ['resources' => new ProductCollection($products)]);
        // Просмотр логов:  tail -f storage/logs/laravel.log

        return response()->json([
            // 'products' => $favoriteProducts,
            'favoriteProducts' => new ProductCollection($products),             // Inertia.js использует JSON для передачи данных между Laravel и React. 
                                                                        // Когда мы передаём объект ProductCollection, он сериализуется в JSON. 
                                                                        // В процессе сериализации некоторые свойства объекта LengthAwarePaginator (например, lastPage, total, perPage и т.д.) 
                                                                        // могут быть преобразованы в массивы, если они имеют сложную структуру или если в процессе сериализации происходит 
                                                                        // дублирование данных - это проблема: в react мы получаем не значения, а массиивы значений (дублирование), 
                                                                        // что приводит к проблемам при рендеринге данных...
            //'debug' => ['received_ids' => $request->ids],               // Возврат отладочных данных в JSON
        ]);

    }
}
