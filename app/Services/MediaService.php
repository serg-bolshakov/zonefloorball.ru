<?php
// app/Services/MediaService.php

namespace App\Services;

use App\Models\Review;
use App\Models\ReviewMedia;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Str;

class MediaService
{
    private const MAX_IMAGE_WIDTH = 2000;
    private const THUMBNAIL_WIDTH = 400;
    private const IMAGE_QUALITY = 85;

    /**
     * Обработка медиафайлов для отзыва
     */
    public function processReviewMedia(Review $review, array $files): array
    {
        $uploadedMedia = [];

        foreach ($files as $file) {
            try {
                $media = $this->storeReviewMedia($review, $file);
                $uploadedMedia[] = $media;
                
                \Log::info('✅ MediaService.php - Медиафайл успешно обработан', [
                    'review_id' => $review->id,
                    'media_id' => $media->id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $this->getFileType($file),
                ]);
            } catch (\Exception $e) {
                \Log::error('❌ Ошибка обработки медиафайла MediaService.php', [
                    'review_id' => $review->id,
                    'file_name' => $file->getClientOriginalName(),
                    'error' => $e->getMessage(),
                ]);
                
                // Продолжаем обработку других файлов
                continue;
            }
        }

        return $uploadedMedia;
    }

    /**
     * Сохранение одного медиафайла
     */
    private function storeReviewMedia(Review $review, UploadedFile $file): ReviewMedia
    {
        $fileType = $this->getFileType($file);
        $fileExtension = $file->getClientOriginalExtension();
        $uniqueFileName = $this->generateUniqueFileName($fileExtension);

        // Создаем пути для файлов
        $paths = $this->generateFilePaths($review->id, $uniqueFileName, $fileType);

        // Сохраняем файл в зависимости от типа
        if ($fileType === 'image') {
            $this->processAndStoreImage($file, $paths);
        } else {
            $this->storeVideo($file, $paths['original']);
        }

        // ИЗВЛЕКАЕМ метаданные ПЕРЕД использованием
        $metadata = $this->extractMetadata($file, $paths);

        \Log::debug('🔄 Создание записи ReviewMedia', [
            'review_id' => $review->id,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $fileType,
            'metadata_structure' => $metadata,
        ]);

        // Создаем запись в БД
        return ReviewMedia::create([
            'review_id' => $review->id,
            'file_path' => $paths['original'],
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'type' => $fileType,
            'thumbnail_path' => $paths['thumbnail'] ?? null,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Генерация путей для файлов
     */
    private function generateFilePaths(int $reviewId, string $fileName, string $fileType): array
    {
        $basePath = "{$reviewId}/" . ($fileType === 'image' ? 'images' : 'videos');
        
        $paths = [
            'original' => "{$basePath}/original/{$fileName}",
        ];

        if ($fileType === 'image') {
            $paths['optimized'] = "{$basePath}/optimized/{$fileName}";
            $paths['thumbnail'] = "{$basePath}/thumbnails/{$fileName}";
        } else {
            $paths['thumbnail'] = "{$basePath}/thumbnails/" . pathinfo($fileName, PATHINFO_FILENAME) . '.jpg';
        }

        return $paths;
    }

    /**
     * Обработка и сохранение изображения
     */
    private function processAndStoreImage(UploadedFile $file, array $paths): void
    {
        $image = Image::make($file->getRealPath());

        // Сохраняем оригинал
        Storage::disk('reviews')->put($paths['original'], $image->encode(null, 100));

        // Оптимизированная версия
        $optimizedImage = $this->optimizeImage($image);
        Storage::disk('reviews')->put($paths['optimized'], $optimizedImage);

        // Превью (thumbnail)
        $thumbnailImage = $this->createThumbnail($image);
        Storage::disk('reviews')->put($paths['thumbnail'], $thumbnailImage);
    }

    /**
     * Оптимизация изображения
     */
    private function optimizeImage(\Intervention\Image\Image $image): \Intervention\Image\Image
    {
        return $image->resize(self::MAX_IMAGE_WIDTH, null, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        })->encode(null, self::IMAGE_QUALITY);
    }

    /**
     * Создание превью
     */
    private function createThumbnail(\Intervention\Image\Image $image): \Intervention\Image\Image
    {
        return $image->resize(self::THUMBNAIL_WIDTH, null, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        })->encode('jpg', 80);
    }

    /**
     * Сохранение видео
     */
    private function storeVideo(UploadedFile $file, string $path): void
    {
        // Пока просто сохраняем оригинал
        Storage::disk('reviews')->put($path, file_get_contents($file->getRealPath()));

        // TODO: В будущем можно добавить:
        // - Конвертацию в оптимальный формат
        // - Генерацию превью через FFMpeg
        // - Сжатие видео
    }

    /**
     * Генерация уникального имени файла
     */
    private function generateUniqueFileName(string $extension): string
    {
        return Str::random(40) . '.' . $extension;
    }

    /**
     * Определение типа файла
     */
    private function getFileType(UploadedFile $file): string
    {
        return str_starts_with($file->getMimeType(), 'video/') ? 'video' : 'image';
    }

    /**
     * Извлечение метаданных
     */
    private function extractMetadata(UploadedFile $file, array $paths): array
    {
        $metadata = [
            'original_name' => $file->getClientOriginalName(),
            'extension' => $file->getClientOriginalExtension(),
            'uploaded_at' => now()->toISOString(),
            'storage_paths' => $paths,
        ];

        if (str_starts_with($file->getMimeType(), 'image/')) {
            try {
                $image = Image::make($file->getRealPath());
                $metadata['dimensions'] = [
                    'width' => $image->width(),
                    'height' => $image->height(),
                ];
                $metadata['file_size'] = $file->getSize();
            } catch (\Exception $e) {
                // Игнорируем ошибки EXIF
            }
        }

        return $metadata;
    }

    /**
     * Получение URL для отображения
     */
    public function getMediaUrl(ReviewMedia $media, string $type = 'optimized'): string
    {
        $path = match($type) {
            'original' => $media->file_path,
            'optimized' => $media->metadata['storage_paths']['optimized'] ?? $media->file_path,
            'thumbnail' => $media->thumbnail_path ?? $media->file_path,
            default => $media->file_path
        };

        return Storage::disk('reviews')->url($path);
    }

    /**
     * Удаление файлов медиа
     */
    public function deleteMediaFiles(ReviewMedia $media): void
    {
        $paths = $media->metadata['storage_paths'] ?? [];

        // Удаляем все версии файла
        foreach ($paths as $path) {
            if (Storage::disk('reviews')->exists($path)) {
                Storage::disk('reviews')->delete($path);
            }
        }

        // Удаляем папку если она пустая
        $this->cleanupEmptyDirectories($media->review_id);
    }

    /**
     * Очистка пустых директорий
     */
    private function cleanupEmptyDirectories(int $reviewId): void
    {
        $directories = [
            "{$reviewId}/images/original",
            "{$reviewId}/images/optimized", 
            "{$reviewId}/images/thumbnails",
            "{$reviewId}/videos/original",
            "{$reviewId}/videos/thumbnails",
            "{$reviewId}/images",
            "{$reviewId}/videos",
            "{$reviewId}",
        ];

        foreach ($directories as $directory) {
            if (Storage::disk('reviews')->exists($directory) && 
                empty(Storage::disk('reviews')->files($directory)) &&
                empty(Storage::disk('reviews')->directories($directory))) {
                Storage::disk('reviews')->deleteDirectory($directory);
            }
        }
    }
}