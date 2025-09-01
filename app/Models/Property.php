<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'brand_id',
        'prop_title',
        'unit',
        'prop_value',
        'prop_value_view',
        'prop_url_semantic',
        'prop_description',
        'archived',
        'author_id'
    ];

    // protected $casts = [
    //     'archived' => 'boolean',
    // ];

    // Дефолтные значения:

    protected $attributes = [
        'archived' => false,
    ];

    // Связь с категорией
    public function category(): BelongsTo {
        return $this->belongsTo(Category::class);
    }

    // Связь с брендом
    public function brand(): BelongsTo {
        return $this->belongsTo(Brand::class);
    }

    // Связь с пользователем (автором)
    public function author(): BelongsTo {
        return $this->belongsTo(User::class, 'author_id');
    }

    # Связь многие ко многим: каждое свойство принадлежит многим товарам (связываем через промежуточную таблицу связи product_property). Пропишем эту связь через отношение belongsToMany:
    public function products() {
        return $this->belongsToMany(Product::class);
    }

    /* Получить коллекции, которым принадлежит товар для карточки товара. */
    public function propCollection() {
        return $this->belongsToMany(Product::class)->where('prop_title', 'LIKE', 'collection');
    }

    // Scope для фильтрации по prop_title
    public function scopeOfType($query, string $type) {
        return $query->where('prop_title', $type);
    }

    // Scope для получения только активных свойств
    public function scopeActive($query) {
        return $query->where('archived', false)->orWhereNull('archived');
    }
}
