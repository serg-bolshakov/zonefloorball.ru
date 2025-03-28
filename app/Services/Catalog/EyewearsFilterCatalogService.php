<?php
// app/Services/Catalog/EyewearsFilterCatalogService.php - Сервис для очков
namespace App\Services\Catalog;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class EyewearsFilterCatalogService extends BaseFilterCatalogService
{
    public function applyFilters(array $filters): Builder
    {
        // Категория товаров Очки для флорбола
        $this->query->where('category_id', '=', 7);

        // вызываем родительский метод для фильтрации категории товаров по бренду:
        $this->applyBrandFilter($filters);

        // Фильтры для очков

        if(isset($filters['size']) && !empty($filters['size'])) {
            
            $filtersSet = [];
            foreach($filters['size'] as $filter) {
                $sizeId = DB::table('sizes')->where('size_title', '=', 'eyewears')->where('size_value', 'LIKE', $filter)->value('id'); 
                $filtersSet[] = $sizeId;
            }
            
            if(!empty($filtersSet)) {
                $this->query->whereIn('size_id', $filtersSet);
            }
        }
        
        return $this->query;
    }
}