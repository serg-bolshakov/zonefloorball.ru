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
}
