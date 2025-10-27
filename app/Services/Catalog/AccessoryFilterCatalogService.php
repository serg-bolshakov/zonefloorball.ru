<?php
// app/Services/Catalog/AccessoryFilterCatalogService.php - Сервис для аксессуаров
namespace App\Services\Catalog;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class AccessoryFilterCatalogService extends BaseFilterCatalogService
{
    public function applyFilters(array $filters): Builder
    {
        // Категория товаров Аксессуары
        $this->query->where('category_id', '=', 22);

        // вызываем родительский метод для фильтрации категории товаров по бренду:
        $this->applyBrandFilter($filters);

        // Фильтры для аксессуаров

        return $this->query;
    }
}