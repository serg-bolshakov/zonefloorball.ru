<?php
// routes/api.php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// use App\Http\Controllers\UserOrdersCountController;
use App\Http\Controllers\SticksAsideFiltersController;
use App\Http\Controllers\BladesAsideFiltersController;
use App\Http\Controllers\BallsAsideFiltersController;
use App\Http\Controllers\BagsAsideFiltersController;
use App\Http\Controllers\GripsAsideFiltersController;
use App\Http\Controllers\EyewearsAsideFiltersController;
use App\Http\Controllers\GoalieAsideFiltersController;
// use App\Http\Controllers\UserDataController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\FavoritesProductsApiController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\RecentlyViewedController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PreorderController;
use App\Http\Controllers\Api\StickController;
use App\Http\Controllers\Api\StickPropertiesController;
use App\Http\Controllers\Api\ProductPriceController;
use App\Http\Controllers\Api\ImageController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ReviewMediaController;

use App\Enums\PriceType;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/


/**
 * API-роуты (routes/api.php) используют api middleware group, где нет сессии
 * Web-роуты (routes/web.php) используют web middleware, который поддерживает сессии
 * Переносим Route::get('/initial-data', [InitialDataController::class, 'index']); в web.php
 */

// Route::get('/user-orders-count', [UserOrdersCountController::class, 'index']);
// Route::get('/user-data', [UserDataController::class, 'index']);
Route::get('/sticks-aside-filters', [SticksAsideFiltersController::class, 'index']);
Route::get('/blades-aside-filters', [BladesAsideFiltersController::class, 'index']);
Route::get('/balls-aside-filters', [BallsAsideFiltersController::class, 'index']);
Route::get('/bags-aside-filters', [BagsAsideFiltersController::class, 'index']);
Route::get('/grips-aside-filters', [GripsAsideFiltersController::class, 'index']);
Route::get('/eyewears-aside-filters', [EyewearsAsideFiltersController::class, 'index']);
Route::get('/goalie-aside-filters', [GoalieAsideFiltersController::class, 'index']);
Route::get('/catalog', [ProductController::class, 'catalogApi']);
Route::match(['get', 'post'],'/products/cart', [CartController::class, 'getCartProducts'])->middleware('api');
Route::match(['get', 'post'],'/products/preorder', [PreorderController::class, 'getPreorderProducts']);
Route::post('/products/favorites', [FavoritesProductsApiController::class, 'index']);
Route::get('/products/recently-viewed', [RecentlyViewedController::class, 'getProducts'])->middleware('api');
Route::match(['get', 'post'],'/orders/create', [OrderController::class, 'create'])->middleware('api');
Route::get('/warehouses', [WarehouseController::class, 'index']);
Route::get('/delivery-options', [DeliveryController::class, 'index']);
Route::delete('/cart/clear', [CartController::class, 'clearCart'])->middleware('auth:sanctum');
Route::delete('/preorder/clear', [PreorderController::class, 'clearPreorder'])->middleware('auth:sanctum');
Route::get('/test', function () {
    return response()->json(['message' => 'Test route works!']);
});
Route::middleware('auth:sanctum')->get('/test-auth', function (Request $request) {
    return ['user' => $request->user()];
});

// Роут для проверки наличия похожего товара в БД при добавлении нового
Route::post('/check-similar/products', [ProductController::class, 'checkSimilar']);

// Роут. Сохранение шага 1. Создание новго товара (клюшки)
// Route::get('/products/sticks', [StickController::class, 'index']);           // Список - нет такого метода... удалить в следующий раз...
Route::post('/products/sticks/create', [StickController::class, 'store']);      // Создание
Route::get('/products/sticks/{id}', [StickController::class, 'show']);          // Просмотр
Route::put('/products/sticks/{id}', [StickController::class, 'update']);        // Обновление
Route::delete('/products/sticks/{id}', [StickController::class, 'destroy']);    // Удаление

// Получение свойств для шага 2
Route::get('/stick-properties/{productId}', [StickPropertiesController::class, 'getProperties']);

// Добавление нового типа обмотки
Route::post('/stick-properties/grip', [StickPropertiesController::class, 'addGrip']);

// Добавление нового профиля
Route::post('/stick-properties/profile', [StickPropertiesController::class, 'addProfile']);

// Добавление новой модели крюка
Route::post('/stick-properties/blade', [StickPropertiesController::class, 'addBlade']);

// Сохранение шага 2
Route::post('/stick-properties/save-step2/{productId}', [StickPropertiesController::class, 'saveStep2']);

// Сохранение шага 3 (создание цен и начальных скидок)
Route::post('/stick-properties/create-prices/{productId}', [ProductPriceController::class, 'storeStep3']);

// Загрузка изображений товаров
Route::post('/admin/products/{productId}/images', [ImageController::class, 'storeImages']);

// Роуты для админки при оформлении документов
Route::get('/categories', function () {
    return \App\Models\Category::withCount(['products' => function ($query) {
        $query->where('product_status_id', 1);   // active
    }])->get()->map(function ($category) {
        return [
            'id' => $category->id,
            'category_view_2' => $category->category_view_2,
            'products_count' => (int) $category->products_count,
        ];
    });
});

