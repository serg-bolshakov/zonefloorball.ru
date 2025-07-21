<?php
// app/Models/PendingPayment.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

use Illuminate\Database\Eloquent\Prunable;

class PendingPayment extends Model {
    
    use HasFactory, Prunable;

    protected $fillable = [
        'order_id',
        'mail_data', // Шифрованные данные письма  
        'token',     // Уникальный ключ для верификации
        'expires_at',  
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    // Связь с заказом
    public function order() {
        return $this->belongsTo(Order::class)->withTrashed();
    }

    // Автогенерация токена при создании
    protected static function booted() {
        static::creating(function ($model) {
            $model->token = Str::random(32);
        });
    }

    // Шифрование данных перед сохранением
    public function setMailDataAttribute($value)     {
        $this->attributes['mail_data'] = encrypt($value);
    }

    // Дешифровка при чтении
    public function getDecryptedMailDataAttribute() {
        return decrypt($this->mail_data);
    }

    // Проверка актуальности
    public function isExpired(): bool {
        return $this->expires_at->isPast();
    }

    // Поиск по токену
    public static function findByToken(string $token): ?self {
        return static::where('token', $token)->first();
    }

    // Очистка устаревших записей (в app/Console/Kernel.php):
    public function prunable() {
        return static::where('expires_at', '<', now()->subHours(24));
    }
}