<?php
// app/Http/Controllers/Api/StickController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Property;
use App\Models\Brand;
use App\Models\Size;
use App\Models\ProductProperty;
use App\Models\Image;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Http\Requests\StoreStickRequest;

class StickController extends Controller {

    public function store(StoreStickRequest $request) {
        
        \Log::debug('StickController input', $request->all());

        // Проверка существующего товара
        if ($request->article && Product::where('article', $request->article)->exists()) {
            return response()->json([
                'success' => false,                                         // Меняем на false!
                'message' => 'Товар с данным артикулом уже существует!'
            ], 409);                                                        // HTTP 409 Conflict
        }

        // Получаем валидированные данные (см. app/Http/Requests/StoreStickRequest.php)
        $validated = $request->validated();

        \Log::debug('StickController create validating', [
            'validated' => $validated,
        ]);

        // Находим бренд
        $productBrand = Brand::find($validated['brandId']);
        if (!$productBrand) {
            return response()->json(['error' => 'Бренд не найден'], 404);
        }

        // Формируем название и URL
        [$stickTitle, $prodUrlSemantic, $imgSrcBaseName] = $this->generateProductDetails($validated, $productBrand);

        /*
            // формируем наименование товарной позиции в БД:
            $stickTitle = 'Флорбольная клюшка';

            //по brand_id наименование бренда:
            $productBrand = Brand::where('id', $brandId)->first();

            $productBrandView = rtrim(ucfirst(strtolower($productBrandView->brand_view)), '.' ); // форматируем для вывода на экран в виде Zonefloorball (без точки в конце) 
            $brandForUrlSemantic = '-'. rtrim(strtolower($productBrandView->brand), '.' );          
            
            $stickTitle .= " $productBrandView";

            if(!empty($model)) {
                $stickTitle .= " $model";

                $modelForUrlSemantic = strtolower($model);                              // переводим все символы в нижний регистр
                $modelForUrlSemantic = str_replace('+', '-plus', $modelForUrlSemantic); // если player+ - делаем player-plus...
                $modelForUrlSemantic = str_replace(' ', '-', $modelForUrlSemantic);     // меняем пробелы на дефисы
                $modelForUrlSemantic = '-'.$modelForUrlSemantic;                        //добавляем в начало дефис, поле мб пустым - чтобы дефисы в урле не плодились, зделаем их здесь... 
            }
                            
            if(!empty($marka)) { 
                $stickTitle .= " $marka";

                $markaForUrlSemantic = strtolower($marka);                                          // переводим все символы в нижний регистр
                $markaForUrlSemantic = strtr($markaForUrlSemantic, ['.'=>' ', '°'=>'', '®'=>'']);   // меняем, если есть, точки - на пробелы, знак градуса - удаляем...
                $markaForUrlSemantic = str_replace(' ', '-', $markaForUrlSemantic);                 // меняем пробелы на дефисы
                $markaForUrlSemantic = '-'.$markaForUrlSemantic;
            }

            if(!empty($flexId)) {
            $productShaftFlex = Property::where('id', $flexId)->select('prop_value')->first();
            $shaftFlexForUrlSemantic = '-' . $productShaftFlex . 'mm';

            $stickTitle .= " $productShaftFlex";
            } 

            if(!empty($colour)) {
                $colourForUrlSemantic = strtolower($colour); // переводим все символы в нижний регистр
                $colourForUrlSemantic = str_replace('/', ' ', $colourForUrlSemantic); // меняем, если есть, '/' - на пробел...
                $colourForUrlSemantic = str_replace(' ', '-', trim($colourForUrlSemantic)); // меняем пробелы на дефисы
                $colourForUrlSemantic = '-'.$colourForUrlSemantic;

                $stickTitle .= " $colour";
            }

            if(!empty($stickSizeId)) {
            $stickSizeForUrlSemantic = Size::where('id', $stickSizeId)->select('size_value')->first();
            } 

            if(!empty($hookId)) {
                switch ($hookId) {
                    case '1':
                        $stickTitle .= ', Левая';
                        $hookForUrlSemantic = '-left';
                        break;
                    case '2':
                        $stickTitle .= ', Правая';
                        $hookForUrlSemantic = '-right';
                        break;
                    case '3':
                        $stickTitle .= '';
                        $hookForUrlSemantic = '';
                        break;
                }
            } 

            $prod_url_semantic = $article .'-klyushka-dlya-florbola'. $brandForUrlSemantic . $modelForUrlSemantic . $markaForUrlSemantic . $shaftFlexForUrlSemantic . $colourForUrlSemantic . '-' .
                $stickSizeForUrlSemantic . 'cm' . $hookForUrlSemantic;

            $tagTitle = 'Клюшка ';
            if ($brandId == '1') {
                $brandForTagTitleInRus = 'Юнихок ';
            } elseif ($brandId == '2') {
                $brandForTagTitleInRus = 'Зон ';
            } elseif ($brandId == '3') {
                $brandForTagTitleInRus = 'Алетерс ';
            } else {
                $brandForTagTitleInRus = '';
            }
            $tagTitle .= $brandForTagTitleInRus . ' ' . $productBrandView .' '; 
            $tagTitle .= $stickSizeForUrlSemantic . 'см Купить ' . $article;
                        
            $metaNameDescription = 'Клюшка ' . $brandForTagTitleInRus . ' ' . $productBrandView . '';

            if($stickSizeId <= 5) {
                $metaNameDescription .= ' детская. ';
            } elseif($stickSizeId <= 8) {
                $metaNameDescription .= ' для детей и подростков. ';
            } elseif($stickSizeId <= 10) {
                $metaNameDescription .= ' для подростков и взрослых игроков. ';
            } else {
                $metaNameDescription .= ' для взрослых и высоких игроков. ';
            }

            $metaNameDescription .= $article . '. Ведущий мировой производитель флорбольной экипировки.';
        */
        
        DB::beginTransaction();
        
        try {

            $product = Product::create([
                'article'               => $validated['article'],
                'title'                 => $stickTitle,
                'category_id'           => $validated['categoryId'],
                'brand_id'              => $validated['brandId'],
                'model'                 => $validated['model'] ?? null,
                'marka'                 => $validated['marka'] ?? null,
                'size_id'               => $validated['stickSizeId'],
                'colour'                => $validated['colour'] ?? null,
                'material'              => $validated['material'] ?? null,
                'weight'                => $validated['weight'] ?? null,
                'prod_desc'             => $validated['prod_desc'] ?? null,
                'prod_url_semantic'     => $prodUrlSemantic,
                'tag_title'             => $this->generateTagTitle($validated, $productBrand),
                'meta_name_description' => $this->generateMetaDescription($validated, $productBrand),
                'iff_id'                => $validated['iffId'],
                'product_status_id'     => 3, // draft
                'author_id'             => auth()->id(),
            ]);
            
            // добавляем хват (правый/левый/нейтральный):
            if (!empty($validated['hookId'])) {             // Добавляем проверки
                ProductProperty::create([
                    'product_id' => $product->id,
                    'property_id' => (int)$validated['hookId'],
                    'author_id' => auth()->id()
                ]);
            }
            // добавляем жёсткость клюшки
            if (!empty($validated['shaftFlexId'])) {
                ProductProperty::create([
                    'product_id' => $product->id,
                    'property_id' => (int)$validated['shaftFlexId'],
                    'author_id' => auth()->id()
                ]);
            }

            // создаём базовое имя ссылок на все изображения для данной группы товаров (или одного товара, если он будет один в карточке):
            Image::create([
                'product_id'=> $product->id,
                'img_link'  => $imgSrcBaseName,
                'author_id' => auth()->id()
            ]);


            DB::commit();

            return response()->json([
                'success'           => true,
                'massage'           => 'Чтобы товар появился на сайте, нужно описать дополнительные характеристики клюшки...',
                'productId'         => $product->id,
                'imgSrcBaseName'    => $imgSrcBaseName, // эта информация записывается в состояние и будет использована в шаге 4, где мы будем придумывать наименования файлов-картинок-для клюшек
                'title'             => $product->title
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Product creation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при создании товара'
            ], 500);
        }
    }

