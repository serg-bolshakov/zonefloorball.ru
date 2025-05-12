<?php
// app/Http/Controllers/Auth/AuthSyncController
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

use Illuminate\Support\Facades\Auth;
use App\Models\User;

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
            'current_data' => Favorite::where('user_id', $user->id)->first()?->product_ids
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

        $dbFavorites = json_decode($user->favorites->product_ids ?? '[]', true);
        $merged = array_values(array_unique(array_merge($dbFavorites, $localFavorites)));
        // $merged = array_unique([...$dbFavorites, ...$localFavorites]);
        \Log::debug('syncFavorites:', [
            '$localFavorites' => $localFavorites,
            '$dbFavorites' => $dbFavorites,
            '$merged' => $merged,
        ]);
        $user->favorites()->updateOrCreate(
            ['user_id' => $user->id],
            ['product_ids' => json_encode($merged)]
        );

        return $merged;
    }

    protected function syncCart(User $user, array $localCart): array
    {
        // Аналогичная логика для корзины
        // Можно добавить проверку наличия товаров
    }
    
}