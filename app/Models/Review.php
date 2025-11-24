<?php
// app/Models/Review.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'user_id',
        'rating',
        'advantages',
        'disadvantages',
        'comment',
        'status',
        'is_verified',
        'moderator_comment',
        'helpful_count',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_verified' => 'boolean',
        'helpful_count' => 'integer',
        'created_at' => 'datetime',
    ];

    // Отношения
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function order(): BelongsTo {
        return $this->belongsTo(Order::class);
    }

    public function media(): HasMany {
        return $this->hasMany(ReviewMedia::class);
    }

    public function helpfulVotes(): HasMany
    {
        return $this->hasMany(ReviewHelpfulVote::class);
    }

    public function response(): HasOne
    {
        return $this->hasOne(ReviewResponse::class);
    }

    // Scope'ы
    public function scopeApproved($query) {
        \Log::debug('🔍 Scope approved вызван', [
            'sql' => $query->toSql(),
            'bindings' => $query->getBindings(),
        ]);
        return $query->where('status', 'approved');
    }

    public function scopePending($query) {
        return $query->where('status', 'pending');
    }

    public function scopeWithMedia($query) {
        return $query->whereHas('media', function ($q) {
            $q->where('is_approved', true);
        });
    }

    public function scopeVerifiedPurchase($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeForProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    // Методы
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function hasMedia(): bool {
        return $this->media()->where('is_approved', true)->exists();
    }

    // подход без not_helpful_count - пока нигде не используем... просто оставляем на будущее...
    public function getHelpfulScore(): float {
        // Понижаем вес старых отзывов
        $ageInDays = $this->created_at->diffInDays(now());
        $timeFactor = max(0.1, 1 - ($ageInDays / 365)); // Старые отзывы теряют до 90% веса
        
        return $this->helpful_count * $timeFactor;
    }

    // События
    // УДАЛЯЕМ события booted() - они дублируют логику
    /*
        protected static function booted()
        {
            static::created(function ($review) {
                // Обновляем рейтинг товара при создании отзыва
                $review->product->updateRatingStats();
            });

            static::updated(function ($review) {
                // Обновляем рейтинг товара при изменении отзыва
                if ($review->isDirty('rating') || $review->isDirty('status')) {
                    $review->product->updateRatingStats();
                }
            });

            static::deleted(function ($review) {
                // Обновляем рейтинг товара при удалении отзыва
                $review->product->updateRatingStats();
            });
        }
    */
}