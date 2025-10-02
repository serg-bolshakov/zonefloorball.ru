<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Product;
use App\Services\ProductCard\ProductCardServiceFactory;
use App\Http\Resources\ProductResource;

class ProductCardController extends Controller
{    

    public function index($prodUrlSemantic, $prodStatus = 1) {

        $responseData = $this->getResponseData($prodUrlSemantic);
        // dd($responseData);
        return Inertia::render('ProductCard', $responseData);
    }
        
    protected function getResponseData($prodUrlSemantic, $prodStatus = 1) {
        // Получаем продукт с нужными отношениями
        $product = Product::with(['actualPrice', 'regularPrice', 'preorderPrice', 'category', 'brand', 'size', 'properties', 
        'productMainImage', 'productCardImgOrients', 'actualPrice', 'regularPrice', 'productShowCaseImage', 
        'properties', 'productReport', 'productUnit', 'productPromoImages', 'videos'])->where('prod_url_semantic', $prodUrlSemantic)->first();
        
        \Log::debug('ProductCardController:', [ 'product' => $product->category_id]);

        // dd($product);

        if($product['actualPrice']->price_value < $product['regularPrice']->price_value) {
            $product['price_special'] = $product['actualPrice']->price_value;
        } else {
            $product['price_special'] = null;
        }

        // Создаем экземпляр ProductResource и преобразуем продукт
        $productResource = new ProductResource($product);
        $prodInfo = $productResource->toArray(request());
        \Log::debug('ProductCardController:', [ 'prodInfo' => $prodInfo]);
        
        $categoryId = $product->category_id;
        $similarProductsService = ProductCardServiceFactory::create($categoryId, $product);    // Выбираем сервис для выборки в карточку товара аналогичных товаров, разных размеров/цветов...
        $propVariants = $similarProductsService->getSimilarProps();                             // Получаем различные варианты исполнения просматриваемого товара (размеры/цвета/модели...)
        // dd($prodInfo);
        // dd($propVariants);
        \Log::debug('ProductCardController propVariants:', [ 'propVariants' => $propVariants]);
        return [
            'title' => $product->tag_title,
            'robots' => 'INDEX,FOLLOW',
            'description' => $product->meta_name_description,
            'keywords' => $product->meta_name_keywords,
            'propVariants' => $propVariants,
            'prodInfo' => [
                'id' => $product->id,
                'article' => $product->article,
                'title' => $product->title,
                'category_id' => $product->category_id,
                'brand_id' => $product->brand_id,
                'model' => $product->model ?? null,
                'marka' => $product->marka ?? null,
                'size_id' => $product->size_id,
                'product_unit_id' => $product->product_unit_id,
                'colour' => $product->colour,
                'material' => $product->material,
                'weight' => $product->weight,
                'prod_desc' => $product->prod_desc,
                'prod_url_semantic' => $product->prod_url_semantic,
                'tag_title' => $product->tag_title,
                'meta_name_description' => $product->meta_name_description,
                'meta_name_keywords' => $product->meta_name_keywords,
                'iff_id' => $product->iff_id,
                'product_status_id' => $product->product_status_id,
                // Отношения в camelCase:
                'actualPrice' => $product->actualPrice,
                'regularPrice' => $product->regularPrice,
                'preorderPrice' => $product->preorderPrice,
                'category' => $prodInfo['category'],
                'brand' => $product->brand ?? null,
                'size' => $product->size,
                'properties' => $product->properties,
                'videos' => $product->videos,
                'productMainImage' => $product->productMainImage,
                'productCardImgOrients' => $product->productCardImgOrients[0],
                'productShowCaseImage' => $product->productShowCaseImage,
                'priceSpecial' => $product->priceSpecial,
                'productReport' => $product->productReport,
                'productUnit' => $product->productUnit,
                'productPromoImages' => $product->productPromoImages,
                // Ниже полученные данные из ProductResource будут использоваться на фронте для расчёта цены предложения для авторизованных пользователей
                'price_actual'                  => $prodInfo['price_actual']               ?? null,
                'price_regular'                 => $prodInfo['price_regular']              ?? null,
                'price_with_rank_discount'      => $prodInfo['price_with_rank_discount']   ?? null,
                'price_with_action_discount'    => $prodInfo['price_with_action_discount'] ?? null,
                'percent_of_rank_discount'      => $prodInfo['percent_of_rank_discount']   ?? null,
                'summa_of_action_discount'      => $prodInfo['summa_of_action_discount']   ?? null,
                'price_special'                 => $prodInfo['price_special']              ?? null
            ]
        ];
    }
}