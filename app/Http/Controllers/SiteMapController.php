<?php

namespace App\Http\Controllers;

use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;
use App\Models\Category;
use App\Traits\CategoryTrait;

class SiteMapController extends Controller
{
    use CategoryTrait;

    public function index()
    {
        $categories = $this->getMenuCategories(); // Получаем все категории c подкатегориями...
        // dd($categories);
        return view('sitemap', compact('categories'));
    }
}