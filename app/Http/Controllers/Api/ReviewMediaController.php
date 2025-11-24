<?php
// app/Http/Controllers/Api/ReviewMediaController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class ReviewMediaController extends Controller
{
    public function __construct(private MediaService $mediaService) {}

    /**
     * Загрузка медиафайлов для отзыва
     */
    public function store(Request $request, Review $review): JsonResponse
    {
        try {
            $request->validate([
                'media' => 'required|array|max:5',
                'media.*' => [
                    'file',
                    'mimes:jpg,jpeg,png,mp4,mov,avi',
                    'max:51200', // 50MB
                ]
            ]);

            Log::debug('🔄 ReviewMediaController: Начало загрузки медиа', [
                'review_id' => $review->id,
                'files_count' => count($request->file('media', [])),
                'user_id' => auth()->id(),
            ]);

            // Проверяем права доступа
            if ($review->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Недостаточно прав для добавления медиа к этому отзыву'
                ], 403);
            }

            $uploadedMedia = $this->mediaService->processReviewMedia(
                $review,
                $request->file('media')
            );

            // ОБНОВЛЯЕМ СТАТИСТИКУ МЕДИА
            $review->product->incrementReviewsWithMedia();

            Log::info('✅ Медиафайлы успешно загружены', [
                'review_id' => $review->id,
                'uploaded_count' => count($uploadedMedia),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Медиафайлы успешно загружены',
                'media' => $uploadedMedia,
            ]);

        } catch (ValidationException $e) {
            Log::warning('❌ Ошибка валидации медиа', [
                'errors' => $e->errors(),
                'review_id' => $review->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ошибки валидации файлов',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            Log::error('💥 Ошибка загрузки медиа', [
                'review_id' => $review->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ошибка при загрузке медиафайлов',
            ], 500);
        }
    }

    /**
     * Удаление медиафайла
     */
    public function destroy(Review $review, $mediaId): JsonResponse
    {
        try {
            $media = $review->media()->findOrFail($mediaId);

            // Проверяем права доступа
            if ($review->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Недостаточно прав для удаления этого файла'
                ], 403);
            }

            $this->mediaService->deleteMediaFile($media);

            Log::info('🗑️ Медиафайл удален', [
                'media_id' => $mediaId,
                'review_id' => $review->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Файл успешно удален',
            ]);

        } catch (\Exception $e) {
            Log::error('💥 Ошибка удаления медиа', [
                'media_id' => $mediaId,
                'review_id' => $review->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ошибка при удалении файла',
            ], 500);
        }
    }
}