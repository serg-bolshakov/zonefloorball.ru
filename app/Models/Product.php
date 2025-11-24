<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; 

use Carbon\Carbon;

class Product extends Model {
    use HasFactory;

    protected $fillable = [
        'article',
        'title', 
        'category_id',
        'brand_id',
        'model',
        'marka',
        'size_id',
        'product_unit_id',
        'colour',
        'material',
        'weight',
        'prod_desc',
        'prod_url_semantic',
        'tag_title',
        'meta_name_description',
        'meta_name_keywords',
        'iff_id',
        'product_ean',
        'product_status_id',
        'author_id'
    ];

    # мы говорили, что каждая категория имеет много товаров... мы связали категории и их продукты отношением hasMany... Но это зависит от точки зрения...
    # Если посмотреть со стороны продукта(товара), то каждый товар принадлежит одной категории. Это значит, что товар можно связать с категорией отношением belongsTo. Сделаем это:

    public function category() {
        return $this->belongsTo(Category::class);
    }

    # таблица товаров products, в который каждый продукт связан со своим брендом и со своей категорией, прописываем связь с брендом:
    public function brand() {
        return $this->belongsTo(Brand::class);
    }

    public function size() {
        return $this->belongsTo(Size::class);
    }
    # При вызове метода size, Eloquent попытается найти модель Size, 
    # у которой есть id, который соответствует столбцу size_id в модели Product.

    public function productUnit() {
        return $this->belongsTo(ProductUnit::class);
    }

    /**
     * Получить текущую цену на продукт.
     */
    /*public function actualPrice() {
        return $this->hasOne(Price::class)->ofMany([
            'id' => 'max',
        ], function ($query) {
            $query->where(function ($q) {
                $q->where('date_end', '>', now())
                ->orWhereNull('date_end');
            })->whereIn('price_type_id', [
                Price::TYPE_REGULAR, 
                Price::TYPE_SPECIAL
            ]);
        });
    }*/

    public function actualPrice() {
        return $this->hasOne(Price::class)->ofMany([
            'price_type_id' => 'max', // Сначала SPECIAL (3), потом REGULAR (2)
            'id' => 'max',
        ], function ($query) {
            $query->where(function ($q) {
                // Условия на период действия
                $q->where(function ($subQ) {
                    $subQ->where('date_end', '>', now())
                        ->orWhereNull('date_end');
                })
                // Условия на начало действия - ТОЛЬКО действующие
                ->where(function ($subQ) {
                    $subQ->where('date_start', '<=', now())
                        ->orWhereNull('date_start');
                });
            })->whereIn('price_type_id', [
                Price::TYPE_REGULAR, 
                Price::TYPE_SPECIAL
            ]);
        });
    }

    /* Получить базовую (РРЦ) цену на продукт. */
    public function regularPrice() {
        return $this->hasOne(Price::class)->ofMany([
            'id' => 'max',
        ], function ($query) {
            $query->where('price_type_id', '=', 2);
        });
    }

    /* Получить специальную цену для ПОКУПАТЕЛЯ (не админа) на продукт (по акции), если таковая есть. */
    public function specialPrice() {
        return $this->hasOne(Price::class)->ofMany([
            'id' => 'max',
        ], function ($query) {
            $query->where('price_type_id', Price::TYPE_SPECIAL)
                ->where(function ($q) {
                    // Условия на период действия
                    $q->where(function ($subQ) {
                        $subQ->where('date_end', '>', now())
                            ->orWhereNull('date_end');
                    })
                    // Условия на начало действия - ТОЛЬКО действующие акции
                    ->where(function ($subQ) {
                        $subQ->where('date_start', '<=', now())
                            ->orWhereNull('date_start');
                    });
                });
        });
    }

    /**
     * Все специальные цены (включая будущие) для админки
     */
    public function adminSpecialPrices() {
        return $this->hasMany(Price::class)
            ->where('price_type_id', Price::TYPE_SPECIAL)
            ->orderBy('date_start', 'desc')
            ->orderBy('id', 'desc');
    }

    /**
     * Актуальная + будущая специальная цена для админки
     */
    
