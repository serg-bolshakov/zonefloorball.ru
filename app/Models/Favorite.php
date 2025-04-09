<?php
// app/Models/Favorite.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favorite extends Model {
    use HasFactory;

    /* JSON-строка избранного принадлежит одному юзеру */
    public function users() {
        return $this->belongsTo(User::class);
        // return $this->belongsTo(User::class, 'id');
    }

    // Методы для работы с избранным:
    public function getProductsAttribute() {
        return Product::whereIn('id', $this->product_ids ?: [])->get();
    }

    public function addProduct(int $productId) {
        $ids = $this->product_ids ?: [];
        if (!in_array($productId, $ids)) {
            $ids[] = $productId;
            $this->product_ids = $ids;
            $this->save();
        }
    }

}