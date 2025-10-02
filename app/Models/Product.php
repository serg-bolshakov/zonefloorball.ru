<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; 

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
    public function actualPrice() {
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
    }

    /* Получить базовую (РРЦ) цену на продукт. */
    public function regularPrice() {
        return $this->hasOne(Price::class)->ofMany([
            'id' => 'max',
        ], function ($query) {
            $query->where('price_type_id', '=', 2);
        });
    }

    /* Получить цену на продукт на условиях предзаказа. */
    public function preorderPrice() {
        return $this->hasOne(Price::class)->ofMany([
            'id' => 'max',
        ], function ($query) {
            $query->where(function ($q) {
                $q->where('date_end', '>', now())
                ->orWhereNull('date_end');
            })->where(function ($q) {
                $q->where('price_type_id', Price::TYPE_PREORDER);
            });
        });
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
}
