<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB; // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды

use Illuminate\Http\Request;
use App\Models\Category;   // подключаем класс модели к контроллеру, теперь мы можем использовать эту модель внутри методов контроллера...


class CategoryController extends Controller
{
    # получим коллекцию категорий. Переберем ее циклом, для каждой категории получим коллекцию товаров и также переберем ее циклом:
    public function showAllCategories() {
        $categories = Category::all();

        foreach($categories as $category) {
            dump($category->category_view);

            foreach($category->products as $product) {
                dump($product->title);
            }
        }
    }
}
