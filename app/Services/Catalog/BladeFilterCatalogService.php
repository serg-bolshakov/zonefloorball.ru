<?php
// app/Services/Catalog/BladeFilterCatalogService.php - Сервис для крюков
namespace App\Services\Catalog;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class BladeFilterCatalogService extends BaseFilterCatalogService
{
    public function applyFilters(array $filters): Builder
    {
        // Категория товаров Крюк для флорбольной клюшки
        $this->query->where('category_id', '=', 2);

        // вызываем родительский метод для фильтрации категории товаров по бренду:
        $this->applyBrandFilter($filters);

        // Фильтры для крюков

        if (isset($filters['hook_blade']) && !empty($filters['hook_blade'])) {
            $filterHookBladeSet = [];
            foreach($filters['hook_blade'] as $filter) {
                $propId = DB::table('properties')->where('prop_title', '=', 'hook_blade')->where('prop_value', 'LIKE', $filter)->value('id'); 
                $filterHookBladeSet[] = $propId;
            }
            
            $prodIds = DB::table('product_property')->select('product_id')->whereIn('property_id', $filterHookBladeSet)->get();
            if(!empty($prodIds)) {
                foreach ($prodIds as $prodId) {
                    $filterHookBladeProdIds[] = $prodId->product_id;
                }

                $this->query->whereIn('id', $filterHookBladeProdIds);
            }
        }

        if(isset($filters['blade_stiffness']) && !empty($filters['blade_stiffness'])) {
            $filterBladeStiffnessProdIds = [];
            foreach($filters['blade_stiffness'] as $filter) {
                $propId = DB::table('properties')->where('prop_title', '=', 'blade_stiffness')->where('prop_value', 'LIKE', $filter)->value('id'); 
                $filterBladeStiffnessPropIds[] = $propId;
            }

            if(!empty($filterBladeStiffnessPropIds)) {
                $prodIds = DB::table('product_property')->select('product_id')->whereIn('property_id', $filterBladeStiffnessPropIds)->get();
                if(!empty($prodIds)) {
                    foreach ($prodIds as $prodId) {
                        $filterBladeStiffnessProdIds[] = $prodId->product_id;
                    }
                    
                    $this->query->whereIn('id', $filterBladeStiffnessProdIds);
                }
            }
        }
        
        return $this->query;
    }
}