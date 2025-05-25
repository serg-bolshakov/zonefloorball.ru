<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
 

class Product extends Model
{
    use HasFactory;

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
            $query->where('date_end', '>', now())
                ->orWhereNull('date_end');
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

    /* Получить данные по отстакам на продукт. */
    public function productReport() {
        return $this->hasOne(ProductReport::class);
    }

    /* Получить ссылки на изображение для карточки товара. */
    public function productMainImage() {
        return $this->hasOne(Image::class)->ofMany([
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

}
