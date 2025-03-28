<?php
// app/Services/Catalog/GripFilterCatalogService.php - Сервис для обмоток
namespace App\Services\Catalog;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class GripFilterCatalogService extends BaseFilterCatalogService
{
    public function applyFilters(array $filters): Builder
    {
        // Категория товаров Крюк для флорбольной клюшки
        $this->query->where('category_id', '=', 6);

        // вызываем родительский метод для фильтрации категории товаров по бренду:
        $this->applyBrandFilter($filters);

        // Фильтры для обмоток

        return $this->query;
    }
}