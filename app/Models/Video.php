<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Video extends Model {
    use HasFactory;

    // Отключаем авто-таймстампы если их нет в таблице, нет updated_at
    public $timestamps = false;                     
    
    protected $fillable = [
        'link',
        'poster', 
        'comment',
        'created_at',
    ];

    // Связь многие-ко-многим с товарами
    public function products() {
        return $this->belongsToMany(Product::class, 'product_video');
    }
}