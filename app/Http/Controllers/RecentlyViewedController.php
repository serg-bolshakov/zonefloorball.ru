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

        /*\Log::debug('RecentlyViewedController:', [
            'method' => $request->method(),
            'data' => $request->all(),
            '$viewedAt' => $viewedAt
        ]);*/
        // Простой ответ для проверки
        return response()->json([
            'status' => 'success',
        ]);
    }

    public function getProducts(Request $request) {
        $userId = Auth::id();
        $validated = $request->validate([
            'ids' => [
                'required',
                'string',
                'regex:/^[\d,]+$/', // Только цифры и запятые
            ],
        ]);
        \Log::debug('validated:', ['headers' => $validated['ids'], 'headers' => $request->headers->all(), '$userId' => $userId]);

        // Разбиваем строку на массив только после валидации
        $productIds = explode(',', $validated['ids']);

        $products = RecentlyViewedProduct::getRecentlyViewedItems($productIds);
        
        try { 
            // \Log::debug('RecentlyViewedController: $products', ['new ProductCollection($products)' => new ProductCollection($products)]);
            return  new ProductCollection($products);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Ошибка загрузки данных в RecentlyViewedController',
                'details' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }  
    }
}
