<?php
// app/Http/Controllers/Auth/AuthSyncController
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB; 

use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Favorite;
use App\Models\RecentlyViewedProduct;
use Illuminate\Support\Carbon; 
use App\Models\Cart;
use App\Models\Product;

class AuthSyncController extends Controller {

    public function syncLocalData(Request $request)  {

        $user = Auth::user() ?? null;
        // $localRecentlyViewed = $request->input('recentlyViewedProducts', []); // { "33": 1747389626452, ... }
        
        $validated = $request->validate([
            'favorites'                 => ['sometimes', 'array'],
            /*'favorites.*' => [                                                // Валидация ID товаров - подумать! В этом случае выдаёт ошибку: SQLSTATE[42S22]: Column not found: 1054 Unknown column 'is_active' in 'where clause' (Connection: mysql, SQL: select count(*) as aggregate from `products` where `id` = 2 and (`is_active` = 1))
                // может добавить в таблицу products is_active и убрать таблицу product_statuses (два значения: active, archieved) - надо подумать...
                'integer',
                Rule::exists('products', 'id')->where(function ($query) {
                    $query->where('is_active', true);
                })
            ],*/
            'favorites.*'               => ['integer', 'exists:products,id'],   // Валидация ID товаров 
            'cart'                      => ['sometimes', 'array'],
            'recentlyViewedProducts'    => ['sometimes', 'array'],
        ]);

        try {                        
            return response()->json([
                'favorites' => $this->syncFavorites($user, $validated['favorites'] ?? []),
                'cart'      => $this->syncCart($user, $validated['cart'] ?? [])['cart'],
                'recentlyViewedProducts' => $this->syncRecentlyViewed($user, $validated['recentlyViewedProducts'] ?? []),
                'cart_changes' => $this->syncCart($user, $validated['cart'] ?? []),
            ]);

        } catch (\Exception $e) {
            Log::error('Sync error: '.$e->getMessage());
            return response()->json(['error' => 'Sync failed'], 500);
        }
    }

    protected function syncFavorites(User $user, array $localFavorites): array {

        /*\Log::debug('AuthSyncController syncFavorites', [
            '$localFavorites' => $localFavorites,
        ]);*/
        // Получаем или создаём запись
        $favorites = $user->favorites()->firstOrNew();

        /*\Log::debug('AuthSyncController syncFavorites', [
            '$favorites' => $favorites,
        ]);*/

        // Всегда получаем массив (явное преобразование)
        // $currentIds = json_decode($favorites->product_ids ?? '[]', true) ?? [];

        // Защищённое получение массива
        $currentIds = $this->safeJsonDecode($favorites->product_ids);

        /*try {
            $currentIds = json_decode($favorites->product_ids ?? '[]', true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            $currentIds = [];
            Log::error("Invalid JSON in favorites for user {$user->id}");
        }*/
        
        // Сливаем и удаляем дубликаты
        $merged = array_unique(array_merge($currentIds, $localFavorites));
        
        // Сохраняем как JSON
        $user->favorites()->updateOrCreate(
            ['user_id' => $user->id],
            ['product_ids' => json_encode(array_values($merged))]
        );


        /*// $dbFavorites = json_decode($user->favorites->product_ids ?? '[]', true);
            // Явная загрузка отношения
            $user->load('favorites');

            // Получаем текущие данные (уже декодированные благодаря $casts)
            $dbFavorites = $user->favorites->product_ids ?? [];
            
            //$merged = array_values(array_unique(array_merge($dbFavorites, $localFavorites)));
            // $merged = array_unique([...$dbFavorites, ...$localFavorites]);

            // Сливаем массивы
            $merged = array_values(array_unique(array_merge($dbFavorites, $localFavorites)));

            \Log::debug('syncFavorites:', [
                '$localFavorites' => $localFavorites,
                '$dbFavorites' => $dbFavorites,
                '$merged' => $merged,
            ]);

            // Сохраняем через query builder
            DB::table('favorites')->updateOrInsert(
                ['user_id' => $user->id],
                ['product_ids' => json_encode($merged)]
            );
            
            \Log::debug('DB write verification', [
                'user_id' => $user->id,
                'input' => $localFavorites,
                '$dbFavorites' => $dbFavorites,
                'merged' => $merged,
                'saved' => DB::table('favorites')
                    ->where('user_id', $user->id)
                    ->value('product_ids')
        ]);*/

        /*// Пошаговая логика без магии Eloquent
            try {
                // 1. Проверяем существование записи
                $exists = DB::table('favorites')
                    ->where('user_id', $user->id)
                    ->exists();

                // 2. Простое сохранение без updateOrCreate
                if ($exists) {
                    \Log::debug('syncFavorites $exists:', [
                        '$exists' => $exists,
                    ]);
                    DB::table('favorites')
                        ->where('user_id', $user->id)
                        ->update([
                            'product_ids' => json_encode($merged),
                            // 'updated_at' => DB::raw('NOW()')
                        ]);
                } else {
                    \Log::debug('syncFavorites $NOTexists:', [
                        '$exists' => 'notexist',
                    ]);
                    DB::table('favorites')->insert([
                        'user_id' => $user->id,
                        'product_ids' => json_encode($merged),
                        // 'created_at' => DB::raw('NOW()'),
                        // 'updated_at' => DB::raw('NOW()')
                    ]);
                }
            } catch (\Exception $e) {
                logger()->error('Favorites save failed', [
                    'error' => $e->getMessage(),
                    'user_id' => $user->id
                ]);
                throw $e;
            } */

        return $merged;
    }

