<?php
// routes/web.php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\BasketController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LkController;
use App\Http\Controllers\ProfileController;
// use Laravel\Fortify\Features;                                    // 06.01.2025  - 10.01.2025 - думаю, что это лишнее - можно будет удалить (осторожно)
use App\Http\Controllers\RegisteredUserController;                  // 09.01.2025 Обновим файл routes/web.php, чтобы использовать наш самописный контроллер для регистрации:
use App\Http\Controllers\Auth\ResendVerificationEmailController;    // 10.01.2025 делаем кнопку для повторной отправки ссылки на подтверждение электронной почты
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SiteMapXmlController;
use App\Http\Controllers\SiteMapController;
use App\Http\Controllers\IndexReactController;
use App\Http\Controllers\CatalogReactController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductCardController;
use App\Http\Controllers\FavoritesController;
use App\Http\Controllers\CartController;

use Inertia\Inertia;
use Illuminate\Http\Request;                                        // подключим класс Request
use Illuminate\Support\Facades\DB;                                  // подключаем фасад
use App\Models\Order;

use App\Http\Controllers\InitialDataController;
use App\Http\Controllers\Auth\AuthSyncController;



/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

/**
 * API-роуты (routes/api.php) используют api middleware group, где нет сессии
 * Web-роуты (routes/web.php) используют web middleware, который поддерживает сессии
 * Переносим Route::get('/initial-data', [InitialDataController::class, 'index']); в web.php
 */

Route::middleware('web')->group(function () {
    // Инициализация данных
    Route::get('/api/initial-data', [InitialDataController::class, 'index']);

    // Получение id-шников избранного при загрузке страницы Избранного
    Route::get('/products/favorites', [FavoritesController::class, 'index']);
        
    // Обновление избранного (сохранение в БД)
    Route::post('/products/favorites', [FavoritesController::class, 'update']);

    // Получение товаров избранного
    Route::post('/products/favorites-get', [FavoritesController::class, 'getProducts']);

    // Синхронизация данных при авторизации
    Route::match(['GET', 'POST'], '/user/sync', [AuthSyncController::class, 'syncLocalData']);
});


// Маршруты для Inertia.js
Route::match(['get', 'post'], '/', [IndexReactController::class, 'index'])->name('home');
Route::match(['get', 'post'], '/products/cart', [CartController::class, 'index']);
// Route::match(['get', 'post'], '/products/favorites', [FavoritesController::class, 'index']);
Route::match(['get', 'post'], '/products/{category?}', [ProductController::class, 'index']);
// Route::match(['get', 'post'],'/products/catalog', [CatalogReactController::class, 'index']);
// Route::match(['get', 'post'], '/', ['App\\Http\\Controllers\\IndexController', 'index']);


Route::match(['get', 'post'], '/products/card/{prodUrlSemantic}', [ProductCardController::class, 'index']);
Route::match(['get', 'post'], '/products/basket', [BasketController::class, 'show']);
Route::match(['get', 'post'], '/orders', [PackageController::class, 'show']);
//Route::match(['get', 'post'], '/products/{category?}', ['App\\Http\\Controllers\\CatalogController', 'index']);
Route::match(['get', 'post'], '/lk', [LkController::class, 'index']);
Route::match(['get', 'post'], '/profile', [ProfileController::class, 'index'])->middleware(['verified']);

Route::get('/email/verify', function () {
    return view('auth.verify-email');
})->name('verification.notice');

Route::middleware('auth')->group(function () {
    Route::get('/update-password', function () {
        return view('auth.update-password');
    })->name('password.update');

    Route::get('/update-email', function () {
        return view('auth.update-email');
    })->middleware('password.confirm')->name('user-profile-information.update');
});

// 09.01.2025 Обновим файл routes/web.php, чтобы использовать наш самописный контроллер для регистрации:
// затем отключаем стандартные маршруты Fortify config/fortify.php и найдите раздел features
Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
Route::post('/register', [RegisteredUserController::class, 'store']);

// 10.01.2025 делаем кнопку для повторной отправки ссылки на подтверждение электронной почты
// Маршрут для отображения формы
Route::get('/resend-verification-email', function () {
    return view('auth.resend-verification-email');
})->name('verification.resend.form');

// Маршрут для обработки запроса повторной отправки письма
Route::post('/resend-verification-email', [ResendVerificationEmailController::class, 'resend'])
    ->name('verification.resend');

Route::post('/robokassa/result', [PaymentController::class, 'handleResult'])->name('robokassa.result');

// Маршрут для генерации карты сайта:
Route::get('/generate-sitemap', [SiteMapXmlController::class, 'generate']);

// Маршрут для HTML-карты сайта:
Route::get('/sitemap', [SiteMapController::class, 'index']);

Route::post('/sync-orders-list', function (Request $request) {
    // Получаем данные из запроса
    // $ordersIdsArr = json_decode($request->input('orderslistfromlocalstorageinheader')); - это не работает! json_decode по умолчанию преобразует JSON-строку в объект (stdClass), а не в ассоциативный массив.
    // Используем второй параметр json_decode, чтобы преобразовать JSON в ассоциативный массив:
    $ordersIdsArr = json_decode($request->input('orderslistfromlocalstorageinheader'), true);   //  Теперь $ordersIdsArr будет массивом, а не объектом.
    
    $idsOrdersInUserLocalStorageToDel = [];                                                     // если буду id-заказов, которые есть в локальном хранилище браузера и уже нет в БД - будем записывать такие id сюда
    foreach($ordersIdsArr as $key=>$orderId) {
        $isOrderStillExsists = Order::where('id', $orderId)->first();
        // если заказа из строки локального хранилища браузера НЛО-пользователя уже в базе данных нет, нужно удалить этот элемент из массива id-заказов НЛО его локального хранилища: 
        if(empty($isOrderStillExsists)) {
            $idsOrdersInUserLocalStorageToDel[] = $orderId;
            unset($ordersIdsArr[$key]);
        }
    }
    
    // Возвращаем JSON-ответ
    return response()->json($ordersIdsArr);
});

// Временный маршрут для тестирования
Route::get('/test-cart', function(Request $request) {
    $fakeRequest = new \Illuminate\Http\Request([
        'cart' => ['47' => 3, '84' => 1] // Имитируем данные из localStorage
    ]);
    
    return app()->make(\App\Http\Controllers\CartController::class)
        ->sync($fakeRequest);
});

