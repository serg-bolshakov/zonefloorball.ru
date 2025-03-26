<?php
// app/Services/Catalog/BallFilterCatalogService.php - Сервис для мячей
namespace App\Services\Catalog;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class BallFilterCatalogService extends BaseFilterCatalogService
{
    public function applyFilters(array $filters): Builder
    {
        // Категория товаров Крюк для флорбольной клюшки
        $this->query->where('category_id', '=', 3);

        // вызываем родительский метод для фильтрации категории товаров по бренду:
        $this->applyBrandFilter($filters);

        // Фильтры для мячей

        return $this->query;
    }
}