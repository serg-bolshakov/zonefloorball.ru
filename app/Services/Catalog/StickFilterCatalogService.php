<?php
// app/Services/Catalog/StickFilterCatalogService.php - Сервис для клюшек
namespace App\Services\Catalog;

use Illuminate\Database\Eloquent\Builder;

class StickFilterCatalogService extends BaseFilterCatalogService
{
    public function applyFilters(array $filters): Builder
    {
        // Фильтры для клюшек
        if (isset($filters['hook'])) {
            $this->query->whereIn('hook', (array)$filters['hook']);
        }

        if (isset($filters['size'])) {
            $this->query->whereIn('size_id', (array)$filters['size']);
        }

        if (isset($filters['shaft_flex'])) {
            $this->query->whereIn('shaft_flex_id', (array)$filters['shaft_flex']);
        }

        return $this->query;
    }
}