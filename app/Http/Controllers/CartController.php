<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\User;                                        // User — нужен для typehint в forUser(User $user)
use App\Models\Product;
use App\Models\Transport;
use App\Services\DiscountService;
use Inertia\Inertia;

class CartController extends Controller
{    
    public function index() {
        try {
            return Inertia::render('CartPage', [
                'title' => 'Корзина покупок',
                'robots' => 'NOINDEX,NOFOLLOW',
                'description' => '',
                'keywords' => '',
                'transports' => $this->getTransports(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }
            
    // Получаем доступные способы доставки товаров (заказов):
    public function getTransports() {
        try {
            return Transport::where('is_active', true)
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'code' => $t->code,
                'name' => $t->name,
                'base_price' => $t->base_price,
                'price_calculation' => $t->price_calculation
            ]);
        } catch (\Exception $e) {
            return [];
        }
    }

    // Реализуем API-методы:
    public function sync(Request $request) {
        $validated = $request->validate(Cart::rules()); 
        $products = Cart::getCartItems($validated['products']);
        
        $user = auth()->user();

        $response = [
            'products' => $products->map(function ($product) use ($user, $validated) {
                return $this->enrichProductData(
                    $product,
                    $validated['products'][$product->id] ?? 1,
                    $user
                );
            }),
            'cartTotal' => array_sum($validated['products'])
        ];
        //dd($response);
        if($user) {
            Cart::updateOrCreate(
                ['user_id' => $user->id],
                ['products' => $validated['products']]
            );
        }

        return response()->json($response);
    }

    private function enrichProductData(Product $product, int $quantity, ?User $user) {
        $data = [
            'id' => $product->id,
            'title' => $product->title,
            'prod_url_semantic' => $product->prod_url_semantic,
            'img_link' => $product->productShowCaseImage->img_link,
            'quantity' => $quantity,
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
        
        // если в корзину идёт регулярная цена (без скидки), подсчитаем цену со скидкой, в зависимости от ранга покупателя: 
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

    /**
     * 1. Пользователь добавляет товар → фронт отправляет: { "cart": {"84": {"quantity": 1}} }
     * 2. Контроллер:
     *  - Проверяет данные через Cart::rules(): $validated = $request->validate(Cart::rules()); // Вот тут!
     *  - Находит/создает корзину через Cart::forUser()
     *  - Сохраняет в БД как JSON
     * 3. При следующем запросе: Laravel автоматически преобразует JSON из БД в массив PHP благодаря $casts.
     */
}