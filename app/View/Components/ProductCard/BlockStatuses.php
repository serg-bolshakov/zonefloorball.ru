<?php

namespace App\View\Components\ProductCard;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;
use App\Models\Product;

use Illuminate\Support\Facades\DB;  // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды
use App\Traits\FilterTrait;

class BlockStatuses extends Component
{   

    use FilterTrait;

    public function __construct()
    {
        //
    }

    public function getProductStatuses() {
        
        $prodUrlSemantic = $this->getSlug();    
        $product = Product::with(['actualPrice', 'regularPrice', 'productReport', 'productUnit', 'productMainImage'])->where('prod_url_semantic', $prodUrlSemantic)->where('product_status_id', '<>', '2')->first();

        if((int)$product['productUnit']->id == 2) { 
            if($product['productReport']->on_sale % 10 == 1 && (int)$product['productReport']->on_sale != 11) {
                $product['productUnit']->unit_prod_value_view = $product['productUnit']->unit_prod_value_view . 'а';
            } elseif((($product['productReport']->on_sale % 10 == 2 && (int)($product['productReport']->on_sale != 12)) || ($product['productReport']->on_sale % 10 == 3 && (int)($product['productReport']->on_sale != 13) || ($product['productReport']->on_sale % 10 == 4) && (int)$product['productReport']->on_sale != 14))) {
                $product['productUnit']->unit_prod_value_view = $product['productUnit']->unit_prod_value_view . 'ы';
            }

            if($product['productReport']->reserved % 10 == 1 && (int)$product['productReport']->reserved != 11) {
                $product['reservedProductUnitValueView'] = $product['productUnit']->unit_prod_value_view . 'а';
            } elseif((($product['productReport']->reserved % 10 == 2 && (int)($product['productReport']->reserved != 12)) || ($product['productReport']->reserved % 10 == 3 && (int)($product['productReport']->reserved != 13) || ($product['productReport']->reserved % 10 == 4) && (int)$product['productReport']->reserved != 14))) {
                $product['reservedProductUnitValueView'] = $product['productUnit']->unit_prod_value_view . 'ы';
            }
        } 

        if(!empty($product)) {
            return $product;
        } else {
            return [];
        }  
        
    } 
    

    public function render(): View|Closure|string
    {
        $data = $this->getProductStatuses();
        //dd($data);
        return view('components.product-card.block-statuses', [
            'data' => $data,
        ]);

    }
}