<?php
// app/Http/Controllers/ProductCardController.php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Product;
use App\Models\Review;
use App\Models\Order;
use App\Services\ProductCard\ProductCardServiceFactory;
use App\Http\Resources\ProductResource;
use App\Enums\OrderStatus;

class ProductCardController extends Controller
{    

    public function index($prodUrlSemantic, $prodStatus = 1) {

        $responseData = $this->getResponseData($prodUrlSemantic);
        // dd($responseData);
        // \Log::debug('ProductCardController: responseData', [ 'responseData' => $responseData]);
        return Inertia::render('ProductCard', $responseData);
    }
        
    protected function getResponseData($prodUrlSemantic, $prodStatus = 1) {
        // Получаем продукт с нужными отношениями
        $product = Product::with(['actualPrice', 'regularPrice', 'preorderPrice', 'category', 'brand', 'size', 'properties', 
        'productMainImage', 'productCardImgOrients', 'actualPrice', 'regularPrice', 'productShowCaseImage', 
        'properties', 'productReport', 'productUnit', 'productPromoImages', 'videos'])->where('prod_url_semantic', $prodUrlSemantic)->first();
        
        // \Log::debug('ProductCardController:', [ 'product' => $product->category_id]);
        if (!$product) { abort(404); }

        // dd($product);

        if($product['actualPrice']->price_value < $product['regularPrice']->price_value) {
            $product['price_special'] = $product['actualPrice']->price_value;
        } else {
            $product['price_special'] = null;
        }

        // Создаем экземпляр ProductResource и преобразуем продукт
        $productResource = new ProductResource($product);
        $prodInfo = $productResource->toArray(request());
        // \Log::debug('ProductCardController:', [ 'prodInfo' => $prodInfo]);
        
        $categoryId = $product->category_id;
        $similarProductsService = ProductCardServiceFactory::create($categoryId, $product);    // Выбираем сервис для выборки в карточку товара аналогичных товаров, разных размеров/цветов...
        $propVariants = $similarProductsService->getSimilarProps();                             // Получаем различные варианты исполнения просматриваемого товара (размеры/цвета/модели...)
        //\Log::debug('ProductCardController propVariants:', [ 'propVariants' => $propVariants]);

        // Получаем данные для отзывов
        $reviewsData = $this->getReviewsData($product);
        \Log::debug('Reviews data:', [
            'product_id' => $product->id,
            'recent_reviews_count' => count($reviewsData['reviews']['recent_approved_reviews']),
            'recent_reviews' => $reviewsData['reviews']['recent_approved_reviews'],
            'can_review' => $reviewsData['can_review'],
            'user_pending_review' => $reviewsData['user_pending_review'],
            'product_report' => $product->productReport ? [
                'total_reviews' => $product->productReport->total_reviews,
                'average_rating' => $product->productReport->average_rating,
            ] : null,
        ]);

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
            ],
            // Данные для компонента отзывов
            'reviews' => $reviewsData['reviews'],
            'can_review' => $reviewsData['can_review'],
            'user_pending_review' => $reviewsData['user_pending_review'],
        ];
    }

    /**
     * Получает данные для секции отзывов
     */
    protected function getReviewsData(Product $product): array {
        // Получаем последние одобренные отзывы
        $recentApprovedReviews = Review::with(['user', 'order', 'media' => function($query) {
                $query->where('is_approved', true);
            }])
            ->where('product_id', $product->id)
            ->approved()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($review) {
                return [
                    'id' => $review->id,
                    'user' => [
                        'id' => $review->user->id,
                        'name' => $review->user->name,
                    ],
                    'rating' => $review->rating,
                    'advantages' => $review->advantages,
                    'disadvantages' => $review->disadvantages,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at->toISOString(),
                    'purchase_date' => $review->order->created_at->toISOString(),   // ← ДАТА ПОКУПКИ
                    'is_verified' => (bool)$review->is_verified,                    // подтверждённая покупка
                    'media' => $review->media->map(function($media) {
                        return [
                            'id' => $media->id,
                            'file_path' => $media->file_path,
                            'type' => $media->type,
                            'thumbnail_url' => $media->thumbnail_url,
                        ];
                    })->toArray(),
                    'helpful_count' => $review->helpful_count,
                    'status' => $review->status,
                ];
            }
        );

        // Проверяем, может ли текущий пользователь оставить отзыв
        $canReview = false;
        $userPendingReview = null;
       
        if (auth()->check()) {
            $userId = auth()->id();

            // Используем accessor status и Enum. Проверяем, есть ли у пользователя доставленные заказы с этим товаром
            /* $eligibleOrders = Order::where('user_id', $userId)
                ->whereHas('items', function($query) use ($product) {
                    $query->where('product_id', $product->id);
                })
                ->get()
                ->filter(function($order) {
                    // Используем accessor getStatusAttribute() и сравниваем с Enum
                    return $order->status === OrderStatus::RECEIVED;
                });

                \Log::debug('Review eligibility check - filtered orders', [
                    'product_id' => $product->id,
                    'user_id' => $userId,
                    'all_orders_count' => Order::where('user_id', $userId)->whereHas('items', function($q) use ($product) {
                        $q->where('product_id', $product->id);
                    })->count(),
                    'eligible_orders_count' => $eligibleOrders->count(),
                    'eligible_order_ids' => $eligibleOrders->pluck('id'),
                ]);

                // Проверяем для каждого подходящего заказа, не оставлен ли уже отзыв
                foreach ($eligibleOrders as $order) {
                    $existingReview = Review::where('user_id', $userId)
                        ->where('product_id', $product->id)
                        ->where('order_id', $order->id)
                        ->exists();

                    if (!$existingReview) {
                        $canReview = true;
                        break;
                    }
                }
            */

            // со scopes...
            $eligibleOrders = Order::where('order_client_id', $userId)
                ->withProduct($product->id)
                ->canBeReviewed()           // ← ПРАВИЛЬНО! Без "scope" status_id IN (RECEIVED, COMPLETED)
                ->get();                    // В Laravel метод ->get() всегда возвращает коллекцию (Illuminate\Database\Eloquent\Collection), даже если нет результатов. Пустая коллекция - не null.

            /* \Log::debug('Review eligibility - step by step', [
                'product_id' => $product->id,
                'order_client_id' => $userId,
                'eligible_orders' => $eligibleOrders->count(),
                'eligible_order_ids' => $eligibleOrders->pluck('id'),
            ]);*/

            /*\Log::debug('Eligible orders type:', [
                'type' => gettype($eligibleOrders),
                'class' => get_class($eligibleOrders),
                'count' => $eligibleOrders->count(),
                'is_empty' => $eligibleOrders->isEmpty(),
            ]);*/

            // Этот код безопасен - foreach не выполнится для пустой коллекции
            foreach ($eligibleOrders as $order) {
                // Код выполнится только если есть заказы
                $hasExistingReview = Review::where('user_id', $userId)
                    ->where('product_id', $product->id)
                    ->where('order_id', $order->id)
                    ->exists();
                
                /*\Log::debug('🔍 Checking order for existing review', [
                    'order_id' => $order->id,
                    'has_existing_review' => $hasExistingReview,
                ]);*/

                if (!$hasExistingReview) {
                    $canReview = true;
                    /*\Log::debug('User can review - found eligible order without review', [
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                    ]);*/
                    break;
                }
            }

            // Логируем если не нашли подходящий заказ для отзыва на товар
            if (!$canReview) {
                /*\Log::debug('User cannot review - all eligible orders already have reviews', [
                    'user_id' => $userId,
                    'product_id' => $product->id,
                ]);*/
            } else {
                /*\Log::debug('User cannot review - no eligible orders found', [
                    'user_id' => $userId,
                    'product_id' => $product->id,
                ]);*/
            }
            
            // Проверяем отзыв на модерации
            $userPendingReview = Review::where('user_id', $userId)
                ->where('product_id', $product->id)
                ->pending()         // ->where('status', 'pending')
                ->first();          // first() может вернуть null - это нормально

            if ($userPendingReview) {
                $userPendingReview = [
                    'id' => $userPendingReview->id,
                    'status' => 'pending',
                    'order_id' => $userPendingReview->order_id,
                ];

                /*\Log::debug('User has pending review', [
                    'review_id' => $userPendingReview['id'],
                    'order_id' => $userPendingReview['order_id'],
                ]);*/
            }
        }

        /*\Log::debug('🎉 Final review eligibility', [
            'can_review' => $canReview,
            'has_pending_review' => !is_null($userPendingReview),
        ]);*/

        return [
            'reviews' => [
                'recent_approved_reviews' => $recentApprovedReviews,
            ],
            'can_review' => $canReview,
            'user_pending_review' => $userPendingReview,
        ];
    }
}