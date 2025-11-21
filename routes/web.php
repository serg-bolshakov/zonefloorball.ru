<?php
// routes/web.php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\BasketController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\ProfileController;
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
use App\Http\Controllers\PreorderController;
use App\Http\Controllers\ProductsTableController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AdminStockController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminProductsController;
use App\Http\Controllers\Admin\AdminProductPriceController;
use App\Http\Controllers\Admin\AdminDocumentController;
use App\Http\Controllers\CallbackController;

// пробуем настроить логаут 24.10.2025
use Laravel\Fortify\Features;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;
use Laravel\Fortify\Fortify;

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
/*Route::match(['get', 'post'], '/logout', function (Request $request) {
    \Log::debug('Custom logout route called');

    // 1. Получаем пользователя ДО его выхода
    $user = Auth::user();

    // 2. Выполняем logout - стандартный logout Fortify
    Auth::logout();

    // 3. Инвалидируем сессию ПЕРВЫМ делом
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    // 4. Создаем response
    $response = redirect('/');

    // 5. ПРИНУДИТЕЛЬНО очищаем куки через headers
    $cookiesToClear = [
        'laravel_session',
        'XSRF-TOKEN', 
        'remember_web',
        'login_redirect',
        'zonefloorballru_session',
    ];
    
    foreach ($cookiesToClear as $cookieName) {
        // Оба способа для надежности
        Cookie::queue(Cookie::forget($cookieName));
        $response->headers->clearCookie($cookieName);
    }

    \Log::debug('Force logout completed', [
        'previous_user' => $user->id ?? null,
        'cleaned_cookies' => $cookiesToClear
    ]);

    return $response;
})->name('logout');*/

/* Route::match(['get', 'post'], '/logout', function (Request $request) {
    \Log::debug('=== SAFE COOKIE CLEANUP ===');
    
    // Логируем ВСЕ куки которые видит сервер
    \Log::debug('All cookies from request:', array_keys($request->cookies->all()));
    
    $user = Auth::user();
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    // Только наши известные куки
    $cookiesToClear = [
        'laravel_session',
        'XSRF-TOKEN', 
        'remember_web',
        'login_redirect',
        'zonefloorballru_session',
    ];
    
    // Добавляем remember_web с хешем (если используется)
    $allCookies = array_keys($request->cookies->all());
    foreach ($allCookies as $cookieName) {
        if (str_starts_with($cookieName, 'remember_web_')) {
            $cookiesToClear[] = $cookieName;
        }
    }

    \Log::debug('Clearing specific cookies:', $cookiesToClear);

    // Очищаем всеми способами для надежности
    foreach ($cookiesToClear as $cookieName) {
        // 1. Нативный PHP
        setcookie($cookieName, '', time() - 3600, '/');
        setcookie($cookieName, '', time() - 3600, '/', '', false, true);
        
        // 2. Laravel
        Cookie::queue(Cookie::forget($cookieName));
    }

    $response = redirect('/');
    
    foreach ($cookiesToClear as $cookieName) {
        // 3. Через response headers
        $response->headers->clearCookie($cookieName, '/', '', false, true);
    }

    \Log::debug('Safe cookie cleanup completed');
    
    return $response;
})->name('logout');
*/

Route::match(['get', 'post'], '/logout', function () {
    Auth::logout();
    return redirect('/');
})->name('logout');

