<?php
// app/Services/Catalog/StickFilterCatalogService.php - Сервис для клюшек
namespace App\Services\Catalog;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class StickFilterCatalogService extends BaseFilterCatalogService
{
    public function applyFilters(array $filters): Builder
    {
        // Категория товаров клюшек для флорбола
        $this->query->where('category_id', '=', 1);

        // Фильтры для клюшек
        if (isset($filters['hook'])) {
            $filterHookSticksIds = [];
            foreach($filters['hook'] as $filter) {
                $propId = DB::table('properties')->where('prop_title', '=', 'hook')->where('prop_value', 'LIKE', $filter)->value('id'); 
                $filterHookSticksIds[] = $propId;
            }

            if(!empty($filterHookSticksIds)) {
                $prodIds = DB::table('product_property')->select('product_id')->whereIn('property_id', $filterHookSticksIds)->get();
                foreach ($prodIds as $prodId) {
                    $filterHookStickProdIds[] = $prodId->product_id;
                }
    
                $this->query->whereIn('id', (array)$filterHookStickProdIds);
            }
        }

        if (isset($filters['size'])) {
            $filterStickSizesSet = [];
            foreach($filters['size'] as $filter) {
                $sizeId = DB::table('sizes')->where('size_title', '=', 'shaft_length')->where('size_value', '=', $filter)->value('id'); 
                $filterStickSizesSet[] = $sizeId;
            }
            $this->query->whereIn('size_id', (array)$filterStickSizesSet);
        }

        if (isset($filters['shaft_flex'])) {
            $filterStickShaftFlexProdIds = [];
            foreach($filters['shaft_flex'] as $filter) {
                $propId = DB::table('properties')->where('prop_title', '=', 'shaft_flex')->where('prop_value', '=', $filter)->value('id'); 
                $filterStickShaftFlexPropIds[] = $propId;
            }
            if(!isset($filterStickShaftFlexPropIds) && (!empty($filterStickShaftFlexPropIds)))
            $prodIds = DB::table('product_property')->select('product_id')->whereIn('property_id',  $filterStickShaftFlexPropIds)->get();
            foreach ($prodIds as $prodId) {
                $filterStickShaftFlexProdIds[] = $prodId->product_id;
            }
            $this->query->whereIn('id', (array)$filterStickShaftFlexProdIds);
        }
        
        if(isset($filters['brand'])) {
            $filterBrandSet = [];
            foreach($filters['brand'] as $filter) {
                $brandId = DB::table('brands')->where('brand', 'LIKE', $filter)->value('id'); 
                $filterBrandSet[] = $brandId;
            }
            $this->query->whereIn('brand_id', (array)$filterBrandSet);
        } 
        
        return $this->query;
    }
}