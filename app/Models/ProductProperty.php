<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductProperty extends Model {
    use HasFactory;

    // Указываем имя таблицы явно
    protected $table = 'product_property';
    
    // Отключаем авто-таймстампы если их нет в таблице
    // public $timestamps = false;                      // добавили
    
    protected $fillable = [
        'product_id',
        'property_id', 
        'author_id',
        'created_at',
        'archieved' 
    ];

    public function product() {
        return $this->belongsTo(Product::class);
    }

    public function property() {
        return $this->belongsTo(Property::class);
    }
}
