<?php
// app/Models/ReviewMedia.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReviewMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'review_id',
        'file_path',
        'file_name',
        'mime_type',
        'size',
        'type',
        'thumbnail_path',
        'is_approved',
        'rejection_reason',
        'order_index',
        'metadata',
    ];

    protected $casts = [
        'size' => 'integer',
        'is_approved' => 'boolean',
        'metadata' => 'array',
        'order_index' => 'integer',
    ];

    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class);
    }

    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->thumbnail_path ? asset('storage/' . $this->thumbnail_path) : null;
    }

    public function isImage(): bool
    {
        return $this->type === 'image';
    }

    public function isVideo(): bool
    {
        return $this->type === 'video';
    }
}