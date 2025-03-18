<?php
// app/Services/Catalog/GeneralCatalogService.php
namespace App\Services\Catalog;

use Illuminate\Database\Eloquent\Builder;

class GeneralCatalogService extends BaseFilterCatalogService
{
    public function applyFilters(array $filters): Builder
    {
        // Здесь можно добавить дополнительные фильтры для общего каталога, если нужно

        return $this->query;
    }
}