    public function adminSpecialPrice() {
        return $this->hasOne(Price::class)->ofMany([
            'id' => 'max',
        ], function ($query) {
            $query->where('price_type_id', Price::TYPE_SPECIAL)
                ->where(function ($q) {
                    $q->where('date_end', '>', now())
                        ->orWhereNull('date_end');
                });
            // Убрано условие на date_start - показываем и будущие
        });
    }

    /* Получить цену на продукт на условиях предзаказа. */
    public function preorderPrice() {
        // \Log::info('preorderPrice method called for product: ' . $this);
        return $this->hasOne(Price::class)->ofMany([
            'id' => 'max',
        ], function ($query) {
            // \Log::info('preorderPrice query executed');
            $query->where(function ($q) {
                $q->where('date_end', '>', now())
                ->orWhereNull('date_end');
            })->where(function ($q) {
                $q->where('price_type_id', Price::TYPE_PREORDER);
            });
        });
    }

    /**
     * Получить текущую себестоимость товара
     */
    public function costPrice() {
        // \Log::info('costPrice method called for product: ' . $this->id);
        
        return $this->hasOne(Price::class)->ofMany([
            'id' => 'max',
        ], function ($query) {
            $query->where('price_type_id', Price::TYPE_COST);
        });
    }

    /**
     * Accessor для быстрого доступа к себестоимости
     */
    /*public function getCostPriceAttribute()
    {
        return $this->costPrice->price_value ?? 0;
    }
    
    // При обращении $product->costPrice:
        // 1. Вызывался аксессор getCostPriceAttribute()
        // 2. Который снова обращался к $this->costPrice 
        // 3. Что снова вызывало аксессор... 
        // 4. Бесконечная рекурсия!
        Laravel обнаруживает бесконечную рекурсию и возвращает 0 или null чтобы предотвратить бесконечный цикл
    */
    
    /**
     * Все цены себестоимости (история)
     */
    public function costPrices()
    {
        return $this->hasMany(Price::class)
            ->where('price_type_id', Price::TYPE_COST)
            ->orderBy('created_at', 'desc');
    }

    /* Получить данные по отстакам на продукт. */
    public function productReport() {
        return $this->hasOne(ProductReport::class);
    }

    /* Получить ссылку на src - изображения, которое используем при оформлении товара. */
    public function getImgSrcAttribute() {                          // Объявление accessor в модели
        // как работает: отношение с получением значения:
        // $this - это текущий продукт
        $image = $this->hasOne(Image::class)->orderBy('created_at')->first();
        return $image ? $image->img_link : null;

        /* Использование:
                $baseName = $product->img_src; // Обратить внимание на snake_case!!!
                Laravel автоматически преобразует вызов $product->img_src в вызов метода getImgSrcAttribute() благодаря соглашению:
                get + ImgSrc + Attribute = getImgSrcAttribute()

                Что происходит при обращении: $baseName = $product->img_src; -> превращается в: $baseName = $product->getImgSrcAttribute();
                // Который выполняет:
                    $image = $product->hasOne(Image::class)->orderBy('created_at')->first();
                    $baseName = $image ? $image->img_link : null;
        */
        
        // как НЕ работает!!!:  return $this->hasOne(Image::class)->orderBy('created_at')->img_link;  // именно первая ссылка - это м.б. даже без расширения, просто базовое имя
        // $this->hasOne(Image::class) возвращает объект отношения, а не саму модель Image.
    }

    // Более правильный вариант (наверное):
    public function getBaseImagePathAttribute() {
        // Используем уже загруженное отношение (если есть) - пока нету... подумаем...
        /* if ($this->relationLoaded('firstImage')) {
            return $this->firstImage->img_link;
        }*/
        
        // Или загружаем первую картинку - тоже нет пока...
        /* $image = $this->images()->orderBy('created_at')->first();
        return $image ? $image->img_link : null;*/
    }

    /* Получить ссылки на изображение для карточки товара. */
    public function productMainImage() {
        return $this->hasOne(Image::class)->ofMany([                // $this->hasOne(Image::class) возвращает объект отношения, а не саму модель Image.
            'id' => 'max',
        ], function ($query) {
            $query->where('img_main', '=', 1);
        });
    }

