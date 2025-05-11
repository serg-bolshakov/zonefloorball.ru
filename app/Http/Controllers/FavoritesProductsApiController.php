<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request; 
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\ProductCollection;
use Inertia\Inertia;
use App\Models\Favorite;
use App\Models\Product;

class FavoritesProductsApiController extends Controller {

    public function index(Request $request) {
            
        try {
            $favoritesIds = json_decode(Auth::user()?->favorites->product_ids) ?? $request->ids;
            
            $products = Product::with(['actualPrice', 'regularPrice', 'productReport', 'productShowCaseImage'])
            ->where('product_status_id', '=', 1)
            ->whereIn('id', $favoritesIds)
            ->get();   
        
            /*\Log::debug('FavoritesProductsApiController:', [
                'method' => $request->method(),
                'data' => $request->all(),
                '$favoritesIds' => $favoritesIds,
                '$products' => $products,
            ]);*/
            
            return  new ProductCollection($products);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Ошибка загрузки данных в FavoritesProductsApiController',
                'details' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
 
}
