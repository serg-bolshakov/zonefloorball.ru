<?php

namespace App\Http\Controllers;
use App\Models\Product;

class CardController extends Controller
{    
    public function index($prodUrlSemantic) {
        $responseData = $this->getResponseData($prodUrlSemantic);
        return Inertia::render('ProductCard', $responseData);
    }
        
    protected function getResponseData($prodUrlSemantic) {
        $prodInfo = Product::with(['actualPrice', 'regularPrice', 'category', 'brand', 'size', 'properties', 
        'productMainImage', 'productCardImgOrients', 'actualPrice', 'regularPrice', 'productShowCaseImage', 
        'properties'])->where('prod_url_semantic', $prodUrlSemantic)->first();
        
        if($prodInfo['actualPrice']->price_value < $prodInfo['regularPrice']->price_value) {
            $prodInfo['price_special'] = $prodInfo['actualPrice']->price_value;
        } else {
            $prodInfo['price_special'] = null;
        }
        
        $responseData = [
            'title' => $prodInfo->tag_title,
            'robots' => 'INDEX,FOLLOW',
            'description' => $prodInfo->meta_name_description,
            'keywords' => $prodInfo->meta_name_keywords,
            'prodInfo' => $prodInfo,
        ];

        //dd($responseData['prodInfo']);
    }
}
