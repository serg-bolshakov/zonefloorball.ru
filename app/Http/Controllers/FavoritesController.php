<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request; 
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\ProductCollection;
use Inertia\Inertia;
use App\Models\Favorite;
use App\Models\Product;
use App\Models\User;

class FavoritesController extends Controller {

    public function index(Request $request) {

        \Log::debug('FavoritesController Index: Session Check', [
            'request' => $request->all(),
            'user' => Auth::user(),
        ]);

        $favoritesIds = json_decode(Auth::user()?->favorites?->product_ids, true) 
         ?? json_decode($request->cookie('favorites', '[]'));

        $products = Product::with(['actualPrice', 'regularPrice', 'productReport', 'productShowCaseImage'])
            ->where('product_status_id', '=', 1)
            ->whereIn('id', $favoritesIds)
            ->get();   

        try {
            return Inertia::render('FavoritesPage', [
                    'title' => 'Избранное',
                    'robots' => 'NOINDEX,NOFOLLOW',
                    'description' => '',
                    'keywords' => '',
                    // 'products' => new ProductCollection($products), 
                ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Ошибка загрузки данных в FavoritesController',
                'details' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function update(Request $request) {
        \Log::debug('FavoritesController:', [
            'data' => $request->all(),
        ]);
        
        $validated = $request->validate([
            'favorites' => 'required|array',
        ]);
        
        $user = Auth::user();


        if ($user) {
            // Сохраняем в БД для авторизованных
            $user->favorites()->updateOrCreate(
                ['user_id' => $user->id],
                ['product_ids' => json_encode($validated['favorites'])]
            );
        }
        
        // Возвращаем обновлённый список + куку для неавторизованных
        return response()
            ->json(['success' => true])
            ->cookie('favorites', json_encode($validated['favorites']), 60*24*30);
    
    }

    public function getProducts (Request $request) {
                
        try {
            $favoritesIds = $request->ids ?? json_decode(Auth::user()?->favorites->product_ids | []);
            $user = Auth::user();

            \Log::debug('User in FavoritesController getProducts', ['passed_user' => $user,]);

            $products = Product::with(['actualPrice', 'regularPrice', 'productReport', 'productShowCaseImage'])
            ->where('product_status_id', '=', 1)
            ->whereIn('id', $favoritesIds)
            ->get();   
        
            return  new ProductCollection($products);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Ошибка загрузки данных в FavoritesProductsApiController',
                'details' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }  
    }
    
}