    protected function syncCart(User $user, array $localCart): array {      // ожидаем: { [productId]: quantity } — это один объект вида { 84: 1, 89: 2 }
        
        // 1. Подготовка данных
        $result = [
            'cart' => [],
            'sold_out' => [],
            'new_arrivals' => [],
            'quantity_changes' => []
        ];

        // \Log::debug('SyncCart data', ['$result begin' => $result]);

        // 2. Загрузка данных: получаем все необходимые данные за 2 запроса
        $existingItems = Cart::where('user_id', $user->id)
            ->get()
            ->keyBy('product_id');
            // метод >keyBy преобразует коллекцию в ассоциативный массив, где:Ключ = значение поля product_id, Значение = вся модель Cart
            /* Допустим, в БД есть записи:
                
                php
                [
                    ['user_id' => 1, 'product_id' => 13, 'quantity' => 6],
                    ['user_id' => 1, 'product_id' => 25, 'quantity' => 2]
                ]
                После keyBy('product_id') получим:

                php
                [
                    13 => ['user_id' => 1, 'product_id' => 13, 'quantity' => 6],
                    25 => ['user_id' => 1, 'product_id' => 25, 'quantity' => 2]
                ]

                Зачем это нужно?
                Чтобы быстро искать записи по product_id без перебора всей коллекции:

                php
                $existingItems->get(13); // Вернёт запись с product_id=13

            */

        // \Log::debug('SyncCart step 2', ['$existingItems' => $existingItems]);

        $productIds = array_unique(array_merge(             // получаем синхронизированный массив id-товаров корзины покупателей     
            array_keys($localCart),
            $existingItems->keys()->toArray()
        ));

        // \Log::debug('SyncCart step 2', ['$productIds' => $productIds]);

        /*$products = Product::with('productReport')
            ->whereIn('id', $productIds)
            // ->select('id')                                                                  // Оптимизация - берём только ID? - проверить, что подключются отчёты!
            ->get()
            ->keyBy('id');*/

        $products = Product::select('id') // Берём только ID товара
            ->with(['productReport' => function ($query) {
                $query->select('product_id', 'on_sale'); // Только нужные поля связи
            }])
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        // \Log::debug('SyncCart step 2', ['$products' => $products]);

        /*// 3. Обработка локальных данных
        foreach ($localCart as $productId => $quantity) {
            if (!isset($products[$productId])) continue;

            $product = $products[$productId];
            $onSale = $product->productReport?->on_sale ?? 0;

            if ($onSale >= $quantity) {
                $result['cart'][$productId] = $quantity;
            } elseif ($onSale > 0) {
                $result['cart'][$productId] = $onSale;
                $result['quantity_changes'][$productId] = $quantity;
            } else {
                // $result['sold_out'][] = $productId;
                $result['sold_out'][$productId] = $quantity;        // сохраняем сколько единиц товаров было у товарища в корзине
            }
        }

        // 4. Обработка существующих записей
        foreach ($existingItems as $productId => $cartItem) {
            if (!isset($products[$productId])) continue;

            $product = $products[$productId];                   // смотрим актуальные состояния товара, с которым сравниваем итерируемый товар корзины покупателя в БД
            $onSale = $product->productReport?->on_sale ?? 0;   // реальное состояние товара для продажи
            $quantity = $cartItem->quantity;                    // количество товара в БД в корзине покупателя

            if ($onSale >= $quantity) {
                if ($cartItem->deleted_at) {
                    $result['new_arrivals'][] = $productId;     // подумать: может лучше: $result['new_arrivals'][$productId] = $quantity
                }
                $result['cart'][$productId] = max($result['cart'][$productId] ?? 0, $quantity);
            } elseif ($onSale > 0) {
                if ($cartItem->deleted_at) {
                    $result['new_arrivals'][] = $productId;     // подумать: может лучше: $result['new_arrivals'][$productId] = $quantity
                }
                $result['cart'][$productId] = max($result['cart'][$productId] ?? 0, $onSale);
                $result['quantity_changes'][$productId] = $quantity;
            } else {
                // if ($cartItem->deleted_at) {
                if (!$cartItem->deleted_at) {
                    $result['sold_out'][$productId] = $quantity;
                }
            }
        }*/

        // 3. Обработка
        foreach ($products as $productId => $product) {
            $onSale = $product->productReport?->on_sale ?? 0;
            $localQty = $localCart[$productId] ?? 0;
            $dbQty = $existingItems[$productId]->quantity ?? 0;
            $maxQty = max($localQty, $dbQty);

            if ($onSale <= 0) {
                if ($dbQty > 0) $result['sold_out'][$productId] = $dbQty;
                continue;
            }

            $finalQty = min($maxQty, $onSale);
            $result['cart'][$productId] = $finalQty;

            if ($existingItems[$productId]->deleted_at ?? false) {
                $result['new_arrivals'][] = $productId;
            }

            if ($finalQty != $maxQty) {
                $result['quantity_changes'][$productId] = $maxQty;
            }
        }

        // \Log::debug('SyncCart step 3', ['$productIds' => 'sucsess']);

        
        // 5. Сохранение в БД (4. Обновление корзины)
        DB::transaction(function () use ($user, $result) {

            // Мягко удаляем товар из корзины покупок пользователя в БД, если товар закончился в продаже:
            Cart::where('user_id', $user->id)
                ->whereIn('product_id', array_keys($result['sold_out']))
                ->update(['deleted_at' => now()]);

            /*// Обновляем/добавляем актуальные
            foreach ($result['cart'] as $productId => $quantity) {
                Cart::updateOrCreate(
                    ['user_id' => $user->id, 'product_id' => $productId],
                    ['quantity' => $quantity, 'deleted_at' => null]
                );
            }*/

            Cart::upsert(
                collect($result['cart'])->map(function ($qty, $productId) use ($user) {
                    return [
                        'user_id' => $user->id,
                        'product_id' => $productId,
                        'quantity' => $qty,
                        'deleted_at' => null,
                        'updated_at' => now()
                    ];
                })->values()->toArray(),
                ['user_id', 'product_id'],
                ['quantity', 'deleted_at', 'updated_at']
            );
        });

        // \Log::debug('SyncCart final', ['$result' => $result]);

        return $result;
    }

