<?php
//  app/Services/Catalog/CatalogServiceFactory.php - Фабрика для выбора сервиса - выбирает нужный сервисный класс в зависимости от раздела каталога.

namespace App\Services\Catalog;

use Illuminate\Database\Eloquent\Builder;

class CatalogServiceFactory
{
    public static function create(?string $category, Builder $query): BaseFilterCatalogService
    {
        switch ($category) {
            case 'sticks':
                return new StickFilterCatalogService($query);
            case 'blades':
                return new BladeFilterCatalogService($query);
            case 'balls':
                return new BallFilterCatalogService($query);
            default:
                return new GeneralCatalogService($query);       // общий каталог товаров
        }
    }
}