    /* Получить ссылки на изображение для витрины каталога. */
    public function productShowCaseImage() {
        return $this->hasOne(Image::class)->ofMany([
            'id' => 'max',
        ], function ($query) {
            $query->where('img_showcase', '=', 1);
        });
    }

    /* Получить ссылки на промо-изображения для карточки товара. */
    public function productPromoImages() {
        return $this->hasMany(Image::class)->where('img_promo', '=', 1);
    }

    /* Получить ссылки на промо-изображения для карточки товара. */
    public function productCardImgOrients() {
        return $this->belongsToMany(ImgOrient::class, 'images')->wherePivot('img_main', '1');
    }

    # Связь многие ко многим: Каждый товар принадлежит многим свойствам (связываем через промежуточную таблицу связи product_property). Пропишем эту связь через отношение belongsToMany:
    public function properties() {
        return $this->belongsToMany(Property::class);
    }

    // получить пользователей, которые смотрели данный товар - вернёт коллекцию записей 
    public function recentlyViewedByUsers() {
        // Товар просмотрен многими пользователями (через записи)
        return $this->hasMany(RecentlyViewedProduct::class);
    }

    /** Получить все заказы, где есть товар (через связанную таблицу order_items)
     *  Связь: Товар → Заказы (многие-ко-многим)
     * - ON DELETE CASCADE    -- Удаляем позиции заказа, если удалён сам заказ (для order_id: если заказ удалён, его позиции не нужны).
     * - ON UPDATE CASCADE;   -- Обновляем order_id, если изменился id заказа
     */
    public function orders() {
        // -- Для связи с orders: CONSTRAINT `fk_order_items_order`FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) 
        // Order::class	Модель товара	Указывает, с какой сущностью связываемся. 'order_items'	Промежуточная таблица. 'order_id'	Внешний ключ в order_items (Поле, ссылающееся на orders.id). 'product_id'	Внешний ключ в order_items (Поле, ссылающееся на products.id)
        return $this->belongsToMany(Order::class, 'order_items', 'product_id', 'order_id')
            ->withPivot('quantity', 'price', 'regular_price')
            ->withTimestamps();                                                   // Если есть created_at/updated_at;
    }

    /**
     * Получить все позиции заказов, где фигурирует этот товар
     * (Связь "один товар → много записей в order_items")
     */
    public function orderItems() {
        return $this->hasMany(OrderItem::class);        // Один товар → много записей в заказах (история продаж)
    }

    /** 1. Аналитика продаж:
     *  $product = Product::find(1); $totalSold = $product->orderItems()->sum('quantity');
     * 
     *  2. Получить все заказы с этим товаром:
     *  $orders = $product->orderItems()
     *     ->with('order') // Жадная загрузка
     *     ->get()
     *     ->pluck('order'); // Коллекция заказов
     * 
     *  3. Популярные товары:
     *  Product::withCount('orderItems')
     *     ->orderByDesc('order_items_count')
     *     ->limit(5)
     *     ->get();
     */

    # таблица товаров products, в который каждый продукт связан со своим статусом, прописываем связь:
    public function status() {
        return $this->belongsTo(ProductStatus::class);
    }

    // Изменить стату продукта/товара (product_status_id)
    public function changeStatus(int $newStatusId): bool {
        return DB::transaction(function () use ($newStatusId) {
            return $this->update(['product_status_id' => $newStatusId]);
        });
    }

    // Дополнительный хелпер для проверки статуса
    public function isDraft(): bool {
        return $this->product_status_id === ProductStatus::DRAFT;
    }

    // Получить все видео для товара
    public function videos() {
        return $this->belongsToMany(Video::class, 'product_video');
    }

    /**
     * Получить себестоимость товара на определенную дату
     */
    public function getCostPriceAtDate(Carbon $date): float
    {
        return Price::where('product_id', $this->id)
            ->where('price_type_id', Price::TYPE_COST)
            ->where('date_start', '<=', $date)
            ->where(function($q) use ($date) {
                $q->where('date_end', '>=', $date)
                  ->orWhereNull('date_end');
            })
            ->orderBy('date_start', 'desc')
            ->value('price_value') ?? 0;
    }
    
