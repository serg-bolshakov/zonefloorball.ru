<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB; // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды

use Illuminate\Http\Request;
use App\Models\Product;   // подключаем класс модели к контроллеру, теперь мы можем использовать эту модель внутри методов контроллера...

class ProductController extends Controller
{
    public function show() {
        // $product = Product::find(1);
        // dump($product);
        // dump($product->category);

        /* - в этом случае в каждой итерации цикла будут выполняться "лишниу" SQL-запросы:

        $products = Product::all();
        foreach($products as $product) {
            // dump($product);
            // dump($product->category);
            // dump($product->brand);
        }

        */

        # с помощью метода with заранее подгружаем две связанные модели и в этом случае при переборе товаров не будет обращений к БД при каждой итерации цикла:
        $products = Product::with(['category', 'brand'])->get();
        foreach ($products as $product) {
            dump($product);
            dump($product->category);
            dump($product->brand);    
        }

        # Получим продукт вместе с его свойствами (через промежуточную таблицу связи product-property)... и ведь работает! хотя эту промежуточную таблицу мы вообще нигде не упоминали - она просто есть...:
        $product = Product::find(7);
        dump($product->properties);
    }
}
