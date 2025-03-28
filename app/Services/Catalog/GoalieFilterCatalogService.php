<?php
// app/Services/Catalog/GoalieFilterCatalogService.php - Сервис для вратарской экипировки
namespace App\Services\Catalog;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

use App\Traits\CategoryTrait;

class GoalieFilterCatalogService extends BaseFilterCatalogService
{
    use CategoryTrait;

    public function applyFilters(array $filters): Builder
    {
        // Категория вратарской экипировки - это "материнская" категория, у которой parent_id = NULL и в которой могут быть: Шлемы / Нагрудники / Баулы... а сама может быть пустой...
        // $this->query->where('category_id', '=', 8);
        
        $requestMainCategoryWithSubCats = $this->getCategoryProducts(8);
        
        if (isset($filters['category'])) {
            $filtersGoalieCategoriesSet = [];
            foreach($filters['category'] as $filter) {
                $categoryId = DB::table('categories')->where('url_semantic', '=', $filter)->value('id'); 
                $filtersGoalieCategoriesSet[] = $categoryId;
            }
            $this->query->whereIn('category_id', (array)$filtersGoalieCategoriesSet);
        } elseif (!empty($requestMainCategoryWithSubCats)) {
            $this->query->whereIn('category_id', (array)$requestMainCategoryWithSubCats);
        } 

        // вызываем родительский метод для фильтрации категории товаров по бренду:
        $this->applyBrandFilter($filters);

        // Фильтры для вратарской экипировки:

        return $this->query;
    }
}