    protected function syncRecentlyViewed(User $user, array $localRecentlyViewed): array {
        
        /*\Log::debug('AuthSyncController syncRecentlyViewed', [
            '$localRecentlyViewed' => $localRecentlyViewed,
            'user_id' => $user->id,
        ]);*/
        
        // 1. Конвертируем локальные данные в формат [product_id => viewed_at]
        $localItems = collect($localRecentlyViewed)
            ->map(fn ($ts, $productId) => [                         // В Laravel коллекциях map() всегда передаёт значение первым аргументом, а ключ — вторым.
                'product_id' => $productId,
                'viewed_at' => Carbon::createFromTimestampMs($ts)
            ]);

        // 2. Получаем существующие записи из БД
        $existingItems = RecentlyViewedProduct::where('user_id', $user->id)
            ->get()
            ->keyBy('product_id');      // метод преобразует коллекцию в ассоциативный массив, где:Ключ = значение поля product_id, Значение = вся модель RecentlyViewedProduct
            /* Допустим, в БД есть записи:
                
                php
                [
                    ['user_id' => 1, 'product_id' => 13, 'viewed_at' => '2025-05-17'],
                    ['user_id' => 1, 'product_id' => 25, 'viewed_at' => '2025-05-18']
                ]
                После keyBy('product_id') получим:

                php
                [
                    13 => ['user_id' => 1, 'product_id' => 13, 'viewed_at' => '2025-05-17'],
                    25 => ['user_id' => 1, 'product_id' => 25, 'viewed_at' => '2025-05-18']
                ]

                Зачем это нужно?
                Чтобы быстро искать записи по product_id без перебора всей коллекции:

                php
                $existingItems->get(13); // Вернёт запись с product_id=13

            */

        // 3. Объединяем данные, обновляя существующие
        foreach ($localItems as $item) {
            RecentlyViewedProduct::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'product_id' => $item['product_id']
                ],
                [
                    'viewed_at' => $item['viewed_at']
                ]
            );
        }

        // 4. Возвращаем актуальные данные (уже без дублей)
        return RecentlyViewedProduct::where('user_id', $user->id)
            ->orderByDesc('viewed_at')
            ->limit(6)
            ->get()
            ->mapWithKeys(fn ($item) => [$item->product_id => $item->viewed_at->getTimestampMs()])  // Этот метод преобразует коллекцию в ассоциативный массив, задавая свои ключи и значения.
            ->toArray();
        /*  $item — модель RecentlyViewedProduct.
            Ключ = product_id (например, 13).
            Значение = timestamp из viewed_at (например, 1715954321000).

            Результат: php
            [
                13 => 1715954321000,
                25 => 1715954382000
            ]
            Зачем это нужно?
            Чтобы фронтенд получил данные в том же формате, что и localStorage ({product_id: timestamp}).*/
        
        }

    // Защищённое получение массива
    private function safeJsonDecode(?string $json): array {
        if (empty($json)) {
            return [];
        }
        
        // Удаляем лишние экранированные кавычки
        $cleaned = stripslashes(trim($json, '"'));
        
        try {
            return json_decode($cleaned, true, 512, JSON_THROW_ON_ERROR) ?? [];
        } catch (\JsonException $e) {
            Log::error("JSON decode error: " . $e->getMessage());
            return [];
        }
    }
}