    /**
     * Получить текущую себестоимость (синтаксический сахар)
     */
    public function getCurrentCostPriceAttribute(): float
    {
        return $this->getCostPriceAtDate(now());
    }
   
    // Получить все себестоимости за период
    public function getCostPricesInPeriod(Carbon $startDate, Carbon $endDate): Collection
    {
        return Price::where('product_id', $this->id)
            ->where('price_type_id', Price::TYPE_COST)
            ->where(function($q) use ($startDate, $endDate) {
                $q->whereBetween('date_start', [$startDate, $endDate])
                ->orWhereBetween('date_end', [$startDate, $endDate])
                ->orWhere(function($q2) use ($startDate, $endDate) {
                    $q2->where('date_start', '<=', $startDate)
                        ->whereNull('date_end');
                });
            })
            ->orderBy('date_start')
            ->get();
    }

    // Комплектующие этого товара (как собираемого) 
    // product_kit_components: product_id - собираемый товар (клюшка), component_id - комплектующая (рукоятка, крюк)
    public function kitComponents(): HasMany
    {
        return $this->hasMany(ProductKitComponent::class, 'product_id');
    }

    // В каких товарах этот продукт используется как комплектующая
    public function usedAsComponentIn(): HasMany  
    {
        return $this->hasMany(ProductKitComponent::class, 'component_id');
    }

    // Проверить можно ли собрать товар
    public function canBeAssembled(int $quantity = 1): bool
    {
        // Используем отношение - kitComponents
            if ($this->kitComponents->isEmpty()) {
            return false;
        }

        return $this->kitComponents->every(function ($kitComponent) use ($quantity) {
            return $kitComponent->isAvailable($quantity);
        });
    }

    // Детальная проверка доступности - ИСПРАВЛЕННАЯ
    public function getAssemblyAvailability(int $quantity = 1): array
    {
        $availability = [
            'can_assemble' => true,
            'missing_components' => [],
            'total_components' => $this->kitComponents->count() // правильное отношение!
        ];

        foreach ($this->kitComponents as $kitComponent) {
            if (!$kitComponent->isAvailable($quantity)) {
                $availability['can_assemble'] = false;
                $availability['missing_components'][] = [
                    'component' => $kitComponent->component,
                    'required' => $kitComponent->quantity * $quantity,
                    'available' => $kitComponent->component->productReport->in_stock ?? 0,
                    'missing' => $kitComponent->getMissingQuantity($quantity)
                ];
            }
        }

        return $availability;
    }

    // Отношение к товарам, где этот продукт является комплектующей  
    public function usedInKits(): HasMany
    {
        return $this->hasMany(ProductKitComponent::class, 'component_id');
    }

    // Получить себестоимость сборки
    public function getAssemblyCost(): float
    {
        return $this->productKits->sum(function ($kitComponent) {
            return $kitComponent->getComponentCost();
        });
    }

    public function reviews(): HasMany {
        return $this->hasMany(Review::class);
    }

    public function approvedReviews(): HasMany {
        return $this->hasMany(Review::class)->approved();
    }

