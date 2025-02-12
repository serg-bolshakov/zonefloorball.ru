<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB; // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды
use App\Models\Product;
use App\Models\Property;

class CardController extends Controller
{    
    public function index($prodUrlSemantic) {

        $prodInfo = Product::with(['actualPrice', 'regularPrice', 'category', 'brand', 'size', 'properties', 
        'productMainImage', 'productCardImgOrients', 'actualPrice', 'regularPrice', 'productShowCaseImage', 
        'properties'])->where('prod_url_semantic', $prodUrlSemantic)->first();
        
        if($prodInfo['actualPrice']->price_value < $prodInfo['regularPrice']->price_value) {
            $prodInfo['price_special'] = $prodInfo['actualPrice']->price_value;
        } else {
            $prodInfo['price_special'] = null;
        }
        
        //dd($prodInfo);
        
        return view('components.product-card.layout', [
            'title' => $prodInfo->tag_title,
            'robots' => 'INDEX,FOLLOW',
            'description' => $prodInfo->meta_name_description,
            'keywords' => $prodInfo->meta_name_keywords,
            'prodInfo' => $prodInfo,
        ]);
    }
}
