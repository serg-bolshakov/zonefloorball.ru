<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientRank extends Model
{
    use HasFactory;

    /* Получить всех пользователей данного ранга. */
    public function users()
    {
        return $this->hasMany(User::class, 'client_rank_id');
    }


}