    /**
     * Обновление статистики товара с учетом нового отзыва
     */
    public function updateRatingStats(?int $newRating = null, ?string $operation = 'add'): void {

        // Получаем или создаем запись в product_reports
        $report = $this->productReport ?? new ProductReport();
        \Log::debug('✅ Полученный/созданнный productReport', [
            '$report' => $report,
        ]);

        // Если передан новый рейтинг - пересчитываем на лету
        if ($newRating !== null) {
            $this->updateStatsWithNewRating($report, $newRating, $operation);
        } else {
            // Иначе считаем из БД (для миграций и т.д.)
            $this->updateStatsFromDatabase($report);
        }
        
        $report->save();

        \Log::debug('✅ Статистика обновлена', [
            'product_id' => $this->id,
            'total_reviews' => $report->total_reviews,
            'average_rating' => $report->average_rating,
            'new_rating' => $newRating,
            'operation' => $operation,
        ]);

        /*// Получаем статистику по ОДОБРЕННЫМ отзывам
        $stats = $this->approvedReviews()
            ->selectRaw('
                COUNT(*) as total_reviews,
                AVG(rating) as average_rating,
                COUNT(CASE WHEN rating = 5 THEN 1 END) as rating_5,
                COUNT(CASE WHEN rating = 4 THEN 1 END) as rating_4,
                COUNT(CASE WHEN rating = 3 THEN 1 END) as rating_3,
                COUNT(CASE WHEN rating = 2 THEN 1 END) as rating_2,
                COUNT(CASE WHEN rating = 1 THEN 1 END) as rating_1,
                COUNT(CASE WHEN EXISTS (SELECT 1 FROM review_media WHERE review_media.review_id = reviews.id AND review_media.is_approved = 1) THEN 1 END) as reviews_with_media,
                COUNT(CASE WHEN is_verified = 1 THEN 1 END) as verified_reviews, !!! verified_reviews - поле удалено из БД !!!
                MAX(created_at) as last_review_date
            ')
            ->first();

            \Log::debug('📊 Статистика из БД. Модель Product.updateRatingStats', [
                'product_id' => $this->id,
                'total_reviews' => $stats->total_reviews ?? 'NULL',
                'average_rating' => $stats->average_rating ?? 'NULL',
                'rating_5' => $stats->rating_5 ?? 'NULL',
                'rating_4' => $stats->rating_4 ?? 'NULL',
                'rating_3' => $stats->rating_3 ?? 'NULL',
                'rating_2' => $stats->rating_2 ?? 'NULL', 
                'rating_1' => $stats->rating_1 ?? 'NULL',
                'reviews_with_media' => $stats->reviews_with_media ?? 'NULL',
                'last_review_date' => $stats->last_review_date ?? 'NULL',
            ]);

            // Проверим сколько всего отзывов у товара (включая pending)
            $allReviewsCount = $this->reviews()->count();
            $approvedReviewsCount = $this->approvedReviews()->count();
            $pendingReviewsCount = $this->reviews()->where('status', 'pending')->count();

            Log::debug('🔍 Общая статистика отзывов. Модель Product.updateRatingStats', [
                'product_id' => $this->id,
                'all_reviews_count' => $allReviewsCount,
                'pending_reviews_count' => $pendingReviewsCount,
            ]);

        $reportData = [
            'product_id' => $this->id,
            'total_reviews' => $stats->total_reviews ?? 0,
            'average_rating' => $stats->average_rating ?? 0,
            'rating_5' => $stats->rating_5 ?? 0,
            'rating_4' => $stats->rating_4 ?? 0,
            'rating_3' => $stats->rating_3 ?? 0,
            'rating_2' => $stats->rating_2 ?? 0,
            'rating_1' => $stats->rating_1 ?? 0,
            'reviews_with_media' => $stats->reviews_with_media ?? 0,
            'last_review_date' => $stats->last_review_date,
        ];

        Log::debug('💾 Данные для сохранения в product_reports', $reportData);

        $report->fill($reportData)->save();

        Log::debug('✅ ProductReport сохранен', [
            'product_id' => $this->id,
            'report_id' => $report->id,
            'total_reviews' => $report->total_reviews,
            'average_rating' => round($report->average_rating, 2),
        ]);

        // Проверим что действительно сохранилось в БД
        $savedReport = ProductReport::where('product_id', $this->id)->first();
        Log::debug('📋 Проверка сохраненных данных', [
            'product_id' => $this->id,
            'saved_total_reviews' => $savedReport->total_reviews ?? 'NOT_FOUND',
            'saved_average_rating' => $savedReport->average_rating ?? 'NOT_FOUND',
        ]);*/
    }

