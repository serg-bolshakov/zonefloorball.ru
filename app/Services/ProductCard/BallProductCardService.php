<?php
// app/Services/ProductCard/BallProductCardService.php
namespace App\Services\ProductCard;

use Illuminate\Database\Eloquent\Builder;               // Builder в Laravel - это реализация шаблона "строитель" (Builder pattern), который позволяет постепенно строить SQL-запрос, добавляя к нему условия.
use Illuminate\Support\Facades\DB;
use App\Models\Product;

class BallProductCardService extends BaseProductCardService
{
    
    public function getSimilarProps() {
    
        $currentProduct = $this->product;
        
        // выбираем крюки цветов, отличных от текущего:
        $otherProductsForCard =  DB::table('products')
            ->select('category_id', 'prod_url_semantic', 'colour', 'model', 'img_main', 'img_link')
            ->join('images', 'images.product_id', '=', 'products.id') 
            ->where('products.category_id', '=', $currentProduct->category_id) 
            ->where('products.model', 'LIKE', $currentProduct->model)
            ->where('products.colour', 'NOT LIKE', $currentProduct->colour)
            ->where('images.img_main', '=', '1')
            ->distinct()
            ->get();
        
        $resultOtherProductsForCard['classComponent'] = 'colour';
        $resultOtherProductsForCard['choiceComment'] = '';                  
        $resultOtherProductsForCard['products'] = $otherProductsForCard;
        $resultOtherProductsForCard['href'] = true;
        
        return $resultOtherProductsForCard;
    }    
}