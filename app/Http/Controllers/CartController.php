<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\User;                                        // User — нужен для typehint в forUser(User $user)
use App\Services\DiscountService;

class CartController extends Controller
{    
    public function index() {
        try {
            return Inertia::render('CartPage', [
                    'title' => 'Корзина покупок',
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

    // Реализуем API-методы:
    public function sync(Request $request) {
        $validated = $request->validate(Cart::rules()); 
        $cart = Cart::forUser(auth()->user());                  // Auth не нужен, т.к. auth()->user() работает глобально в Laravel (use Illuminate\Support\Facades\Auth;)
        $cart->update(['products' => $request->input('cart')]);
        return response()->json($cart);
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