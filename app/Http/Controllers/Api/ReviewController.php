<?php
// app/Http/Controllers/Api/ReviewController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Requests\MarkAsHelpfulRequest;
use App\Models\Review;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    public function __construct(private ReviewService $reviewService) {}

    public function store(StoreReviewRequest $request): JsonResponse
    {
        \Log::debug('🟡 Начало работы метода store ReviewController.Store');
        try {
            \Log::debug('🟡 Начало создания отзыва ReviewController.Store', [
                'user_id' => auth()->id(),
                'product_id' => $request->product_id,
                'data' => $request->except('_token'), // Логируем без чувствительных данных
            ]);

            // Находим подходящий заказ для этого товара
            $order = $this->reviewService->findEligibleOrder($request->product_id);
            
            \Log::debug('🟡 Заказ для этого товара ReviewController.Store', [
                'order' => $order,
            ]);

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'У вас нет подходящих заказов для отзыва на этот товар. Отзыв можно оставить только после получения товара.'
                ], 403);
            }

            $review = $this->reviewService->createReview($order, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Отзыв успешно создан и отправлен на модерацию',
                'review' => [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'status' => $review->status,
                    'created_at' => $review->created_at->toISOString(),
                ]
            ], 201);

        } catch (\Exception $e) {
            \Log::error('❌ Ошибка создания отзыва', [
                'user_id' => auth()->id(),
                'product_id' => $request->product_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Оценить отзыв как полезный
     */
    /* public function markAsHelpful(MarkAsHelpfulRequest $request): JsonResponse {
        try {
            $result = $this->reviewService->markAsHelpful(
                $request->reviewId, 
                $request->isHelpful
            );
            
            return response()->json($result);
            
        } catch (\Exception $e) {
            \Log::error('ReviewController markAsHelpful error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Внутренняя ошибка сервера'
            ], 500);
        }
    }*/
     
    public function markAsHelpful(Review $review, MarkAsHelpfulRequest $request): JsonResponse {
        try {
            // $review уже загружен автоматически! если роут в таком виде: Route::post('/reviews/{review}/helpful', [ReviewController::class, 'markAsHelpful']);
            $result = $this->reviewService->markAsHelpful($review);
            
            return response()->json($result);
            
        } catch (\Exception $e) {
            \Log::error('ReviewController markAsHelpful error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Внутренняя ошибка сервера'
            ], 500);
        }
    }
}