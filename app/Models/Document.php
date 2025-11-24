<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model {
    use HasFactory;

    protected $table = 'documents';

    protected $fillable = [
        'uuid',
        'document_type_id',
        'document_number',
        'document_date',
        'status',
        'warehouse_id',
        'user_id',
        'total_amount',
        'comment',
        'posted_at',
        'created_by',
        'posted_by'
    ];

    protected $casts = [
        'document_date' => 'date',
        'posted_at' => 'datetime',
        'total_amount' => 'float', // ✅ целые рубли!
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Отношения
    public function items(): HasMany {
        return $this->hasMany(DocumentItem::class, 'document_id');
    }

    public function movements(): HasMany {
        return $this->hasMany(StockMovement::class, 'document_id');
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function createdBy(): BelongsTo {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function postedBy(): BelongsTo {
        return $this->belongsTo(User::class, 'posted_by');
    }

    public function documentType(): BelongsTo {
        return $this->belongsTo(DocumentType::class, 'document_type_id');
    }

    // Scopes
    public function scopeDraft($query) {
        return $query->where('status', 'draft');
    }

    public function scopePosted($query) {
        return $query->where('status', 'posted');
    }

    public function scopeCancelled($query) {
        return $query->where('status', 'cancelled');
    }

    // Методы бизнес-логики
    public function canBePosted(): bool {
        return $this->status === 'draft' && $this->items()->exists();
    }

    public function getTotalQuantityAttribute(): int {
        return $this->items->sum('quantity');
    }
}
