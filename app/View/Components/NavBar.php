<?php

namespace App\View\Components;

use App\Traits\CategoryTrait;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class NavBar extends Component {

    use CategoryTrait;

    public function render(): View|Closure|string
    {
        $routeUri = $_SERVER['REQUEST_URI'];
        $routeUri = explode('?', $routeUri);
        $routeUri = $routeUri[0];

        $categoriesMenuArr = $this->getMenuCategories();
        $rows = [];

        $rows[] = '<li>' . $this->creatLink($routeUri, '/', 'Главная') . '</li><span class="nav-bar__ul-li"></span>';
        $rows[] = '<li>' . $this->creatLink($routeUri, '/products/catalog', 'Каталог') . '</li><span class="nav-bar__ul-li"></span>';
        
        foreach($categoriesMenuArr as $category) {
            if(isset($category[0])) {
                $urlSemantic = $category[0]->url_semantic;
                $rows[] = '<li>' . $this->creatLink($routeUri, '/products/'. $urlSemantic , $category[0]->category_view_2) . '</li><span class="nav-bar__ul-li"></span>';
            }
        }

        $rows[] = '<li class=' . $this->isProductCardLink() . '>' . $this->creatLink($routeUri, $_SERVER['REQUEST_URI'], '<span class="nav-bar__ul-li"></span> Карточка товара') . '</li>';
        
        return view('components.nav-bar', [
            'categoriesMenuArrAllBrands' => $rows
        ]);
    }

/*
    
    Исходим из того, что у нас есть чистые html - ссылки, в которых можно руками переопределять класс
    на каждой странице контента, но это можно делать когда страниц мало, а когда много? Писать руками на каждой странице? 
    
    Думаем: нужна функция, которая будет создавать эти ссылки, класс будем определять для той или иной ссылки 
    в зависимости от того на какой странице мы находимся.
    
    Решение: 
    1) Объявляем и пишем  функцию, которая будет создавать ссылки function creatLink()
    2) в качестве параметров ф-ия будет принимать href-ссылки и её текст (заговоловок) function creatLink ($href, $title)
    3) в результате выполнения действий ф-я должна либо вернуть, либо вывести через эхо ссылку
    4) Главное - это "закодить", чтобы класс эктив был у активной ссылки
    5) получаем текущий адрес страцицы из адресной строк - делаем с помощью суперглобальной переменной $_SERVER['REQUEST_URI']
    6) сравниваем с if... и если совпадает: применяем класс эктив, иначе - нет 

    function creatLink($href, $title) {
        if ($_SERVER['REQUEST_URI'] == $href) {
            echo "<a href=\"$href\" class=\"activeBreadcrumb\">$title</a>";
        } else echo "<a href=\"$href\">$title</a>";
    } 
    
    попробуем "упростить" ... введём переменную $class = 'class="activeBreadcrumb"'
    echo "<a href=\"$href\" class=\"activeBreadcrumb\">$title</a>";
    
*/

    function isProductCardLink() {
        $uri = $_SERVER['REQUEST_URI'];
        $basename = basename($uri);
        $basenameArtickleNumber = mb_substr($basename, 0, 5);
        if (is_numeric($basenameArtickleNumber)) {
            return '"breadcrumb-link__product-card-active"';
        } else {
            return '"breadcrumb-link__product-card"';
        }
    }
    
    function creatLink($routeUri, $href, $title) {

        $categoryUrlSemantic = (basename($routeUri));

        if ($categoryUrlSemantic == basename($href)) {
            $class = ' class="activeBreadcrumb"';
        }  else {
            $class = "";
        }
        return "<a href=\"$href\"$class>$title</a>";
    }
} 
