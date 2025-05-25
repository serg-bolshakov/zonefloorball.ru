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

    /** Получить заказы определённого ранга пользователя
     *  Связь: Ранг пользователя → Заказы
     */
    # При вызове метода orders, Eloquent попытается найти модели Order, 
    # у которой есть order_client_rank_id, который соответствует столбцу id в модели ClientRank.
    public function orders() {
        // У ранга пользователя может быть много записей в таблице orders
        return $this->hasMany(Order::class, 'order_client_rank_id');
    }
}