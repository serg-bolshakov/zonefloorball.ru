<?php

namespace App\View\Components\ProductCard;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;
use App\Models\Product;

use Illuminate\Support\Facades\DB;  // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды
use App\Traits\FilterTrait;

class BlockPrice extends Component
{   

    use FilterTrait;

    public function __construct()
    {
        //
    }

    public function getProductPrices() {
        $data = [];

        $prodUrlSemantic = $this->getSlug();    
        $product = Product::with(['actualPrice', 'regularPrice', 'productReport'])->where('prod_url_semantic', $prodUrlSemantic)->where('product_status_id', '<>', '2')->first();
        $stock = $product['productReport']->in_stock;
        
        // если товар распродан или в архиве - блок не показываем только описание   
        if(!empty($product) && ($stock > 0)) {
            $data['actualPrice'] = $product['actualPrice'];
            $data['regularPrice'] = $product['regularPrice'];
        }
        
        return $data;
    } 
    

    public function render(): View|Closure|string
    {
        $productPrices = $this->getProductPrices();
        //dd($productPrices);        
        return view('components.product-card.block-price', [
            'productPrices' => $productPrices,
        ]);

    }
}