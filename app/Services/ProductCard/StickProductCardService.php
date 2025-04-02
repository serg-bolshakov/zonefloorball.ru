<?php
// app/Services/ProductCard/StickProductCardService.php - Сервис для клюшек
namespace App\Services\ProductCard;

use Illuminate\Database\Eloquent\Builder;               // Builder в Laravel - это реализация шаблона "строитель" (Builder pattern), который позволяет постепенно строить SQL-запрос, добавляя к нему условия.
use Illuminate\Support\Facades\DB;
use App\Models\Product;

class StickProductCardService extends BaseProductCardService
{
    
    public function getSimilarProps() {
    
        // сначала смотрим хват текущего товара:
        $currentProductPropHookTitle = $currentProductPropHookValue = '';
        foreach($this->product->properties as $property) {
            if(($property->prop_title == 'hook')) {
                $currentProductPropHookTitle = 'hook';
                $currentProductPropHookValue = $property->prop_value_view;
            }
        }

        // смотрим отличные характеристики текущего товара:
        $currentProductSizeTitle = $this->product->size->size_title; // shaft_length
        $currentProductSizeValue = $this->product->size->size_value; // 55

        $possibleHookForProductCard = Product::select('products.id', 'products.prod_url_semantic')
            ->join('sizes', 'products.size_id', '=', 'sizes.id')
            ->join('product_property', 'products.id', '=', 'product_property.product_id')
            ->join('properties', 'product_property.property_id', '=', 'properties.id')
            ->addSelect([
                'properties.prop_title',
                'properties.prop_value',
                'properties.prop_value_view',
                'sizes.size_title',
                'sizes.size_value'
            ])
            ->where('products.category_id', $this->product->category_id)
            ->where('products.brand_id', $this->product->brand_id)
            ->where('products.model', 'like', '%' . $this->product->model . '%')
            ->where('products.marka', 'like', '%' . $this->product->marka . '%')
            ->where('sizes.size_title', 'like', 'shaft_length')
            ->where('sizes.size_value', $currentProductSizeValue)
            ->where('properties.prop_title', 'like', 'hook')
            ->where('properties.prop_value_view', '!=', $currentProductPropHookValue)
            ->where('products.id', '!=', $this->product->id)
            ->distinct()
        ->first();

        // проверяем есть ли в продаже клюшки такой же модели, но с другой длиной рукоятки:
        $possibleShaftLengthArr = [];
        $resultpossibleShaftLengthForProductCard = Product::select('sizes.size_value')
            ->leftJoin('sizes', 'products.size_id', '=', 'sizes.id')
            ->where([
                ['products.category_id', $this->product->category_id],
                ['products.brand_id', $this->product->brand_id],
                ['products.model', 'like', '%' . $this->product->model . '%'],
                ['products.marka', 'like', '%' . $this->product->marka . '%']
            ])
            ->distinct()
            ->get()
            ->pluck('size_value')
        ->toArray();
        
        foreach ($resultpossibleShaftLengthForProductCard as $possibleShaftLengthForProductCard) {
            $row = [];
            $classCurrent = "";
            $currentProductSize = $possibleShaftLengthForProductCard;
            
            $resNewItem = Product::select('p.id', 'p.prod_url_semantic', 'props.prop_title', 'props.prop_value', 'props.prop_value_view', 's.size_title', 's.size_value')
                ->from('products as p')
                ->leftJoin('sizes as s', 'p.size_id', '=', 's.id')
                ->leftJoin('product_property as pp', 'pp.product_id', '=', 'p.id')
                ->leftJoin('properties as props', 'pp.property_id', '=', 'props.id')
                ->where([
                    ['p.category_id', $this->product->category_id],
                    ['p.brand_id', $this->product->brand_id],
                    ['p.model', 'like', '%' . $this->product->model . '%'],
                    ['p.marka', 'like', '%' . $this->product->marka . '%'],
                    ['props.prop_title', 'hook'],
                    ['props.prop_value_view', $currentProductPropHookValue],
                    ['s.size_title', 'like', 'shaft_length'],
                    ['s.size_value', $currentProductSize],
                ])                 
            ->first();

            ($currentProductSizeValue == $possibleShaftLengthForProductCard) ? $classCurrent = 'cardStick-shaftLength__item-active' : $classCurrent = 'cardStick-shaftLength__item'; 
            
            $row['size_value'] = $possibleShaftLengthForProductCard;
            $row['prod_url_semantic'] = $resNewItem['prod_url_semantic'];
            $row['classCurrent'] = $classCurrent;
            $possibleShaftLengthArr[] = $row;
        }  
        
        foreach ($resultpossibleShaftLengthForProductCard as $possibleShaftLengthForProductCard) {
            $row = [];
            $classCurrent = "";
            $currentProductSize = $possibleShaftLengthForProductCard;
            
            $resNewItem = Product::select('p.id', 'p.prod_url_semantic', 'props.prop_title', 'props.prop_value', 'props.prop_value_view', 's.size_title', 's.size_value')
                ->from('products as p')
                ->leftJoin('sizes as s', 'p.size_id', '=', 's.id')
                ->leftJoin('product_property as pp', 'pp.product_id', '=', 'p.id')
                ->leftJoin('properties as props', 'pp.property_id', '=', 'props.id')
                ->where([
                    ['p.category_id', $this->product->category_id],
                    ['p.brand_id', $this->product->brand_id],
                    ['p.model', 'like', '%' . $this->product->model . '%'],
                    ['p.marka', 'like', '%' . $this->product->marka . '%'],
                    ['props.prop_title', 'hook'],
                    ['props.prop_value_view', $currentProductPropHookValue],
                    ['s.size_title', 'like', 'shaft_length'],
                    ['s.size_value', $currentProductSize],
                ])                 
            ->first();

            ($currentProductSizeValue == $possibleShaftLengthForProductCard) ? $classCurrent = 'cardStick-shaftLength__item-active' : $classCurrent = 'cardStick-shaftLength__item'; 
            
            $row['size_value'] = $possibleShaftLengthForProductCard;
            $row['prod_url_semantic'] = $resNewItem['prod_url_semantic'];
            $row['classCurrent'] = $classCurrent;
            $possibleShaftLengthArr[] = $row;
        }  

        // мы получаем в $possibleShaftLengthArr значения длин рукоятки в двух экземплярах (дубли) - при переборе данных попадают и правые, и левые... но нужно посмотреть логику - возможно где там исправить
        // пока удаляем дубли "руками": 
        $propsVariants['possibleShaftLengthForProductCard'] = array_reduce(
            $possibleShaftLengthArr,
            function (array $carry, array $item) {
                static $uniqueUrls = [];      // Статическая переменная для хранения уникальных URL
                
                $url = $item['prod_url_semantic'];
                
                if (!isset($uniqueUrls[$url])) {
                    $uniqueUrls[$url] = true; // Помечаем URL как использованный
                    $carry[] = $item;         // Добавляем элемент в результат
                }
                
                return $carry;
            },
            [] // Начальное значение (пустой массив)
        );
        
        $propsVariants['resultpossibleHookForProductCard'] = $possibleHookForProductCard;
        $propsVariants['propHook'] = $currentProductPropHookValue;

        // фишка с выбором значений из массива любого уровня вложенности по ключу - отличная фишка - нужно будет подумать как использовать - пока комментирую...
        // $prodUrlSemanticArr = $this->extractUniqueUrls($propsVariants, 'prod_url_semantic');
        // dd($prodUrlSemanticArr);
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