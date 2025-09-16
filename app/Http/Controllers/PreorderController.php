<?php
// app/Http/Controllers/PreorderController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Preorder;
use App\Models\User;                                       
use Illuminate\Support\Facades\Auth;
use App\Models\Product;
use App\Models\Transport;
use App\Services\DiscountService;
use Inertia\Inertia;
use App\Http\Resources\ProductCollection;

class PreorderController extends Controller
{    
    public function index() {
        try {
            return Inertia::render('Preorder', [
                'title' => 'Оформление предзаказа',
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

    // Реализуем API-методы: получаем товары, которые пользователь предполагает предзаказать (юридическое лицо)
    // ожидаем: { [productId]: quantity } — это один объект вида { 84: 1, 89: 2 }
    public function getPreorderProducts(Request $request) {
        
        $validated = $request->validate(['products'  => ['sometimes', 'array']]);
        $productQuantities = $validated['products']; // {84: 1, 89: 2}
        
        \Log::debug('PreorderController begin', [
            '$validated' => $validated,
            'productQuantities' => $productQuantities,
        ]);

        $products = Product::with(['actualPrice', 'regularPrice', 'preorderPrice', 'productReport', 'productShowCaseImage'])
            ->where('product_status_id', '=', 1)
            ->whereIn('id', array_keys($productQuantities))
            ->get()
            ->each(function ($product) use ($productQuantities) {
                $product->quantity = $productQuantities[$product->id] ?? 0;
            });

        \Log::debug('PreorderController processRequest:', [
            '$products' => $products,
        ]);
        try { 
            $response = [
                'products' => new ProductCollection($products),
                'preorderTotal' => array_sum($validated['products'])
            ];
            \Log::debug('PreorderController: response', ['response' => $response]);
            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Ошибка загрузки данных в PreorderController',
                'details' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }  
    }

    // Добавление / обновление товара в предзаказ(е)
    public function update(Request $request) {
        \Log::debug('PreorderController: update', ['request' => $request->all()]);
        $validated = $request->validate([
            'product_id'                    => 'required|integer|exists:products,id',
            'quantity'                      => 'required|integer|min:1',
            'expected_delivery_date'        => 'nullable|date|after:today'
        ]);
        \Log::debug('PreorderController: update validated', ['validated' => $validated]);

        // Преобразуем строку в правильный формат
        $deliveryDate = $validated['expected_delivery_date'] 
            ? date('Y-m-d', strtotime($validated['expected_delivery_date']))
            : null;

        $updated = Preorder::where('user_id', Auth::id())
            ->where('product_id', $validated['product_id'])
            ->update([
                'quantity'                  => $validated['quantity'],
                'deleted_at'                => null, // Сбрасываем мягкое удаление
                'expected_delivery_date'    => $deliveryDate
        ]);

        // Если записи не было - создаём
        if ($updated === 0) {
            Preorder::create([
                'user_id'                   => Auth::id(),
                'product_id'                => $validated['product_id'],
                'quantity'                  => $validated['quantity'],
                'expected_delivery_date'    => $deliveryDate
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

        // Когда пользователь сам удаляет товар из предзаказа - удадяем его "жёстко":
        $deleted = Preorder::where('user_id', Auth::id())
            ->where('product_id', $validated['product_id'])
            ->delete();

        if (!$deleted) {
            return response()->json(['error' => 'Товар не найден в презаказе'], 404);
        }

        return response()->json(['success' => true]);
    }

    // Функция очистки предзаказа пользователя (после оформления покупки или после нажатия кнопки (очистить предзаказ))
    public function clearPreorder(Request $request) {
        // Жёсткое удаление всех товаров предзаказа пользователя
        $deleted = Preorder::where('user_id', Auth::id())->delete();

        return response()->json([
            'success' => true,
            'deleted_count' => $deleted
        ]);
    }
}