Route::get('/categories/{category}/products', function (\App\Models\Category $category) {
    
    \DB::enableQueryLog();
    
    $products = $category->products()
        ->with(['costPrice', 'preorderPrice'])
        ->select('id', 'article', 'title')
        ->get();

    // Смотрим какие запросы выполнились
    \Log::info('SQL Queries:', \DB::getQueryLog());
    
    // $products->loadMissing(['costPrice', 'preorderPrice']);
    // Дамп для отладки
    foreach ($products as $product) {
        \Log::info("Product {$product->id} debug:", [
            'costPrice_relation' => $product->costPrice ? 'EXISTS' : 'NULL',
            'costPrice_type' => gettype($product->costPrice),
            'costPrice_class' => $product->costPrice ? get_class($product->costPrice) : 'NULL',
            'costPrice_raw' => $product->costPrice,
            'preorderPrice_relation' => $product->preorderPrice ? 'EXISTS' : 'NULL',
        ]);
        // Проверим через отдельный запрос
        $manualCostPrice = \App\Models\Price::where('product_id', $product->id)
            ->where('price_type_id', \App\Models\Price::TYPE_COST)
            ->latest('id')
            ->first();
        \Log::info("Manual query for costPrice:", [
            'found' => $manualCostPrice ? 'YES' : 'NO',
            'data' => $manualCostPrice ? $manualCostPrice->toArray() : 'NULL'
        ]);
    }

    return $products->map(function ($product) {
        return [
            'id' => $product->id,
            'article' => $product->article,
            'title' => $product->title,
            'cost_price' => $product->costPrice->price_value ?? 0,
            'preorderPrice' => $product->preorderPrice->price_value ?? 0
        ];
    });
});

// Новый маршрут для теста
Route::get('/test-prices/{productId}', function ($productId) {
    $product = \App\Models\Product::find($productId);
    
    \Log::info('=== TEST START ===');
    
    // Способ 1: Через отношение
    $cost1 = $product->costPrice;
    \Log::info('Cost via relation:', [$cost1 ? $cost1->toArray() : 'NULL']);
    
    // Способ 2: Через прямой запрос
    $cost2 = \App\Models\Price::where('product_id', $productId)
        ->where('price_type_id', \App\Models\Price::TYPE_COST)
        ->latest('id')
        ->first();
    \Log::info('Cost via direct query:', [$cost2 ? $cost2->toArray() : 'NULL']);
    
    \Log::info('=== TEST END ===');
    
    return ['via_relation' => $cost1, 'via_query' => $cost2];
});

Route::get('/products/search', function (Request $request) {
    $query = $request->get('q');
    
    return \App\Models\Product::where('article', 'like', "%{$query}%")
        ->orWhere('title', 'like', "%{$query}%")
        ->with('costPrice')
        ->select('id', 'article', 'title')
        ->limit(20)
        ->get()
        ->map(function ($product) {
            return [
                'id' => $product->id,
                'article' => $product->article,
                'title' => $product->title,
                'cost_price' => $product->costPrice->price_value ?? 0, // ✅ Себестоимость или 0
            ];
        });
});

// НОВЫЕ Роуты для админки при оформлении документов

// Роут для получения категорий с товарами для комплектации
Route::get('/categories-with-assembly-products', function () {
    return \App\Models\Category::whereHas('products.kitComponents') // Только с комплектующими
    // фильтрует категории: Берем отношение products (товары категории), Для каждого товара проверяем отношение kitComponents - товары, которые можно собрать из комплектующих, Оставляет только те категории, у которых есть хотя бы один товар с комплектующими
        ->withCount(['products' => function ($query) {
            $query->where('product_status_id', 1)
                  ->has('kitComponents'); // Только товары, которые можно собрать, у которых есть комплектующие
        }])
        ->get()
        ->map(function ($category) {
            return [
                'id' => $category->id,
                'category_view_2' => $category->category_view_2,
                'products_count' => (int) $category->products_count,
            ];
        });
});

// Товары категории (только те, что можно комплектовать)
Route::get('/categories/{category}/assembly-products', function (\App\Models\Category $category) {
    return $category->products()
        ->where('product_status_id', 1)
        ->has('kitComponents') // Только с комплектующими
        ->with('costPrice', 'kitComponents.component') // Загружаем комплектующие
        ->select('id', 'article', 'title')
        ->get()
        ->map(function ($product) {
            return [
                'id' => $product->id,
                'article' => $product->article,
                'title' => $product->title,
                'cost_price' => $product->costPrice->price_value ?? 0,
                'can_be_assembled' => $product->canBeAssembled(), // Проверка доступности
                'components_count' => $product->kitComponents->count(),
            ];
        });
});

// Поиск товаров (только те, что можно комплектовать)
Route::get('/products/assembly-search', function (Request $request) {
    $query = $request->get('q');
    
    return \App\Models\Product::where('product_status_id', 1)
        ->has('kitComponents') // Только с комплектующими
        ->where(function ($q) use ($query) {
            $q->where('article', 'like', "%{$query}%")
              ->orWhere('title', 'like', "%{$query}%");
        })
        ->with('costPrice', 'kitComponents.component')
        ->select('id', 'article', 'title')
        ->limit(20)
        ->get()
        ->map(function ($product) {
            return [
                'id' => $product->id,
                'article' => $product->article,
                'title' => $product->title,
                'cost_price' => $product->costPrice->price_value ?? 0,
                'can_be_assembled' => $product->canBeAssembled(),
                'components_count' => $product->kitComponents->count(),
            ];
        });
});

// Роуты для загрузки/удаления отзывов
Route::middleware(['auth:sanctum'])->group(function () {
    // Создание отзыва
    Route::post('/reviews', [ReviewController::class, 'store']);
    
    // Загрузка медиа для отзывов
    Route::post('/reviews/{review}/media', [ReviewMediaController::class, 'store']);
    Route::delete('/reviews/{review}/media/{mediaId}', [ReviewMediaController::class, 'destroy']);
});

// Route::post('/reviews/mark-as-helpful', [ReviewController::class, 'markAsHelpful']);
// Более семантично и RESTful
Route::post('/reviews/{review}/helpful', [ReviewController::class, 'markAsHelpful']);