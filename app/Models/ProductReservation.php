<?php
    // app/Models/ProductReservation.php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Factories\HasFactory;
    use Illuminate\Database\Eloquent\Model;

    class ProductReservation extends Model
    {
        use HasFactory;

        protected $fillable = [
            'product_id', 
            'order_id',
            'quantity',
            'expires_at',
            'cancelled_at'
        ];

        public function order() {
            return $this->belongsTo(Order::class);      // Каждая позиция принадлежит одному заказу
        }

        public function product() {
            return $this->belongsTo(Product::class);    // Каждая позиция ссылается на один товар
        }
    
        protected $casts = [
            'expires_at' => 'datetime',
            'cancelled_at' => 'datetime'
        ];

        // Scope для просроченных
        public function scopeExpired($query) {
            return $query->whereNull('cancelled_at')
                ->where('expires_at', '<=', now());
        }

        // Scope для активных резервов
        public function scopeActive($query) {
            return $query->whereNull('cancelled_at')
                ->where('expires_at', '>', now());
        }

    }