    private function generateProductDetails(array $data, Brand $brand): array {
        $title = 'Флорбольная клюшка';
        $urlParts = $imgSrcParts = [];
        
        // Бренд
        $brandView = rtrim(ucfirst(strtolower($brand->brand_view)), '.');
        $title .= " $brandView";
        $urlParts[] = strtolower($brand->brand);
        $imgSrcParts[] = strtolower($brand->brand);

        // Модель
        if (!empty($data['model'])) {
            $model = $this->formatForUrl($data['model']);
            $title .= " {$data['model']}";
            $urlParts[] = $model;
            $imgSrcParts[] = $model;
        }

        // Марка
        if (!empty($data['marka'])) {
            $marka = $this->formatForUrl($data['marka']);
            $title .= " {$data['marka']}";
            $urlParts[] = $marka;
            $imgSrcParts[] = $marka;
        }

        // Жесткость
        if (!empty($data['shaftFlexId'])) {
            $flex = Property::find($data['shaftFlexId']);
            if ($flex) {
                $title .= " {$flex->prop_value}";
                $urlParts[] = $flex->prop_value . 'mm';
                $imgSrcParts[] = $flex->prop_value;
            }
        }

        // Цвет
        if (!empty($data['colour'])) {
            $color = $this->formatForUrl($data['colour']);
            $title .= " {$data['colour']}";
            $urlParts[] = $color;
            $imgSrcParts[] = $color;
        }

        // Размер
        if (!empty($data['stickSizeId'])) {
            $size = Size::find($data['stickSizeId']);
            if ($size) {
                $urlParts[] = $size->size_value . 'cm';
                $title .= " {$size->size_value}см";
            }
        }

        // Крюк
        if (!empty($data['hookId'])) {
            $hook = match((int)$data['hookId']) {
                1 => ['title' => ', Левая', 'url' => 'left'],
                2 => ['title' => ', Правая', 'url' => 'right'],
                default => ['title' => '', 'url' => '']
            };
            $title .= $hook['title'];
            if ($hook['url']) $urlParts[] = $hook['url'];
        }

        $url = $data['article'] . '-klyushka-dlya-florbola-' . implode('-', $urlParts);
        
        // эта информация записывается в состояние и будет использована в шаге 4, где мы будем придумывать наименования файлов-картинок-для клюшек
        $imgSrcBaseName = 'images/sticks/' . $data['article'] . '-klyushka-dlya-florbola-' . implode('-', $imgSrcParts);

        return [$title, $url, $imgSrcBaseName];
    }

