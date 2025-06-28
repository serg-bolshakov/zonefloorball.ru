<?php

namespace App\Http\Controllers;

use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;
use App\Models\Category;
use App\Traits\CategoryTrait;
use Inertia\Inertia;

class SiteMapController extends Controller
{
    use CategoryTrait;

    public function index()
    {
        $categories = $this->getMenuCategories(); // Получаем все категории c подкатегориями...
        // return view('sitemap', compact('categories'));
        return Inertia::render('SiteMap', [
            'title' => 'Карта сайта',
            'robots' => 'INDEX,FOLLOW',
            'description' => 'Карта сайта интернет-магазина флорбольной экипировки',
            'keywords' => 'флорбол флорбольная экипировка всё для флорбола unihoc zone юнихок алетерс зоун',
            'categories' => $categories
        ]);
    }
}