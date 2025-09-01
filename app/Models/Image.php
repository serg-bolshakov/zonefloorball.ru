<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Image extends Model {
    use HasFactory;

    // Отключаем авто-таймстампы если их нет в таблице, нет updated_at
    public $timestamps = false;                     
    
    protected $fillable = [
        'product_id',
        'img_link', 
        'img_main',
        'img_showcase',
        'img_promo',
        'img_orient_id',
        'author_id',
        'created_at',
    ];

    protected $casts = [
        'img_main' => 'boolean',
        'img_showcase' => 'boolean',
        'img_promo' => 'boolean',
    ];

    public function products() {
        return $this->belongsToMany(Product::class);
    }

    public function orient() {
        return $this->belongsTo(ImgOrient::class)->withDefault([
            'img_orient_id' => '2',
        ]);
    }
    
}