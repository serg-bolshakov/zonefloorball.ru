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
                return new StickFilterCatalogService($query);       // каталог клюшек
            case 'blades':
                return new BladeFilterCatalogService($query);       // каталог крюков
            case 'balls':
                return new BallFilterCatalogService($query);        // каталог мячей
            case 'bags':
                return new BagFilterCatalogService($query);         // каталог сумок и чехлов
            case 'grips':
                return new GripFilterCatalogService($query);        // каталог обмоток
            case 'eyewears':
                return new EyewearsFilterCatalogService($query);    // каталог очков
            case 'goalie':
                return new GoalieFilterCatalogService($query);      // каталог вратарской экипировки
            default:
                return new GeneralCatalogService($query);           // общий каталог товаров
        }
    }
}