<?php
// app/Models/ReviewResponse.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReviewResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'review_id',
        'author_id',
        'response',
        'is_visible',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
    ];

    public function review(): BelongsTo {
        return $this->belongsTo(Review::class);
    }

    public function admin(): BelongsTo {
        return $this->belongsTo(User::class, 'author_id');
    }
}