<?php
// routes/api.php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\InitialDataController  ;
use App\Http\Controllers\UserOrdersCountController;
use App\Http\Controllers\SticksAsideFiltersController;
use App\Http\Controllers\BladesAsideFiltersController;
use App\Http\Controllers\BallsAsideFiltersController;
use App\Http\Controllers\BagsAsideFiltersController;
use App\Http\Controllers\GripsAsideFiltersController;
use App\Http\Controllers\EyewearsAsideFiltersController;
use App\Http\Controllers\GoalieAsideFiltersController;
use App\Http\Controllers\UserDataController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\FavoritesController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\RecentlyViewedController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\OrderController;

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
/*
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
*/

Route::get('/user-orders-count', [UserOrdersCountController::class, 'index']);
Route::get('/user-data', [UserDataController::class, 'index']);
Route::get('/initial-data', [InitialDataController::class, 'index']);
Route::get('/sticks-aside-filters', [SticksAsideFiltersController::class, 'index']);
Route::get('/blades-aside-filters', [BladesAsideFiltersController::class, 'index']);
Route::get('/balls-aside-filters', [BallsAsideFiltersController::class, 'index']);
Route::get('/bags-aside-filters', [BagsAsideFiltersController::class, 'index']);
Route::get('/grips-aside-filters', [GripsAsideFiltersController::class, 'index']);
Route::get('/eyewears-aside-filters', [EyewearsAsideFiltersController::class, 'index']);
Route::get('/goalie-aside-filters', [GoalieAsideFiltersController::class, 'index']);
Route::get('/catalog', [ProductController::class, 'catalogApi']);
Route::match(['get', 'post'], '/products/favorites', [FavoritesController::class, 'getProducts'])->middleware('api'); // Важно!;
Route::match(['get', 'post'], '/products/cart', [CartController::class, 'sync'])->middleware('api');
Route::get('/products/recently-viewed', [RecentlyViewedController::class, 'getProducts'])->middleware('api');
Route::post('/products/recently-viewed', [RecentlyViewedController::class, 'store'])->middleware('api');
Route::match(['get', 'post'],'/orders/create', [OrderController::class, 'create'])->middleware('api');
Route::get('/warehouses', [WarehouseController::class, 'index']);
Route::get('/delivery-options', [DeliveryController::class, 'index']);
Route::get('/test', function () {
    return response()->json(['message' => 'Test route works!']);
});