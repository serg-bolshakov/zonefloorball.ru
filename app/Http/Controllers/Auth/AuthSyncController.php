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

class AuthSyncController extends Controller {

    public function syncLocalData(Request $request)  {

        $user = Auth::user() ?? null;
        
        \Log::debug('AuthSyncController:', [
            '$request' => $request->all(),
            '$user' => $user,
        ]);

        $validated = $request->validate([
            'favorites'         => ['sometimes', 'array'],
            'favorites.*'       => ['integer', 'exists:products,id'], // Валидация ID товаров
            'cart'              => ['sometimes', 'array'],
            'recently_viewed'   => ['sometimes', 'array'],
        ]);

        \Log::debug('User favorites check', [
            'user_id' => $user->id,
            'favorites_exists' => Favorite::where('user_id', $user->id)->exists(),
            'current_data' => Favorite::where('user_id', $user->id)->first()?->product_ids,
            '$validated' => $validated,
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

        // Получаем или создаём модель избранного
        $favorites = $user->favorites()->firstOrNew();
        // Берём product_ids как массив
        $currentIds = $favorites->product_ids ?? [];
        
        // Сливаем массивы
        $merged = array_unique(array_merge($currentIds, $localFavorites));

        // Для отладки (убедимся, что типы правильные)
        \Log::debug('syncFavorites debug', [
            'currentIds_type' => gettype($currentIds),
            'currentIds_content' => $currentIds,
            'localFavorites' => $localFavorites,
            'merged_result' => $merged
        ]);
        
        // Сохраняем
        $user->favorites()->updateOrCreate(
            ['user_id' => $user->id],
            ['product_ids' => $merged] // Автоматическая конвертация
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

    protected function syncCart(User $user, array $localCart): array
    {
        // Аналогичная логика для корзины
        // Можно добавить проверку наличия товаров
    }
    
}