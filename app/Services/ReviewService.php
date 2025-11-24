<?php
// app/Services/ReviewService.php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\ProductReport;
use App\Enums\OrderStatus;
use App\Mail\ReviewModerationNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ReviewService
{
    public function __construct(private MediaService $mediaService) {}

    /**
     * Создание отзыва
     */
    public function createReview(Order $order, array $data): Review {

        \Log::debug('Начало создания отзыва ReviewService.createReview', [
            'order' => $order,
            'dara' => $data,
        ]);

        return DB::transaction(function () use ($order, $data) {
            
            // Находим товар
            $product = Product::findOrFail($data['product_id']);
            
            // Проверяем, что пользователь может оставить отзыв
            $this->validateReviewEligibility($order, $product->id);

            // Создаем отзыв
            $review = Review::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'user_id' => auth()->id(),
                'rating' => $data['rating'],
                'advantages' => $data['advantages'] ?? null,
                'disadvantages' => $data['disadvantages'] ?? null,
                'comment' => $data['comment'],
                'is_verified' => true,
                'status' => 'pending',
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            Log::info('🎉 Отзыв успешно создан', [
                'review_id' => $review->id,
                'order_id' => $order->id,
                'product_id' => $product->id,
                'user_id' => auth()->id(),
                'rating' => $data['rating'],
            ]);

            // Обновляем статистику товара - закомментировали! Обновлять статистику товара будем только после того, как отзыв одобрит модератор
            // $this->updateProductStats($product, $data['rating']);

            // Отправляем уведомление админу
            $this->sendModerationNotification($review);

            return $review;
        });
    }

    /**
     * Отметить отзыв как полезный
     */
    // public function markAsHelpful(int $reviewId, bool $isHelpful = true): array {
    //     try {
    //         $review = Review::findOrFail($reviewId);

    public function markAsHelpful(Review $review): array {
        try {        
            // Просто увеличиваем счётчик
            $review->increment('helpful_count');
            
            // Можно добавить защиту от накруток по IP/user_id если нужно
            // но для начала сделаем просто
            
            return [
                'success' => true,
                'message' => 'Спасибо за вашу оценку!',
                'helpful_count' => $review->fresh()->helpful_count // получаем актуальное значение
            ];
            
        } catch (\Exception $e) {
            \Log::error('Error marking review as helpful: ' . $e->getMessage(), [
                'review_id' => $reviewId,
                'is_helpful' => $isHelpful
            ]);
            
            return [
                'success' => false,
                'message' => 'Не удалось оценить отзыв'
            ];
        }
    }

    /**
     * Проверка возможности оставить отзыв (исправленная версия)
     */
    private function validateReviewEligibility(Order $order, int $productId): void
    {
        $userId = auth()->id();

        Log::debug('🔍 Проверка возможности отзыва', [
            'user_id' => $userId,
            'order_id' => $order->id,
            'product_id' => $productId,
            'order_status_id' => $order->status_id,
            'order_reviewable' => $order->isReviewable(),
        ]);

        // Проверяем, что заказ можно оценить
        if (!$order->isReviewable()) {
            $statusName = $this->getStatusName($order->status_id);
            throw new \Exception("Нельзя оставить отзыв для заказа со статусом: {$statusName}");
        }

        // Проверяем, что товар есть в заказе
        if (!$order->items->contains('product_id', $productId)) {
            throw new \Exception('Товар не найден в вашем заказе');
        }

        // Проверяем, что отзыв еще не оставлен
        $existingReview = Review::where('order_id', $order->id)
            ->where('product_id', $productId)
            ->first();

        if ($existingReview) {
            $statusText = match($existingReview->status) {
                'pending' => 'ожидает модерации',
                'approved' => 'уже одобрен',
                'rejected' => 'был отклонен',
                default => 'существует'
            };
            
            throw new \Exception("Вы уже оставляли отзыв на этот товар (статус: {$statusText})");
        }

        Log::debug('✅ Проверка пройдена - можно оставлять отзыв');
    }

    /**
     * Получение названия статуса заказа
     */
    private function getStatusName(int $statusId): string
    {
        try {
            $status = OrderStatus::fromValue($statusId);
            return $status->title(); // Используем метод title() из Enum'а
        } catch (\InvalidArgumentException $e) {
            Log::warning('❌ Неизвестный статус заказа', [
                'status_id' => $statusId,
                'error' => $e->getMessage(),
            ]);
            return 'неизвестно';
        }
    }

    /**
     * Обновление статистики отзывов для товара
     */
    private function updateProductStats(Product $product, int $newRating): void {
        Log::debug('🟡 Начало ReviewService.updateProductStats', [
            'product_id' => $product->id,
            'product_title' => $product->title,
            'newRating' => $newRating,
        ]);

        try {

            // Передаем новый рейтинг для умного пересчета в метод модели
            $product->updateRatingStats($newRating, 'add');

            \Log::debug('✅ Статистика обновлена с учётом нового рейтинга', [
                'product_id' => $product->id,
                'new_rating' => $newRating,
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Ошибка обновления статистики товара', [
                'product_id' => $product->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Поиск подходящего заказа для отзыва
     */
    public function findEligibleOrder(int $productId): ?Order
    {
        $userId = auth()->id();

        $eligibleOrders = Order::where('order_client_id', $userId)
            ->withProduct($productId)
            ->canBeReviewed()
            ->get();

        Log::debug('🔍 Поиск подходящих заказов для отзыва', [
            'user_id' => $userId,
            'product_id' => $productId,
            'found_orders' => $eligibleOrders->count(),
            'order_ids' => $eligibleOrders->pluck('id'),
        ]);

        // Ищем заказ без существующего отзыва
        foreach ($eligibleOrders as $order) {
            $hasExistingReview = Review::where('user_id', $userId)
                ->where('product_id', $productId)
                ->where('order_id', $order->id)
                ->exists();

            if (!$hasExistingReview) {
                Log::debug('✅ Найден подходящий заказ для отзыва', [
                    'order_id' => $order->id,
                    'product_id' => $productId,
                    'status_id' => $order->status_id,
                    'status_name' => $this->getStatusName($order->status_id),
                ]);
                
                return $order;
            }
        }

        Log::debug('❌ Подходящих заказов не найдено');
        return null;
    }

    private function sendModerationNotification(Review $review): void {
        try {
            $adminEmail = config('mail.admin_email', 'admin@example.com');
            
            if ($adminEmail) {
                Mail::to($adminEmail)->send(
                    new ReviewModerationNotification($review)
                );
                
                \Log::info('Moderation notification sent', [
                    'review_id' => $review->id,
                    'admin_email' => $adminEmail
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send moderation notification: ' . $e->getMessage(), [
                'review_id' => $review->id
            ]);
            // Не прерываем процесс из-за ошибки email
        }
    }
}