<?php
// app/Models/ProductReport.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductReport extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'product_id', 
        'in_stock',
        'on_sale',
        'reserved',
        'coming_soon',
        'expected_receipt_date',
        'on_preorder',
        'preordered',
        // Новые поля для отзывов
        'total_reviews',
        'average_rating',
        'rating_5',
        'rating_4', 
        'rating_3',
        'rating_2',
        'rating_1',
        'reviews_with_media',
        'last_review_date',
    ];

    protected $casts = [
        'expected_receipt_date' => 'date:Y-m-d',
        'in_stock' => 'integer',
        'on_sale' => 'integer',
        'reserved' => 'integer',
        'on_preorder' => 'integer',
        'preordered' => 'integer',
        // Кастинг новых полей
        'total_reviews' => 'integer',
        'average_rating' => 'decimal:2',
        'rating_5' => 'integer',
        'rating_4' => 'integer',
        'rating_3' => 'integer',
        'rating_2' => 'integer',
        'rating_1' => 'integer',
        'reviews_with_media' => 'integer',
        'last_review_date' => 'datetime',
    ];

    public function product() {
        return $this->belongsTo(Product::class);    // Каждая позиция ссылается на один товар
    }

    // Scope-методы для удобства
    public function scopeAvailable($query) {
        return $query->where('on_sale', '>', 0);
    }

    /* Пример использования: Получение доступных товаров
        $availableProducts = ProductReport::with('product')
            ->available()
            ->get();
    */

    public function scopeReserved($query) {
        return $query->where('reserved', '>', 0);
    }

    // Валидация в set-методах
    public function setOnSaleAttribute($value) {
        $this->attributes['on_sale'] = max(0, (int)$value);
    }

    // Методы для работы с рейтингами
    public function getRatingDistribution(): array
    {
        return [
            5 => $this->rating_5,
            4 => $this->rating_4,
            3 => $this->rating_3,
            2 => $this->rating_2,
            1 => $this->rating_1,
        ];
    }

    public function getRatingPercentage(int $rating): float
    {
        $total = $this->total_reviews;
        if ($total === 0) return 0;

        $ratingCount = $this->{"rating_{$rating}"} ?? 0;
        return round(($ratingCount / $total) * 100, 2);
    }

    public function hasReviews(): bool
    {
        return $this->total_reviews > 0;
    }

    public function getReviewsWithMediaPercentage(): float
    {
        if ($this->total_reviews === 0) return 0;
        return round(($this->reviews_with_media / $this->total_reviews) * 100, 2);
    }
}