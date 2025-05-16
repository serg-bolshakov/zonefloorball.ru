<?php
// app/Models/Favorite.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Favorite extends Model {
    use HasFactory;

    // protected $table = 'favorites';
    // protected $primaryKey = 'id';
    
    // Явно указываем, что timestamps есть
    // public $timestamps = true;
    
    // Указываем имена полей вручную
    // const CREATED_AT = 'created_at';
    // const UPDATED_AT = 'updated_at';
    
    protected $fillable = ['user_id', 'product_ids'];
    
    // protected $casts = [
    //     'product_ids' => 'array'
    // ];
    

    /* JSON-строка избранного принадлежит одному юзеру */
    public function user() {
        return $this->belongsTo(User::class);
        // return $this->belongsTo(User::class, 'id');
    }

}