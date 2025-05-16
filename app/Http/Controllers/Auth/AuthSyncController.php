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

class AuthSyncController extends Controller {

    public function syncLocalData(Request $request)  {

        $user = Auth::user() ?? null;
        
        \Log::debug('AuthSyncController:', [
            '$request' => $request->all(),
            '$user' => $user,
        ]);

        $validated = $request->validate([
            'favorites'         => ['sometimes', 'array'],
            /*'favorites.*' => [                                      // Валидация ID товаров - подумать! В этом случае выдаёт ошибку: SQLSTATE[42S22]: Column not found: 1054 Unknown column 'is_active' in 'where clause' (Connection: mysql, SQL: select count(*) as aggregate from `products` where `id` = 2 and (`is_active` = 1))
                // может добавить в таблицу products is_active и убрать таблицу product_statuses (два значения: active, archieved) - надо подумать...
                'integer',
                Rule::exists('products', 'id')->where(function ($query) {
                    $query->where('is_active', true);
                })
            ],*/
            'favorites.*'               => ['integer', 'exists:products,id'], // Валидация ID товаров 
            'cart'                      => ['sometimes', 'array'],
            'recentlyViewedProducts'    => ['sometimes', 'array'],
        ]);

        \Log::debug('User favorites check', [
            'user_id' => $user->id,
            'favorites_exists' => Favorite::where('user_id', $user->id)->exists(),
            'current_data' => Favorite::where('user_id', $user->id)->first()?->product_ids,
            'current_data_type' => gettype(Favorite::where('user_id', $user->id)->first()?->product_ids),
            '$validated' => $validated,
            '$validated[favorites]_type' => gettype($validated['favorites']),
        ]);

        try {                        
            return response()->json([
                'favorites' => $this->syncFavorites($user, $validated['favorites'] ?? []),
                // 'cart'      => $this->syncCart($user, $validated['cart'] ?? []),
                // Другие данные...
            ]);

        } catch (\Exception $e) {
            Log::error('Sync error: '.$e->getMessage());
            return response()->json(['error' => 'Sync failed'], 500);
        }
    }

    protected function syncFavorites(User $user, array $localFavorites): array {

        // Получаем или создаём запись
        $favorites = $user->favorites()->firstOrNew();

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

    protected function syncCart(User $user, array $localCart): array {
        // Аналогичная логика для корзины
        // Можно добавить проверку наличия товаров
    }

    protected function syncRecentlyViewed(User $user, array $localRecentlyViewed): array {
        // Аналогичная логика для корзины
        // Можно добавить проверку наличия товаров
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