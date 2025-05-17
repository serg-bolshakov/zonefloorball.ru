<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request; 
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\ProductResource; // Вместо того чтобы вручную собирать данные в массив $productsArr, пробуем использовать ресурсы (Resources) в Laravel. Ресурсы позволяют преобразовывать модели и коллекции в JSON-структуру, что упрощает работу с данными.
                                        // В нашем случае нам нужно вернуть список товаров, пробуем использовать ресурс коллекции: php artisan make:resource ProductCollection
use App\Http\Resources\ProductCollection;
use App\Models\Product;
use App\Models\RecentlyViewedProduct;
use Illuminate\Support\Carbon; 

/** Знакомимся с Carbon-ом:
 *  Carbon — это "магия" для дат в Laravel - популярная PHP-библиотека для работы с датами и временем, 
 *  расширяющая стандартный класс DateTime. Она добавляет удобные методы для манипуляций с датами.
 * 
 *  Основные возможности Carbon:
 *  1. Создание дат из разных форматов: 
 *      - Carbon::now(); // Текущее время
 *      - Carbon::createFromTimestampMs(1640995200000); // Из timestamp в миллисекундах
 *  2. Форматирование:
 *      - $date->format('Y-m-d H:i:s'); // "2023-12-31 23:59:59"
 *      - $date->toIso8601String(); // ISO-8601
 *  3. Манипуляции:
 *      - $date->addDays(7); // +7 дней
 *      - $date->subHours(3); // -3 часа
 *  4. Сравнение:
 *      - $date->isPast(); // true/false
 *      - $date->diffInMinutes($otherDate); // Разница в минутах
 */

class RecentlyViewedController extends Controller {
    