/* Route::match(['get', 'post'], '/logout', function (Request $request) {
    \Log::debug('=== SIMPLIFIED COOKIE CLEANUP ===');
    
    $user = Auth::user();
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    // Только критические куки
    $cookiesToClear = [
        'XSRF-TOKEN', 
        'login_redirect',
        'zonefloorballru_session',
    ];
    
    // Добавляем remember_web с хешем
    $allCookies = array_keys($request->cookies->all());
    foreach ($allCookies as $cookieName) {
        if (str_starts_with($cookieName, 'remember_web_')) {
            $cookiesToClear[] = $cookieName;
        }
    }

    \Log::debug('Clearing cookies count:', ['count' => count($cookiesToClear)]);
    
    // Только ОДИН способ очистки
    $response = redirect('/');
    foreach ($cookiesToClear as $cookieName) {
        $response->headers->clearCookie($cookieName);   // clearCookie() в Laravel делает именно то, что мы хотели - он отправляет браузеру заголовок с установкой времени истечения куки в прошлое:
    }

    // Триггерим событие для фронтенда
    // $response->withCookie(cookie('session_updated', time(), 0));
    $response->withCookie(cookie('force_client_refresh', 'logout', 0, '/', '', false, false));

    \Log::debug('Logout completed', ['user_id' => $user->id ?? null]);
    \Log::debug('Simplified cleanup completed');
    
    return $response;
})->name('logout');/*

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

    // Обновление предзаказа (сохранение в БД)
    Route::match(['GET', 'POST'], '/preorder/items', [PreorderController::class, 'update']);
    // Route::post('/preorder/items', [PreorderController::class, 'store']);   // The GET method is not supported for route preorder/items. Supported methods: POST.

    // Удаление товара из предзаказа (сохранение в БД)
    Route::delete('/preorder/items', [PreorderController::class, 'delete']);

    // Синхронизация данных при авторизации
    Route::match(['GET', 'POST'], '/user/sync', [AuthSyncController::class, 'syncLocalData']);

    Route::post('/recently-viewed', [RecentlyViewedController::class, 'store'])->middleware('api');
});

// Маршруты для Inertia.js
Route::match(['get', 'post'], '/', [IndexReactController::class, 'index'])->name('home');
Route::match(['get', 'post'], '/products/cart', [CartController::class, 'index']);                                              // Обычная корзина
Route::match(['get', 'post'], '/products/preorder', [PreorderController::class, 'index'])->middleware(['auth', 'verified']);    // Предзаказы
Route::match(['get', 'post'], '/products/{category?}', [ProductController::class, 'index']);
Route::match(['get', 'post'], '/products/card/{prodUrlSemantic}', [ProductCardController::class, 'index']);
Route::match(['get', 'post'], '/products/basket', [BasketController::class, 'show']);
Route::match(['get', 'post'], '/orders', [PackageController::class, 'show']);

Route::match(['get', 'post'], '/profile', [ProfileController::class, 'index'])->middleware(['auth', 'verified'])->name('profile');

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

// Маршрут для генерации карты сайта:
Route::get('/generate-sitemap', [SiteMapXmlController::class, 'generate']);

// Маршрут для HTML-карты сайта:
Route::get('/sitemap', [SiteMapController::class, 'index']);

// XML-версия
Route::get('/sitemap.xml', function() {
    return response()->file(public_path('sitemap.xml'))->header('Content-Type', 'text/xml');
});

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

Route::get('/invoice/{order:access_hash}', [OrderController::class, 'showInvoice'])                         // {order:access_hash} автоматически ищет заказ по хешу.
    ->name('order.invoice');

// Отслеживание заказа (публичная)
Route::get('/order/track/{order:access_hash}', [OrderController::class, 'trackOrder'])                      // {order:access_hash} автоматически ищет заказ по хешу.
    ->name('order.track');

// Отслеживание заказа (приватная, для авторизованных пользователей)
Route::get('/profile/track/order/{order:access_hash}', [OrderController::class, 'trackPrivateOrder'])       // {order:access_hash} автоматически ищет заказ по хешу.
    ->middleware(['auth', 'verified'])
    ->name('privateorder.track');

// Обзор заказов клиента
Route::get('/profile/orders', [OrderController::class, 'getOrders'])
    ->middleware(['auth', 'verified'])
    ->name('profile.orders');

// Роуты для админки
Route::prefix('admin')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    
    Route::get('/products-table', [AdminProductsController::class, 'index'])->name('admin.products.table');

    Route::get('/products/sticks/add', function () {
        return Inertia::render('AdminProductsSticksAdd');
    })->name('admin.products.sticks.add');

    // Используем POST для обновления одного значения (patch работает некорректно)
    Route::post('/stock-manual/{productId}', [AdminStockController::class, 'manualUpdate'])->name('admin.stocks.manual.update');
    // Страница с формой, которой реально нет
    Route::get('/stock-manual', [AdminStockController::class, 'manual'])->name('admin.stocks.manual');

    // Страница с формой, которой реально нет
    Route::get('/orders', [AdminOrderController::class, 'index'])->name('admin.orders');

    // Используем POST для обновления одного значения (patch работает некорректно)
    Route::post('/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('admin.orders.status.update');
    Route::post('/orders/{order}/update-order-track', [AdminOrderController::class, 'updateTrackNumber'])->name('admin.orders.tracknum.update');
    
    Route::post('/products/{product}/update-prices', [AdminProductPriceController::class, 'updatePrices']);
    Route::post('/products/{product}/update-status', [AdminProductsController::class, 'updateStatus']);
    
    Route::get('/documents', [AdminDocumentController::class, 'index'])->name('admin.documents.index');
    Route::get('/documents/create', [AdminDocumentController::class, 'create'])->name('admin.documents.create');
    Route::post('/documents', [AdminDocumentController::class, 'store'])->name('admin.documents.store');
    Route::get('/documents/{document}', [AdminDocumentController::class, 'show'])->name('admin.documents.show');

    // Другие админ-роуты...
});

// Отображение документов пользователям
Route::get('/legal/{type}', [LegalController::class, 'show'])
    ->name('legal.show')
    ->where('type', 'privacy-policy|offer');

Route::post('/api/payments/robokassa/result', [PaymentController::class, 'handleResult']);
Route::post('/orders/success', [OrderController::class, 'showSuccess']);
Route::post('/orders/failed', [OrderController::class, 'showFailed']);

// временный роут для теста очтётов для ошибок
Route::get('/test-error', function() {
    try {
        throw new \Exception('Это тестовая ошибка для проверки нотификации!');
    } catch (\Throwable $e) {
        App\Services\ErrorNotifierService::notifyAdmin($e, [
            'test' => true,
            'comment' => 'Это тестовое уведомление, можно игнорировать'
        ]);
        return "Тестовое уведомление отправлено!";
    }
});

Route::get('/test-media-upload', function () {
    // Создаем тестовый отзыв
    $review = \App\Models\Review::first();
    
    if (!$review) {
        return 'Сначала создайте тестовый отзыв';
    }

    return view('test-media-upload', compact('review'));
});

Route::post('/test-media-upload', function (\Illuminate\Http\Request $request) {
    $review = \App\Models\Review::find($request->review_id);
    
    try {
        $mediaService = app(\App\Services\MediaService::class);
        $uploadedMedia = $mediaService->processReviewMedia(
            $review, 
            $request->file('media', [])
        );

        return response()->json([
            'success' => true,
            'message' => 'Файлы успешно загружены',
            'media' => $uploadedMedia,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Ошибка: ' . $e->getMessage(),
        ], 500);
    }
});

// Роут для запроса обратного звонка:
Route::post('/callback-request', [CallbackController::class, 'store'])->name('callback.store');