<?php
// routes/web.php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\BasketController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\ProfileController;
// use Laravel\Fortify\Features;                                    // 06.01.2025  - 10.01.2025 - думаю, что это лишнее - можно будет удалить (осторожно)
use App\Http\Controllers\RegisteredUserController;                  // 09.01.2025 Обновим файл routes/web.php, чтобы использовать наш самописный контроллер для регистрации:
use App\Http\Controllers\Auth\ResendVerificationEmailController;    // 10.01.2025 делаем кнопку для повторной отправки ссылки на подтверждение электронной почты
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SiteMapXmlController;
use App\Http\Controllers\SiteMapController;
use App\Http\Controllers\IndexReactController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductCardController;
use App\Http\Controllers\FavoritesController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ProductsTableController;
use App\Http\Controllers\LegalController;

use Inertia\Inertia;
use Illuminate\Http\Request;                                        // подключим класс Request
use Illuminate\Support\Facades\DB;                                  // подключаем фасад
use App\Models\Order;

use App\Http\Controllers\InitialDataController;
use App\Http\Controllers\Auth\AuthSyncController;
use App\Http\Controllers\RecentlyViewedController;

use App\Models\User;
use Illuminate\Support\Facades\Auth;

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

// Переопределяем logout для поддержки GET (из-за ошибки: the get method is not supported for route logout)
Route::match(['get', 'post'], '/logout', function () {
    Auth::logout();
    return redirect('/');
})->name('logout');

/**
 * API-роуты (routes/api.php) используют api middleware group, где нет сессии
 * Web-роуты (routes/web.php) используют web middleware, который поддерживает сессии
 * Переносим Route::get('/initial-data', [InitialDataController::class, 'index']); в web.php
 */

// Для SSR-рендеринга таблицы
Route::get('/profile/products-table', [ProductsTableController::class, 'index'])
  ->middleware(['auth', 'verified']);

// Для API (пагинация/фильтры)
Route::get('/api/profile/products-table', [ProductsTableController::class, 'productsCatalogApi'])
  ->middleware('auth');

Route::middleware('web')->group(function () {
    // Инициализация данных
    Route::get('/api/initial-data', [InitialDataController::class, 'index']);

    // Получение id-шников избранного при загрузке страницы Избранного
    Route::get('/products/favorites', [FavoritesController::class, 'index']);
        
    // Обновление избранного (сохранение в БД)
    Route::post('/products/favorites', [FavoritesController::class, 'update']);

    // Получение товаров избранного
    Route::post('/products/favorites-get', [FavoritesController::class, 'getProducts']);

    // Обновление корзины (сохранение в БД)
    Route::match(['GET', 'POST'], '/cart/items', [CartController::class, 'update']);
    // Route::post('/cart/items', [CartController::class, 'store']);   // The GET method is not supported for route cart/items. Supported methods: POST.

    // Удаление товара из корзины (сохранение в БД)
    Route::delete('/cart/items', [CartController::class, 'delete']);

    // Синхронизация данных при авторизации
    Route::match(['GET', 'POST'], '/user/sync', [AuthSyncController::class, 'syncLocalData']);

    Route::post('/recently-viewed', [RecentlyViewedController::class, 'store'])->middleware('api');
});

// Маршруты для Inertia.js
Route::match(['get', 'post'], '/', [IndexReactController::class, 'index'])->name('home');
Route::match(['get', 'post'], '/products/cart', [CartController::class, 'index']);
Route::match(['get', 'post'], '/products/{category?}', [ProductController::class, 'index']);
Route::match(['get', 'post'], '/products/card/{prodUrlSemantic}', [ProductCardController::class, 'index']);
Route::match(['get', 'post'], '/products/basket', [BasketController::class, 'show']);
Route::match(['get', 'post'], '/orders', [PackageController::class, 'show']);

Route::match(['get', 'post'], '/profile', [ProfileController::class, 'index'])->middleware(['verified'])->name('profile');

// Изменение/обновление данных пользователя - добавил 07.07.2025 в middleware 'auth' - проверить, чтоб работало корректно...
Route::put('/profile', [ProfileController::class, 'update'])->middleware(['auth', 'verified'])->name('names.update');

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

/*Route::post('/sync-orders-list', function (Request $request) {
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
});*/

// Просмотр счёта (публичная)
/*Route::get('/invoice/{order}/{hash}', [OrderController::class, 'showInvoice'])
    ->name('order.invoice');*/

Route::get('/invoice/{order:access_hash}', [OrderController::class, 'showInvoice'])         // {order:access_hash} автоматически ищет заказ по хешу.
    ->name('order.invoice');

// Отслеживание заказа (публичная)
Route::get('/order/track/{order:access_hash}', [OrderController::class, 'trackOrder'])      // {order:access_hash} автоматически ищет заказ по хешу.
    ->name('order.track');

// Обзор заказов клиента
Route::get('/profile/orders', [OrderController::class, 'getOrders'])
    ->middleware(['auth', 'verified'])
    ->name('profile.orders');

/*Route::get('/legal/privacy-policy', function () {
    return view('legal.privacy-policy'); // Шаблон с текстом политики
})->name('legal.privacy');

Route::get('/legal/offer', function () {
    return view('legal.offer'); // Шаблон с офертой
})->name('legal.offer');*/

// Отображение документов пользователям
Route::get('/legal/{type}', [LegalController::class, 'show'])
    ->name('legal.show')
    ->where('type', 'privacy-policy|offer');

// Страница переподтверждения того, что пользователь ознакомился с новыми условиями оферты и/или использования персональных данных (если документы обновились)
// Пока комментируем - логика до конца не продумана и страницы не реализованы
/*Route::get('/legal-reconfirm', [LegalController::class, 'showReconfirmForm'])->name('legal.reconfirm');
Route::post('/legal-reconfirm', [LegalController::class, 'processReconfirm']);*/