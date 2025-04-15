<?php
// app/Services/ProductCard/BladeProductCardService.php - Сервис для клюшек
namespace App\Services\ProductCard;

use Illuminate\Database\Eloquent\Builder;               // Builder в Laravel - это реализация шаблона "строитель" (Builder pattern), который позволяет постепенно строить SQL-запрос, добавляя к нему условия.
use Illuminate\Support\Facades\DB;
use App\Models\Product;

class BladeProductCardService extends BaseProductCardService
{
    
    public function getSimilarProps() {
        $res = [];
        $thisProduct = $this->product;
        
        // сначала смотрим хват и жёсткость текущего товара (крюка) - у товаров, которые могут попасть в карточку будут отличаться именно эти свойства:
        $currentProductPropHookTitle = $currentProductPropHookValue = $currentProductPropHookValueView = $flexBladeCurrent = '';

        foreach($thisProduct->properties as $property) {
            if(($property->prop_title == 'hook_blade')) {
                $currentProductPropHookValue = $property->prop_value;
                $currentProductPropHookValueView = $property->prop_value_view;
            }
            if($property->prop_title == 'blade_stiffness') {
                $flexBladeCurrent = $property->prop_value;
            }
        }
        // здесь получаем реквизиты крюка с другим хватом-антагонистом: правый/левый:
        $possibleHookForProductCard = Product::select('p.id', 'p.prod_url_semantic')
            ->from('products as p')
            ->join('product_property as pp', 'p.id', '=', 'pp.product_id')
            ->join('properties as props', 'pp.property_id', '=', 'props.id')
            ->addSelect([
                'props.prop_title',
                'props.prop_value',
                'props.prop_value_view',
            ])
            ->where('p.category_id', $thisProduct->category_id)
            ->where('p.brand_id', $thisProduct->brand_id)
            ->where('p.model', 'like', '%' . $thisProduct->model . '%')
            ->where('p.marka', 'like', '%' . $thisProduct->marka . '%')
            ->where('props.prop_title', 'like', 'hook_blade')
            ->where('props.prop_value_view', '!=', $currentProductPropHookValueView)
            ->where('p.id', '!=', $thisProduct->id)
            ->distinct()
        ->first();
        
        // здесь мы получаем оба варианта (если они есть) с полной картиной товара, патнёра: 
        $resulthookBladeForCard = Product::select('p.id', 'p.prod_url_semantic', 'p.model', 'p.marka', 'p.colour')
            ->from('products as p')
            ->join('product_property as pp', 'p.id', '=', 'pp.product_id')
            ->join('properties as props', 'pp.property_id', '=', 'props.id')
            ->addSelect([
                'props.prop_title',
                'props.prop_value',
                'props.prop_value_view',
            ])
            ->where('props.prop_title', 'like', 'hook_blade')
            ->where('p.model', 'like', $thisProduct->model)
            ->where('p.colour', 'like', $thisProduct->colour)
            ->distinct()
        ->get();  
                          ;
        $res['resultpossibleHookForProductCard'] = $resulthookBladeForCard; // здесь оба крюка (если возможны и правый, и левый)...
        $res['propHook'] = $currentProductPropHookValueView;                // наименование стороны текущего в карточке крюка: Правый/Левый  

        $resultotherColourBladeForCard = Product::select('p.id', 'p.category_id', 'p.prod_url_semantic', 'p.model', 'p.marka', 'p.colour')
            ->from('products as p')
            ->join('product_property as pp', 'p.id', '=', 'pp.product_id')
            ->join('properties as props', 'pp.property_id', '=', 'props.id')
            ->join('images as i', 'p.id', '=', 'i.product_id')
            ->addSelect([
                'props.prop_title',
                'props.prop_value',
                'props.prop_value_view',
                'i.img_main',
                'i.img_link',
            ])
                ->where('p.colour', 'not like', $thisProduct->colour)
                ->where('props.prop_title', 'like', 'hook_blade')
                ->where('props.prop_value', 'like', $currentProductPropHookValue)
                ->where('p.model', 'like', $thisProduct->model)
                ->where('p.category_id', 'like', $thisProduct->category_id)
                ->where('i.img_main', '1')
                ->distinct()
        ->get();
        
        $res['resultotherColourBladeForCard'] = $resultotherColourBladeForCard;  

        $propsVariants['resultotherColourBladeForCard'] = $resultotherColourBladeForCard;
        $propsVariants['resultpossibleHookForProductCard'] = $possibleHookForProductCard;
        $propsVariants['propHook'] = $currentProductPropHookValueView;

        // фишка с выбором значений из массива любого уровня вложенности по ключу - отличная фишка - нужно будет подумать как использовать - пока комментирую...
        // $prodUrlSemanticArr = $this->extractUniqueUrls($propsVariants, 'prod_url_semantic');
        // dd($propsVariants);
        return $propsVariants;
    }
    
    
    // получить значения по ключу из массива любого уровня вложенности (пока не будем использовать, но решение офигенное)...
    function extractUniqueUrls(array $array, string $key): array {
        $result = [];
        
        array_walk_recursive($array, function ($value, $k) use ($key, &$result) {
            if ($k === $key) {
                $result[] = $value;
            }
        });
        
        return array_values(array_unique($result));
    }    
    
}