    /**
     * Пересчет статистики с учетом нового отзыва
     */
    private function updateStatsWithNewRating(ProductReport $report, int $newRating, string $operation): void {
        $currentTotal = $report->total_reviews ?? 0;
        $currentAverage = $report->average_rating ?? 0;
        $currentRatings = [
            5 => $report->rating_5 ?? 0,
            4 => $report->rating_4 ?? 0, 
            3 => $report->rating_3 ?? 0,
            2 => $report->rating_2 ?? 0,
            1 => $report->rating_1 ?? 0,
        ];
        
        \Log::debug('🔢 Пересчет статистики', [
            'current_total' => $currentTotal,
            'current_average' => $currentAverage,
            'current_ratings' => $currentRatings,
            'new_rating' => $newRating,
            'operation' => $operation,
        ]);

        if ($operation === 'add') {
            // Добавляем новый отзыв
            $newTotal = $currentTotal + 1;
            $newSum = ($currentAverage * $currentTotal) + $newRating;
            $newAverage = $newTotal > 0 ? $newSum / $newTotal : 0;
            
            // Обновляем распределение рейтингов
            $currentRatings[$newRating]++;
            
            $report->fill([
                'product_id' => $this->id,
                'total_reviews' => $newTotal,
                'average_rating' => $newAverage,
                'rating_5' => $currentRatings[5],
                'rating_4' => $currentRatings[4],
                'rating_3' => $currentRatings[3],
                'rating_2' => $currentRatings[2],
                'rating_1' => $currentRatings[1],
                'reviews_with_media' => $report->reviews_with_media ?? 0, // пока не меняем
                'last_review_date' => now(),
            ]);

        } elseif ($operation === 'remove') {
            // Удаляем отзыв (для будущего использования)
            $newTotal = max(0, $currentTotal - 1);
            $newSum = ($currentAverage * $currentTotal) - $newRating;
            $newAverage = $newTotal > 0 ? $newSum / $newTotal : 0;
            
            $currentRatings[$newRating] = max(0, $currentRatings[$newRating] - 1);
            
            $report->fill([
                // ... аналогично add но с вычитанием
            ]);
        }
    }

    /**
     * Обновление статистики из БД (резервный вариант)
     */
    private function updateStatsFromDatabase(ProductReport $report): void {
        $stats = $this->reviews() // считаем все отзывы для тестирования
        // $stats = $this->approvedReviews()
            ->selectRaw('
                COUNT(*) as total_reviews,
                AVG(rating) as average_rating,
                COUNT(CASE WHEN rating = 5 THEN 1 END) as rating_5,
                COUNT(CASE WHEN rating = 4 THEN 1 END) as rating_4,
                COUNT(CASE WHEN rating = 3 THEN 1 END) as rating_3,
                COUNT(CASE WHEN rating = 2 THEN 1 END) as rating_2,
                COUNT(CASE WHEN rating = 1 THEN 1 END) as rating_1,
                COUNT(CASE WHEN EXISTS (SELECT 1 FROM review_media WHERE review_media.review_id = reviews.id AND review_media.is_approved = 1) THEN 1 END) as reviews_with_media,
                MAX(created_at) as last_review_date
            ')
            ->first();

        $report->fill([
            'product_id' => $this->id,
            'total_reviews' => $stats->total_reviews ?? 0,
            'average_rating' => $stats->average_rating ?? 0,
            'rating_5' => $stats->rating_5 ?? 0,
            'rating_4' => $stats->rating_4 ?? 0,
            'rating_3' => $stats->rating_3 ?? 0,
            'rating_2' => $stats->rating_2 ?? 0,
            'rating_1' => $stats->rating_1 ?? 0,
            'reviews_with_media' => $stats->reviews_with_media ?? 0,
            'last_review_date' => $stats->last_review_date,
        ]);
    }

    /**
     * Обновление счетчика отзывов с медиа
     */
    public function incrementReviewsWithMedia(): void
    {
        $report = $this->productReport;
        if (!$report) {
            $report = new ProductReport(['product_id' => $this->id]);
        }
        
        $report->reviews_with_media = ($report->reviews_with_media ?? 0) + 1;
        $report->save();

        \Log::debug('📸 Увеличиваем счетчик отзывов с медиа', [
            'product_id' => $this->id,
            'new_count' => $report->reviews_with_media,
        ]);
    }

    // Accessor для рейтинга
    public function getAverageRatingAttribute($value): float
    {
        return round($value, 1);
    }
}
