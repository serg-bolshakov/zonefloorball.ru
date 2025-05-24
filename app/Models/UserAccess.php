<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAccess extends Model
{
    use HasFactory;

    /* Получить всех пользователей с данными правами доступа. */
    public function users() {
        return $this->hasMany(User::class, 'user_access_id');
    }
    // Где: User::class — модель, с которой связываем. user_access_id — поле в таблице users, указывающее на user_accesses.id.

}