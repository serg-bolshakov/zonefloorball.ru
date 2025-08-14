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