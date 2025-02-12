<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB; // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды

use Illuminate\Http\Request;
use App\Models\Property;   // подключаем класс модели к контроллеру, теперь мы можем использовать эту модель внутри методов контроллера...

class PropertyController extends Controller
{
    // Получим свойство вместе с его товарами:
    public function show() {
        $property = Property::find(20);
        dump($property->products);
    }
}
