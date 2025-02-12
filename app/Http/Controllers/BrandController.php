<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB; // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды

use Illuminate\Http\Request;
use App\Models\Brand;   // подключаем класс модели к контроллеру, теперь мы можем использовать эту модель внутри методов контроллера...

class BrandController extends Controller
{
    public function show() {
        $brands = Brand::all();
        foreach($brands as $brand) {
            //dump($brand->brand_view);    
        }
        $brand = Brand::find([1,2]);
        return $brand;
    }
}
