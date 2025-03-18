<?php
// app/Services/Catalog/CategoryService.php
namespace App\Services\Catalog;

use Illuminate\Support\Facades\DB;

class CategoryService
{
    public function getCategoryInfo(string $urlSemantic): ?object
    {
        return DB::table('categories')
            ->where('url_semantic', '=', $urlSemantic)
            ->first();
    }
}