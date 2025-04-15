<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Product;
use App\Services\ProductCard\ProductCardServiceFactory;

class ProductCardController extends Controller
{    

    public function index($prodUrlSemantic) {

        $responseData = $this->getResponseData($prodUrlSemantic);
        // dd($responseData);
        return Inertia::render('ProductCard', $responseData);
    }
        
    protected function getResponseData($prodUrlSemantic) {
        $prodInfo = Product::with(['actualPrice', 'regularPrice', 'category', 'brand', 'size', 'properties', 
        'productMainImage', 'productCardImgOrients', 'actualPrice', 'regularPrice', 'productShowCaseImage', 
        'properties', 'productReport', 'productUnit', 'productPromoImages'])->where('prod_url_semantic', $prodUrlSemantic)->first();
        
        if($prodInfo['actualPrice']->price_value < $prodInfo['regularPrice']->price_value) {
            $prodInfo['price_special'] = $prodInfo['actualPrice']->price_value;
        } else {
            $prodInfo['price_special'] = null;
        }
        
        $categoryId = $prodInfo->category_id;
        $similarProductsService = ProductCardServiceFactory::create($categoryId, $prodInfo);    // Выбираем сервис для выборки в карточку товара аналогичных товаров, разных размеров/цветов...
        $propVariants = $similarProductsService->getSimilarProps();                             // Получаем различные варианты исполнения просматриваемого товара (размеры/цвета/модели...)

        // dd($propVariants);
        return [
            'title' => $prodInfo->tag_title,
            'robots' => 'INDEX,FOLLOW',
            'description' => $prodInfo->meta_name_description,
            'keywords' => $prodInfo->meta_name_keywords,
            'propVariants' => $propVariants,
            'prodInfo' => [
                'id' => $prodInfo->id,
                'article' => $prodInfo->article,
                'title' => $prodInfo->title,
                'category_id' => $prodInfo->category_id,
                'brand_id' => $prodInfo->brand_id,
                'model' => $prodInfo->model,
                'marka' => $prodInfo->marka,
                'size_id' => $prodInfo->size_id,
                'product_unit_id' => $prodInfo->product_unit_id,
                'colour' => $prodInfo->colour,
                'material' => $prodInfo->material,
                'weight' => $prodInfo->weight,
                'prod_desc' => $prodInfo->prod_desc,
                'prod_url_semantic' => $prodInfo->prod_url_semantic,
                'tag_title' => $prodInfo->tag_title,
                'meta_name_description' => $prodInfo->meta_name_description,
                'meta_name_keywords' => $prodInfo->meta_name_keywords,
                'iff_id' => $prodInfo->iff_id,
                'product_status_id' => $prodInfo->product_status_id,
                // Отношения в camelCase:
                'actualPrice' => $prodInfo->actualPrice,
                'regularPrice' => $prodInfo->regularPrice,
                'category' => $prodInfo->category,
                'brand' => $prodInfo->brand,
                'size' => $prodInfo->size,
                'properties' => $prodInfo->properties,
                'productMainImage' => $prodInfo->productMainImage,
                'productCardImgOrients' => $prodInfo->productCardImgOrients[0],
                'productShowCaseImage' => $prodInfo->productShowCaseImage,
                'priceSpecial' => $prodInfo->priceSpecial,
                'productReport' => $prodInfo->productReport,
                'productUnit' => $prodInfo->productUnit,
                'productPromoImages' => $prodInfo->productPromoImages
            ]
        ];
    }
}