    private function formatForUrl(string $value): string {
        return str_replace(
            ['+', ' ', '/', '.', '°', '®'],
            ['-plus', '-', '-', '-', '', ''],
            strtolower($value)
        );
    }

    private function generateTagTitle(array $data, Brand $brand): string {
        $brandNames = [
            1 => 'Юнихок',
            2 => 'Зон', 
            3 => 'Алетерс'
        ];

        // Явно приводим к int для гарантии, для перестраховки в сто тысяч первый раз
        $brandId = (int)$data['brandId'];

        $size = Size::find($data['stickSizeId']);
        $sizeCm = $size ? $size->size_value . 'см' : '';

        // return "Клюшка {$brandNames[$brandId]} {$brand->brand_view} {$sizeCm} Купить {$data['article']}";
        return "Клюшка флорбол {$brandNames[$brandId]} {$sizeCm} Купить {$data['article']}";
    }

    private function generateMetaDescription(array $data, Brand $brand): string {
        $size = Size::find($data['stickSizeId']);
        $sizeDescription = match(true) {
            $data['stickSizeId'] && $data['stickSizeId'] <= 5     => 'детская',
            $data['stickSizeId'] && $data['stickSizeId'] <= 8     => 'для детей и подростков',
            $data['stickSizeId'] && $data['stickSizeId'] <= 10    => 'для подростков и взрослых игроков',
            default                             => 'для взрослых и высоких игроков'
        };

        return "Клюшка {$brand->brand_view} {$sizeDescription}. {$data['article']}. Лучший мировой производитель флорбольной экипировки.";
    }

}