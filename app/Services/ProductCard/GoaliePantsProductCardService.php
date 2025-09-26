<?php
// app/Services/ProductCard/GoaliePantsProductCardService.php - Сервис для вратарских штанов
namespace App\Services\ProductCard;

use Illuminate\Database\Eloquent\Builder;               // Builder в Laravel - это реализация шаблона "строитель" (Builder pattern), который позволяет постепенно строить SQL-запрос, добавляя к нему условия.
use Illuminate\Support\Facades\DB;
use App\Models\Product;

class GoaliePantsProductCardService extends BaseProductCardService
{
    
    public function getSimilarProps($prodStatus = 1) {
        $res = [];
        $thisProduct = $this->product;

        \Log::debug('GoaliePantsProductCardService:', ['product' => $thisProduct]);
        
        // сначала смотрим размер текущего товара (вратарских штанов) - у товаров, которые могут попасть в карточку будет отличаться именно это свойство:
        $currentProductSizeTitle = $currentProductSizeValue = $currentProductSizeValueView = '';
        
        // смотрим отличные характеристики текущего товара:
        $currentProductSizeTitle = $this->product->size->size_title; // pants_size
        $currentProductSizeValue = $this->product->size->size_value; // 170

        \Log::debug('GoaliePantsProductCardService: currentProductSizeValue', ['currentProductSizeValue' => $currentProductSizeValue]);


        // проверяем есть ли в продаже штаны такой же модели, но другого размера:
        $possiblePantsSizesArr = [];
        $resultpossiblePantsSizesForProductCard = Product::select('sizes.size_value')
            ->leftJoin('sizes', 'products.size_id', '=', 'sizes.id')
            ->where([
                ['products.category_id', $this->product->category_id],
                ['products.brand_id', $this->product->brand_id],
                ['products.model', 'like', '%' . $this->product->model . '%'],
                ['products.marka', 'like', '%' . $this->product->marka . '%'],
                ['products.product_status_id', $prodStatus],
            ])
            ->distinct()
            ->get()
            ->pluck('size_value')
        ->toArray();

        \Log::debug('GoaliePantsProductCardService: resultpossiblePantsSizesForProductCard', ['resultpossiblePantsSizesForProductCard' => $resultpossiblePantsSizesForProductCard]);

        if(!empty($resultpossiblePantsSizesForProductCard)) {
            foreach ($resultpossiblePantsSizesForProductCard as $possiblePantsSizesForProductCard) {
                $row = [];
                $classCurrent = "";
                $currentProductSize = $possiblePantsSizesForProductCard;

                \Log::debug('GoaliePantsProductCardService: iteration', ['itteration' => $possiblePantsSizesForProductCard]);

                $resNewItem = Product::select('p.id', 'p.prod_url_semantic', 's.size_title', 's.size_value', 's.size_value_view')
                    ->from('products as p')
                    ->leftJoin('sizes as s', 'p.size_id', '=', 's.id')
                    ->where([
                        ['p.category_id', $this->product->category_id],
                        ['p.brand_id', $this->product->brand_id],
                        ['p.model', 'like', '%' . $this->product->model . '%'],
                        ['p.marka', 'like', '%' . $this->product->marka . '%'],
                        ['s.size_title', 'like', 'pants_size'],
                        ['s.size_value', $currentProductSize],
                        ['p.product_status_id', $prodStatus],
                    ])                 
                ->first();

                \Log::debug('GoaliePantsProductCardService: resNewItem', ['$resNewItem' => $resNewItem]);
                
                ($currentProductSizeValue == $possiblePantsSizesForProductCard) ? $classCurrent = 'cardStick-shaftLength__item-active' : $classCurrent = 'cardStick-shaftLength__item'; 
                if(!empty($resNewItem)) {
                    // dump($resNewItem);
                    $row['size_value'] = $possiblePantsSizesForProductCard;
                    $row['size_value_view'] = $resNewItem['size_value_view'];
                    $row['prod_url_semantic'] = $resNewItem['prod_url_semantic'];
                    $row['classCurrent'] = $classCurrent;
                }        
                
                if(!empty($row)) {
                    $possiblePantsSizesArr[] = $row;
                }
            }  
        }

        \Log::debug('GoaliePantsProductCardService: possiblePantsSizesArr', ['possiblePantsSizesArr' => $possiblePantsSizesArr]);

        // пока удаляем дубли "руками" (если таковые имеются): 
        $propsVariants['possiblePantsSizesForProductCard'] = [];
        // dd($possiblePantsSizesArr); 
        if(isset($possiblePantsSizesArr) && !empty($possiblePantsSizesArr)) {
            $propsVariants['possiblePantsSizesForProductCard'] = array_reduce(
                $possiblePantsSizesArr,
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
        }

        \Log::debug('GoaliePantsProductCardService: propsVariants', ['propsVariants' => $propsVariants]);

        return $propsVariants;
    }
}