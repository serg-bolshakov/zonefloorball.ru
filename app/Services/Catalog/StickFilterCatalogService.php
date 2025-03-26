<?php
// app/Services/Catalog/StickFilterCatalogService.php - Сервис для клюшек
namespace App\Services\Catalog;

use Illuminate\Database\Eloquent\Builder;               // Builder в Laravel - это реализация шаблона "строитель" (Builder pattern), который позволяет постепенно строить SQL-запрос, добавляя к нему условия.
use Illuminate\Support\Facades\DB;

class StickFilterCatalogService extends BaseFilterCatalogService
{
    public function applyFilters(array $filters): Builder
    {
        // Категория товаров клюшек для флорбола
        $this->query->where('category_id', '=', 1);     // добавляем условие WHERE к запросу (но сам запрос ещё не выполняется)...
        // Каждый такой метод возвращает модифицированный экземпляр Builder'а, что позволяет объединять методы в цепочку: $query->where(...)->whereIn(...)->orderBy(...);

        // вызываем родительский метод для фильтрации категории товаров по бренду:
        $this->applyBrandFilter($filters);

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
                $filterStickShaftFlexProdIds[] = $propId;
            }
            
            if(!empty($filterStickShaftFlexProdIds)) {
                $prodIds = DB::table('product_property')->select('product_id')->whereIn('property_id',  $filterStickShaftFlexProdIds)->get();
                if(!empty($prodIds)) {
                    $filterStickShaftFlexIdsSet = [];
                    foreach($prodIds as $prodId) {
                        $filterStickShaftFlexIdsSet[] = $prodId->product_id;
                    }
                    $this->query->whereIn('id', (array)$filterStickShaftFlexIdsSet);
                }
            }
        }
        
        return $this->query;    // возвращаем построенный объект запроса, который может быть: дальше модифицирован или исполнен (например, при вызове ->get(), ->first(), ->paginate() и т.д.)
    }
}