<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderStatus extends Model
{
    use HasFactory;

    // Каждый статус имеет много заказов, которые ссылаются на него. В модели со статусами делаем метод для получения заказов. Пропишем в этом методе связь через отношение hasMany:
    public function orders() {
        return $this->hasMany(Order::class);
    }

}