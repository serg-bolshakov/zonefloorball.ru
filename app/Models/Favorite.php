<?php
// app/Models/Favorite.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Services\DiscountService;

class Favorite extends Model {
    use HasFactory;

    protected $fillable = ['user_id', 'product_ids'];

    /* JSON-строка избранного принадлежит одному юзеру */
    public function user() {
        return $this->belongsTo(User::class);
        // return $this->belongsTo(User::class, 'id');
    }

    // Методы для работы с избранным:
    // public function getProductsAttribute() {
    //     return Product::whereIn('id', $this->product_ids ?: [])->get();
    // }

    public function addProduct(int $productId) {
        $ids = $this->product_ids ?: [];
        if (!in_array($productId, $ids)) {
            $ids[] = $productId;
            $this->product_ids = $ids;
            $this->save();
        }
    }

    // метод для получения товаров Избранного: - закомментировал! не очень удачный способ - можно где это требуется, просто запросить модель Product без лишних геморроев... 
    /*public static function getFavoritesProducts(array $productIds) {
        return Product::with([
            'actualPrice', 
            'regularPrice', 
            'productReport', 
            'productShowCaseImage'
            ])
            ->where('product_status_id', '=', 1)
            ->whereIn('id', $productIds)
        ->get();   
    }*/

}