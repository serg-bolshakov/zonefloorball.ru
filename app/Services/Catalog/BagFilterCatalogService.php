<?php
// app/Services/Catalog/BagFilterCatalogService.php - Сервис для сумок и чехлов
namespace App\Services\Catalog;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

use App\Traits\CategoryTrait;

class BagFilterCatalogService extends BaseFilterCatalogService
{
    use CategoryTrait;

    public function applyFilters(array $filters): Builder
    {
        // Категория товаров сумки и чухлы - это "материнская" категория, у которой parent_id = NULL и в которой могут быть: Сумки спортивные / Чехлы для клюшек / Сумки для мячей... а сама может быть пустой...
        // $this->query->where('category_id', '=', 5);
        
        $requestMainCategoryWithSubCats = $this->getCategoryProducts(5);
        if(!empty($requestMainCategoryWithSubCats)) {
            $this->query->whereIn('category_id', $requestMainCategoryWithSubCats);
        } 

        // вызываем родительский метод для фильтрации категории товаров по бренду:
        $this->applyBrandFilter($filters);

        // Фильтры для сумок и чехлов:

        return $this->query;
    }
}