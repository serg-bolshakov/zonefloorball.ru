<?php
// app/Models/CallbackRequest.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CallbackRequest extends Model {
    use HasFactory;

    protected $fillable = [
        'phone',
        'help_type',
        'ip_address',
        'status',
        'notes',
        'called_at'
    ];

    protected $casts = [
        // 'phone'         => 'encrypted', // шифруем телефон
        'called_at'     => 'datetime',
        'created_at'    => 'datetime',
        'updated_at'    => 'datetime'
    ];

    // Дополнительно: константы для статусов 
    const STATUS_NEW = 'new';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_DONE = 'done';
    const STATUS_CANCELLED = 'cancelled';

    // Scope для удобства 
    public function scopeNew($query) {
        return $query->where('status', self::STATUS_NEW);
    }
    
    public function scopeDone($query) {
        return $query->where('status', self::STATUS_DONE);
    }

    public static function getHelpTypes(): array {
        return [
            'ordering' => 'Помощь с оформлением заказа',
            'consultation' => 'Консультация по товару',
            'technical' => 'Техническая поддержка приложения', 
            'other' => 'Другой вопрос'
        ];
    }
    
    public function getHelpTypeTextAttribute(): string {
        return self::getHelpTypes()[$this->help_type] ?? 'Неизвестно';
    }
}