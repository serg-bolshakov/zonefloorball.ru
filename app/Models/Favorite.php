<?php
// app/Models/Favorite.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Favorite extends Model {
    use HasFactory;

    protected $fillable = ['user_id', 'product_ids'];

    /*protected $casts = [
        'product_ids' => 'array'
    ];*/
        
    /**
     * Ошибка указывает на отсутствие updated_at, но ваша таблица его содержит
     * Проблема возникает только на продакшене
     * Локально всё работает
    */

    public $timestamps = true; // Явное указание (хотя и включено по умолчанию)

    /* JSON-строка избранного принадлежит одному юзеру */
    public function user() {
        return $this->belongsTo(User::class);
        // return $this->belongsTo(User::class, 'id');
    }

}