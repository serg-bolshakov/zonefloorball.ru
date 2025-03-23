<?php
// routes/api.php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\InitialDataController  ;
use App\Http\Controllers\UserOrdersCountController;
use App\Http\Controllers\SticksAsideFiltersController;
use App\Http\Controllers\ProductController;


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
Route::get('/initial-data', [InitialDataController::class, 'index']);
Route::get('/sticks-aside-filters', [SticksAsideFiltersController::class, 'index']);
Route::get('/catalog', [ProductController::class, 'catalogApi']);
Route::get('/test', function () {
    return response()->json(['message' => 'Test route works!']);
});