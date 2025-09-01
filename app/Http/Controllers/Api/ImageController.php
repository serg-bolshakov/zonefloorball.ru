<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Image;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use App\Http\Requests\StoreImageRequest;
use Illuminate\Support\Facades\Log;
use App\Models\ProductStatus;

class ImageController extends Controller
{
    // public function storeImages(Request $request, $productId) {
        // Laravel автоматически разрешит этот порядок
        // $productId будет взят из маршрута
        // public function storeStep3($productId, Request $request) - также работает, но менее привычно

    // Заменяем Request на StoreImageRequest
    public function storeImages(StoreImageRequest $request, $productId)  {
        // Laravel автоматически выполнит валидацию ДО входа в метод!
        // Если валидация не пройдена - вернется 422 автоматически

        \Log::debug('ImageController input', $request->all());

        Log::debug('🚀 ImageController: Начало обработки запроса', [
            'productId'     => $productId,
            'hasFiles'      => $request->hasFile('images'),
            'filesCount'    => $request->hasFile('images') ? count($request->file('images')) : 0,
            'metadata'      => $request->metadata
        ]);
        
        try {
            DB::beginTransaction();
            Log::debug('✅ Транзакция начата');

            // Валидация УЖЕ пройдена, можно сразу работать с данными (StoreImageRequest)

            // Парсим метаданные
            Log::debug('🔄 Парсинг метаданных...');
            $metadata = json_decode($request->metadata, true);
            Log::debug('📋 Метаданные распаршены:', $metadata);

            // Дополнительная валидация метаданных
            if (!isset($metadata['mainIndex'])) {
                Log::warning('❌ Отсутствует mainIndex в метаданных', $metadata);
                return response()->json([
                    'success' => false,
                    'message' => 'Отсутствуют необходимые метаданные'
                ], 422);
            }
            
            // Проверяем существование товара
            Log::debug("🔄 Поиск товара ID: {$productId}");
            $product = Product::findOrFail($productId);
            Log::debug("✅ Товар найден: {$product->title} (ID: {$product->id}, Status: {$product->product_status_id})");

            // Обработка файлов...
                // Загрузка новых изображений
                $uploadedImages = [];
                $hasMainImage = false;
                $files = $request->file('images', []);
                Log::debug("📁 Получено файлов: " . count($files));

                foreach ($files as $index => $file) {
                    Log::debug("🔄 Обработка файла {$index}: {$file->getClientOriginalName()}");
                    $imagePath = $this->storeImage($file, $product, $index, $metadata);
                    Log::debug("📸 Файл сохранен по пути: {$imagePath}");

                    $isMain = $metadata['mainIndex'] == $index;
                    if ($isMain) {
                        $hasMainImage = true;
                        Log::debug("📌 Обнаружено главное изображение для файла {$index}");
                    }
                    
                    /*$image = Image::create([
                        'product_id'    => $product->id,
                        'img_link'      => $imagePath,
                        'img_main'      => $metadata['mainIndex'] == $index,
                        'img_showcase'  => isset($metadata['showcaseIndex']) && $metadata['showcaseIndex'] == $index,
                        'img_promo'     => isset($metadata['promoIndices']) && in_array($index, $metadata['promoIndices']),
                        'img_orient_id' => $metadata['orientations'][$index] ?? null,
                        'author_id'     => auth()->id(),
                        'created_at'    => now()
                    ]);*/

                    $imageData = [
                        'product_id' => $product->id,
                        'img_link' => $imagePath,
                        'img_main' => $metadata['mainIndex'] == $index,
                        'img_showcase' => isset($metadata['showcaseIndex']) && $metadata['showcaseIndex'] == $index,
                        'img_promo' => isset($metadata['promoIndices']) && in_array($index, $metadata['promoIndices']),
                        'img_orient_id' => $metadata['orientations'][$index] ?? null,
                        'author_id' => auth()->id(),
                        'created_at' => now()
                    ];
                    
                    Log::debug("💾 Создание записи Image:", $imageData);
                    
                    $image = Image::create($imageData);
                    $uploadedImages[] = $image;

                    Log::debug("✅ Файл {$index} успешно обработан");
                }
            
            // 🔥 ЛОГИКА СМЕНЫ СТАТУСА
            if ($product->isDraft() && $hasMainImage) {
                Log::debug("🔄 Попытка смены статуса с DRAFT на ACTIVE");
                
                if ($product->changeStatus(ProductStatus::ACTIVE)) {
                    Log::info("🎉 Статус товара ID: {$productId} изменен с DRAFT на ACTIVE");
                } else {
                    Log::warning("⚠️ Не удалось изменить статус товара ID: {$productId}");
                }
            } else {
                Log::debug("📋 Смена статуса не требуется", [
                    'isDraft' => $product->isDraft(),
                    'hasMainImage' => $hasMainImage
                ]);
            }
            
            DB::commit();
            Log::debug('✅ Транзакция завершена успешно');

            $countUploadedImages = count($uploadedImages);
            Log::info("🎉 Успешно загружено изображений: {$countUploadedImages} для товара ID: {$productId}");

            // Если среди загруженных изображений для товара с product_status_id = 3 (draft) есть изображение с суффиксом main -> меняем статус на product_status_id = 1 (active)

            return response()->json([
                'success' => true,
                'message' => "Изображения для товара в количестве $countUploadedImages шт. успешно добавлены",
                'productId' => $product->id,
                'images' => $uploadedImages
            ]);

        }  catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::warning('❌ Ошибка валидации', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Ошибки валидации',
                'errors' => $e->errors()
            ], 422);
        
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            Log::error('❌ Товар не найден', ['productId' => $productId]);
            return response()->json([
                'success' => false,
                'message' => 'Товар не найден'
            ], 404);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Image upload error: ' . $e->getMessage());
            Log::error('💥 Критическая ошибка в ImageController', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Ошибка сервера: ' . $e->getMessage()
            ], 500);
        } finally {
            Log::debug('🏁 Завершение работы ImageController');
        }
    }

    private function storeImage($file, Product $product, $index, $metadata) {
        Log::debug("🔄 Генерация имени для файла {$index}");

        $extension = $file->getClientOriginalExtension();
        Log::debug("🔄 Расширение исходного файла {$extension}");
        
        /* у нас есть в модели Product метод получения базового имении ссылки на изображения товаров:
            public function getImgSrcAttribute() {      // как работает: отношение с получением значения:
                $image = $this->hasOne(Image::class)->orderBy('created_at')->first();
                return $image ? $image->img_link : null;
                // именно первая ссылка - это без расширения, просто базовое имя вида: images/sticks/21461-klyushka-dlya-florbola-unihoc-cavity-z-32mm
        }*/
        // Получаем из таблицы Images базовое имя на основе продукта, полученное при оформлении товара на шаге 2...
        $baseName = $product->img_src;      // как это работает подробно в модели Product->getImgSrcAttribute()
        Log::debug("🏷️ url {$baseName} - сохранённый базовый адрес");              

        // нужно получить: images/sticks/images/sticks/21461-klyushka-dlya-florbola-unihoc-cavity-z-32mm-main.jpg
        // или images/sticks/images/sticks/21461-klyushka-dlya-florbola-unihoc-cavity-z-32mm-showcase.jpg
        // или images/sticks/images/sticks/21461-klyushka-dlya-florbola-unihoc-cavity-z-32mm-promo-1.jpg
        
        // Определяем тип изображения для суффикса
        $suffix = '';
        if ($metadata['mainIndex'] == $index) {
            $suffix = '-main';
            Log::debug("🏷️ Файл {$index} - основное изображение");
        } elseif (isset($metadata['showcaseIndex']) && $metadata['showcaseIndex'] == $index) {
            $suffix = '-showcase';
            Log::debug("🏷️ Файл {$index} - для витрины");
        } elseif (isset($metadata['promoIndices']) && in_array($index, $metadata['promoIndices'])) {
            $suffix = '-promo';
            Log::debug("🏷️ Файл {$index} - промо-изображение");
        }

        $i = 1;
        do {
            $fileName = $baseName . $suffix . ($i > 1 ? '-' . $i : '') . '.' . $extension;
            $i++;
        } while (Storage::exists('public/' . $fileName));
        Log::debug("📝 Имя файла сгенерировано: {$fileName}");
        
        $path = $file->storeAs('public', $fileName);
        Log::debug("📁 Файл сохранен в: {$path}");
        
        return $fileName;
    }
}