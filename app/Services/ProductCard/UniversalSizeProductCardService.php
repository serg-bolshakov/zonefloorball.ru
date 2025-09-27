<?php
// app/Services/ProductCard/UniversalSizeProductCardService.php

namespace App\Services\ProductCard;

use App\Models\Product;
use Illuminate\Support\Facades\Log;

class UniversalSizeProductCardService extends BaseProductCardService
{
    protected $sizeTitlePattern;
    
    public function __construct($productInfo, $sizeTitlePattern = null)
    {
        parent::__construct($productInfo);
        $this->sizeTitlePattern = $sizeTitlePattern;
    }
    
    public function getSimilarProps($prodStatus = 1)
    {
        $thisProduct = $this->product;
        
        Log::debug('UniversalSizeProductCardService:', [
            'product_id' => $thisProduct->id,
            'category_id' => $thisProduct->category_id,
            'size_pattern' => $this->sizeTitlePattern
        ]);
        
        // Определяем pattern для size_title
        $sizePattern = $this->determineSizePattern();
        
        // Получаем доступные размеры для этой модели
        $availableSizes = $this->getAvailableSizes($sizePattern, $prodStatus);
        
        // Формируем данные для отображения
        return $this->formatSizeVariants($availableSizes, $sizePattern, $prodStatus);
    }
    
    protected function determineSizePattern()
    {
        // Если pattern задан явно - используем его (пока не задан)
        if ($this->sizeTitlePattern) {
            return $this->sizeTitlePattern;
        }
        
        // Автоматическое определение pattern по категории
        return $this->getSizePatternByCategory($this->product->category_id);
    }
    
    protected function getSizePatternByCategory($categoryId)
    {
        $sizePatterns = [
            10 => 'pants_size',         // вратарские штаны
            12 => 'knees_size',         // вратарские наколенники  
            13 => 'gloves_size',        // вратарские перчатки
            14 => 'groins_size',        // вратарские защита паха
            15 => 'necks_size',         // вратарские защита шеи
            17 => 'baules_size',        // размер сумок
            
            // добавляем другие категории по мере необходимости
        ];
        
        return $sizePatterns[$categoryId] ?? 'universal_size';
    }
    
    protected function getAvailableSizes($sizePattern, $prodStatus)
    {
        return Product::select('sizes.size_value', 'sizes.size_value_view')
            ->leftJoin('sizes', 'products.size_id', '=', 'sizes.id')
            ->where([
                ['products.category_id', $this->product->category_id],
                ['products.brand_id', $this->product->brand_id],
                ['products.model', 'like', '%' . $this->product->model . '%'],
                ['products.marka', 'like', '%' . $this->product->marka . '%'],
                ['products.product_status_id', $prodStatus],
                ['sizes.size_title', 'like', $sizePattern],
            ])
            ->distinct()
            ->get()
            ->pluck('size_value_view', 'size_value')
            ->toArray();
    }
    
    protected function formatSizeVariants($availableSizes, $sizePattern, $prodStatus)
    {
        $currentSizeValue = $this->product->size->size_value ?? '';
        $variants = [];
        
        foreach ($availableSizes as $sizeValue => $sizeView) {
            // Находим товар с этим размером
            $sizeProduct = Product::select('p.id', 'p.prod_url_semantic', 's.size_value_view')
                ->from('products as p')
                ->leftJoin('sizes as s', 'p.size_id', '=', 's.id')
                ->where([
                    ['p.category_id', $this->product->category_id],
                    ['p.brand_id', $this->product->brand_id],
                    ['p.model', 'like', '%' . $this->product->model . '%'],
                    ['p.marka', 'like', '%' . $this->product->marka . '%'],
                    ['s.size_title', 'like', $sizePattern],
                    ['s.size_value', $sizeValue],
                    ['p.product_status_id', $prodStatus],
                ])
                ->first();
            
            if ($sizeProduct) {
                $variants[] = [
                    'size_value' => $sizeValue,
                    'size_value_view' => $sizeView,
                    'prod_url_semantic' => $sizeProduct->prod_url_semantic,
                    'classCurrent' => $currentSizeValue == $sizeValue 
                        ? 'cardStick-shaftLength__item-active' 
                        : 'cardStick-shaftLength__item'
                ];
            }
        }
        
        // Убираем дубликаты
        $uniqueVariants = $this->removeDuplicates($variants);
        
        return [
            'possibleProductSizesForProductCard' => $uniqueVariants,
            'sizeType' => $this->getSizeTypeLabel($sizePattern)
        ];
    }
    
    protected function removeDuplicates($variants)
    {
        return array_reduce($variants, function ($carry, $item) {
            static $uniqueUrls = [];
            
            if (!isset($uniqueUrls[$item['prod_url_semantic']])) {
                $uniqueUrls[$item['prod_url_semantic']] = true;
                $carry[] = $item;
            }
            
            return $carry;
        }, []);
    }
    
    protected function getSizeTypeLabel($sizePattern)
    {
        $labels = [
            'gloves_size'   => 'Размер перчаток',
            'pants_size'    => 'Размер штанов',
            'knees_size'    => 'Размер наколенников',
            'groins_size'   => 'Размер защиты паха',
            'necks_size'    => 'Размер защиты шеи',
            'baules_size'   => 'Размер сумки',
        ];
        
        return $labels[$sizePattern] ?? 'Размер';
    }
}