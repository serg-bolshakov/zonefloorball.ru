<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\User;                                        // User — нужен для typehint в forUser(User $user)
use Illuminate\Support\Facades\Auth;
use App\Models\Product;
use App\Models\Transport;
use App\Services\DiscountService;
use Inertia\Inertia;
use App\Http\Resources\ProductCollection;

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

    // Реализуем API-методы: получаем товары корзины покупок пользователя
    // ожидаем: { [productId]: quantity } — это один объект вида { 84: 1, 89: 2 }
    public function getCartProducts(Request $request) {
        
        $validated = $request->validate(['products'  => ['sometimes', 'array']]);
        $productQuantities = $validated['products']; // {84: 1, 89: 2}
        
        \Log::debug('CartController begin', [
            '$validated' => $validated,
            'productQuantities' => $productQuantities,
        ]);

        $products = Product::with(['actualPrice', 'regularPrice', 'productReport', 'productShowCaseImage'])
            ->where('product_status_id', '=', 1)
            ->whereIn('id', array_keys($productQuantities))
            ->get()
            ->each(function ($product) use ($productQuantities) {
                $product->quantity = $productQuantities[$product->id] ?? 0;
            });

        \Log::debug('CartController processRequest:', [
            '$products' => $products,
        ]);
        try { 
            $response = [
                'products' => new ProductCollection($products),
                'cartTotal' => array_sum($validated['products'])
            ];
            \Log::debug('CartController: response', ['response' => $response]);
            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Ошибка загрузки данных в RecentlyViewedController',
                'details' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }  
    }

    // Добавление / обновление товара в корзину(е)
    public function update(Request $request) {
        
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);
                
        $updated = Cart::where('user_id', Auth::id())
            ->where('product_id', $validated['product_id'])
            ->update([
                'quantity' => $validated['quantity'],
                'deleted_at' => null // Сбрасываем мягкое удаление
        ]);

        // Если записи не было - создаём
        if ($updated === 0) {
            Cart::create([
                'user_id' => Auth::id(),
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity']
            ]);
        }

        return response()->json([
            'success' => true,
            'action' => $updated ? 'updated' : 'created'
        ]);
    }

    public function delete(Request $request) {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id'
        ]);

        // Когда пользователь сам удаляет товар из корзины - удадяем его "жёстко":
        $deleted = Cart::where('user_id', Auth::id())
            ->where('product_id', $validated['product_id'])
            ->delete();

        if (!$deleted) {
            return response()->json(['error' => 'Товар не найден в корзине'], 404);
        }

        return response()->json(['success' => true]);
    }
}