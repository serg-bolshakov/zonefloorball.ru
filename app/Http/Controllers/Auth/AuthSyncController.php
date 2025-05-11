<?php
// app/Http/Controllers/Auth/AuthSyncController
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class AuthSyncController extends Controller {

    public function __construct() {
        $this->middleware('auth'); // 'auth' для сессий
    }

    public function syncLocalData(Request $request)  {
        $validated = $request->validate([
            'favorites'         => ['sometimes', 'array'],
            'favorites.*'       => ['integer', 'exists:products,id'], // Валидация ID товаров
            'cart'              => ['sometimes', 'array'],
            'recently_viewed'   => ['sometimes', 'array'],
        ]);

        try {
            $user = $request->user();
            
            return response()->json([
                'favorites' => $this->syncFavorites($user, $validated['favorites'] ?? []),
                'cart'      => $this->syncCart($user, $validated['cart'] ?? []),
                // Другие данные...
            ]);

        } catch (\Exception $e) {
            Log::error('Sync error: '.$e->getMessage());
            return response()->json(['error' => 'Sync failed'], 500);
        }
    }

    protected function syncFavorites(User $user, array $localFavorites): array {
        
        $dbFavorites = json_decode($user->favorites->product_ids ?? '[]', true);
        $merged = array_unique(array_merge($dbFavorites, $localFavorites));
        
        $user->favorites()->updateOrCreate(
            ['user_id' => $user->id],
            ['product_ids' => $merged]
        );

        return $merged;
    }

    protected function syncCart(User $user, array $localCart): array
    {
        // Аналогичная логика для корзины
        // Можно добавить проверку наличия товаров
    }
    
}