    public function store(Request $request) {
        
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'viewed_at' => 'required|date'
        ]);
        
        $userId = Auth::id();
        $productId = $validated['product_id'];
        $viewedAt = Carbon::parse($validated['viewed_at']);

        // Обновляем или создаём запись
        RecentlyViewedProduct::updateOrCreate(
            ['user_id' => $userId, 'product_id' => $productId],
            ['viewed_at' => $viewedAt]
        );

        \Log::debug('RecentlyViewedController:', [
            'method' => $request->method(),
            'data' => $request->all(),
            '$viewedAt' => $viewedAt
        ]);
        // Простой ответ для проверки
        return response()->json([
            'status' => 'success',
        ]);
    }

    public function getProducts(Request $request) {
                
        $user = null;
        $rankDiscountPercent = 0;
        $productIds = $recentlyViewedProducts = [];

        $validated = $request->validate([
            'ids' => [
                'required',
                'string',
                'regex:/^[\d,]+$/', // Только цифры и запятые
            ],
        ]);
        // \Log::debug('validated:', ['validated' => $validated['ids']]);

        // Разбиваем строку на массив только после валидации
        $productIds = explode(',', $validated['ids']);

        // если пользователь авторизован, нужно получить его данные для возможного оформления заказов или ещё чего-нибудь:
        /*if(Auth::check()) {
            // Получаем пользователя с загруженным отношением rank и списком избранного:
            $user = Auth::user()->load(['rank', 'recentlyViewedProducts']);
        }*/
        
        $user = auth()->user();
        $products = RecentlyViewedProduct::getRecentlyViewedItems($productIds);
        //\Log::debug('$products:', ['$products' => $products]);


        /*if(!empty($productIds)) {
            $products = Product::with(['actualPrice', 'regularPrice', 'productReport', 'productShowCaseImage'])
                ->where('product_status_id', '=', 1)
                ->when($productIds, function ($query, $productIds) {
                    $query->whereIn('id', $productIds);
                })
            ->get();
        
            $i = 0;
        
            // если пользователь авторизован, мы должны проверить какие скидки ему доступны (по умолчанию, согласно рангу):
            if(isset($user->rank->price_discount) && ($user->rank->price_discount > 0)) {
                $rankDiscountPercent = $user->rank->price_discount;
            }

            foreach($products as $product) {
                $recentlyViewedProducts[$i]['id'] = $product->id;
                $recentlyViewedProducts[$i]['title'] = $product->title;
                $recentlyViewedProducts[$i]['prod_url_semantic'] = $product->prod_url_semantic;
                $recentlyViewedProducts[$i]['img_link'] = $product->productShowCaseImage->img_link;
                $recentlyViewedProducts[$i]['on_sale'] = $product->productReport->on_sale;
                $recentlyViewedProducts[$i]['article'] = $product->article;
                
                $recentlyViewedProducts[$i]['price_actual'] = $product->actualPrice->price_value  ?? NULL;
                $recentlyViewedProducts[$i]['price_regular'] = $product->regularPrice->price_value  ?? NULL;

                // Работаем с примененим системы скидок:
                $favoriteProducts[$i]['price_with_rank_discount'] = $recentlyViewedProducts[$i]['percent_of_rank_discount'] = NULL;
                $recentlyViewedProducts[$i]['price_with_action_discount'] = $recentlyViewedProducts[$i]['summa_of_action_discount'] = NULL; // это скидки по "акциям"

                // если в корзину идёт регулярная цена (без скидки), подсчитаем цену со скидкой, в зависимости от ранга покупателя: 
                if(+$product->actualPrice->price_value == +$product->regularPrice->price_value) {
                    if($rankDiscountPercent > 0) {
                        $recentlyViewedProducts[$i]['price_with_rank_discount'] = round($product->regularPrice->price_value - ($product->regularPrice->price_value * ($rankDiscountPercent / 100))); 
                        $recentlyViewedProducts[$i]['percent_of_rank_discount'] = $rankDiscountPercent;
                    }
                } elseif(+$product->actualPrice->price_value < +$product->regularPrice->price_value) {
                    // если есть специальная цена, нужно посмотреть какая цена меньше, ту и показываем => скидки не суммируем!
                    $actualPrice = $product->actualPrice->price_value;
                    $regularPrice = $product->regularPrice->price_value;
                    $possiblePriceWithDiscount = round($regularPrice - ($regularPrice * ($rankDiscountPercent / 100)));
                    if($possiblePriceWithDiscount < $actualPrice) {
                        $recentlyViewedProducts[$i]['price_with_rank_discount'] = $possiblePriceWithDiscount;
                        $recentlyViewedProducts[$i]['percent_of_rank_discount'] = $rankDiscountPercent;
                    } else {
                        // выводим для покупателя его выгоду от покупки товара по цене со кидкой по акции:
                        $recentlyViewedProducts[$i]['summa_of_action_discount'] = $regularPrice - $actualPrice;
                    }
                }
                
                $recentlyViewedProducts[$i]['date_end'] = NULL;
                if(+$product->actualPrice->price_value < +$product->regularPrice->price_value) {
                    $recentlyViewedProducts[$i]['price_special'] = $product->actualPrice->price_value;
                    $recentlyViewedProducts[$i]['date_end'] = $product->actualPrice->date_end  ?? NULL;
                } else {
                    $recentlyViewedProducts[$i]['price_special'] = NULL;
                }
                
                // $recentlyViewedProducts[$i]['prod_status'] = $product->product_status_id;
                $i++;
            }
        }*/

   
        // Просмотр логов:  tail -f storage/logs/laravel.log
        //\Log::debug('$response:', ['$response' => new ProductCollection($response['products'])]);

        return response()->json([
            'products' => $products->map(function ($product) use ($user) {
                return $this->enrichProductData( $product, $user );
            }),
        ]); 
    }

    private function enrichProductData(Product $product, ?User $user) {
        $data = [
            'id' => $product->id,
            'title' => $product->title,
            'prod_url_semantic' => $product->prod_url_semantic,
            'img_link' => $product->productShowCaseImage->img_link,
            'on_sale' => $product->productReport->on_sale,
            'article' => $product->article,
            'price_actual' => $product->actualPrice->price_value  ?? NULL,
            'price_regular' => $product->regularPrice->price_value  ?? NULL,
        ];

        if($user) {
            $data = array_merge($data, $this->calculateDiscount($product, $user));
        }

        return $data;
    }

    private function calculateDiscount(Product $product, User $user) {
        $discountData = [];
        $rankDiscount = $user->rank->price_discount ?? 0;

        // Работаем с примененим системы скидок:
        $discountData['price_with_rank_discount'] = $discountData['percent_of_rank_discount'] = NULL;
        $discountData['price_with_action_discount'] = $discountData['summa_of_action_discount'] = NULL; // это скидки по "акциям"
        
        // если идёт регулярная цена (без скидки), подсчитаем цену со скидкой, в зависимости от ранга покупателя: 
        if($product->actualPrice->price_value == $product->regularPrice->price_value) {
            if($rankDiscountPercent > 0) {
                $discountData['price_with_rank_discount'] = round($product->regularPrice->price_value - ($product->regularPrice->price_value * ($rankDiscountPercent / 100))); 
                $discountData['percent_of_rank_discount'] = $rankDiscountPercent;
            }
        } elseif($product->actualPrice->price_value < $product->regularPrice->price_value) {
            // если есть специальная цена, нужно посмотреть какая цена меньше, ту и показываем => скидки не суммируем!
            $actualPrice = $product->actualPrice->price_value;
            $regularPrice = $product->regularPrice->price_value;
            $possiblePriceWithDiscount = round($regularPrice - ($regularPrice * ($rankDiscountPercent / 100)));
            if($possiblePriceWithDiscount < $actualPrice) {
                $discountData['price_with_rank_discount'] = $possiblePriceWithDiscount;
                $discountData['percent_of_rank_discount'] = $rankDiscountPercent;
            } else {
                // выводим для покупателя его выгоду от покупки товара по цене со кидкой по акции:
                $discountData['summa_of_action_discount'] = $regularPrice - $actualPrice;
            }
        }
        
        $discountData['date_end'] = NULL;
        if($product->actualPrice->price_value < $product->regularPrice->price_value) {
            $discountData['price_special'] = $product->actualPrice->price_value;
            $discountData['date_end'] = $product->actualPrice->date_end  ?? NULL;
        } else {
            $discountData['price_special'] = NULL;
        }
        return $discountData;
    }  
}
