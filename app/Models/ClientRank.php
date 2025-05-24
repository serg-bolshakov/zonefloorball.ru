<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientRank extends Model
{
    use HasFactory;

    /* Получить всех пользователей данного ранга. */
    public function users() {
        return $this->hasMany(User::class, 'client_rank_id');
    }
    // Где: User::class — модель, с которой связываем. client_rank_id — поле в таблице users, указывающее на client_ranks.id.

}