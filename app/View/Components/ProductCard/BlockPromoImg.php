<?php

namespace App\View\Components\ProductCard;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;
use App\Models\Product;
use App\Models\Image;
use App\Models\Category;

use Illuminate\Support\Facades\DB;  // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды
use App\Traits\FilterTrait;

class BlockPromoImg extends Component
{   

    use FilterTrait;

    public function __construct()
    {
        //
    }

    public function getresult() {
        
        $prodUrlSemantic = $this->getSlug();  

        $product = Product::select('id', 'category_id','model', 'marka')->where('prod_url_semantic', $prodUrlSemantic)->where('product_status_id', '<>', '2')->first();
        $data['product'] = $product;

        $imgs = Image::select('img_link')->where('product_id', $product->id)->where('img_promo', '1')->get();
        $data['img_link'] = $imgs;

        $category = Category::where('id', $product->category_id)->first('category')->category;
        $data['category'] = $category;
        
        foreach($data['img_link'] as $link) {
            //dd($link['img_link']);
        }
        
        
        return $data;
        
    } 
    

    public function render(): View|Closure|string
    {
        $data = $this->getresult();
        //dd($data);
        return view('components.product-card.block-promo-img', [
            'data' => $data,
        ]);

    }
}