<?php
// app/Http/Controllers/Api/StickPropertiesController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Property;
use App\Models\Brand;
use App\Models\ProductProperty;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StickPropertiesController extends Controller
{
    // Вызывается при заполнении формы нового товара (клюшки) на этапе перехода на второй шаг, когда мы получаем id-нового товара:
    public function getProperties($productId)
    {
        
        \Log::debug('StickPropertiesController', [
            'productId' => $productId,
        ]);

        try {
            
            /*    $product = Product::with(['actualPrice', 'regularPrice', 'category', 'brand', 'size', 'properties', 
                  'productMainImage', 'productCardImgOrients', 'actualPrice', 'regularPrice', 'productShowCaseImage', 
                  'properties', 'productReport', 'productUnit', 'productPromoImages'])->where('prod_url_semantic', $prodUrlSemantic)->first(); */

            $product = Product::with('brand', 'size', 'properties', 'regularPrice', 'actualPrice')->findOrFail($productId);
            $brandId = $product->brand_id;

            \Log::debug('StickPropertiesController product', [
                'product'       => $product,
                'product Title' => $product->title,
                'brandId'       => $brandId,
            ]);

            // Получаем свойства аналогичного товара (если есть)
            /* $similarProps = [];
            if (session()->has('productAddition.idExistedProduct')) {
                $similarProps = ProdProp::where('product_id', session('productAddition.idExistedProduct'))
                    ->pluck('property_id')
                    ->toArray();
            }*/

            \Log::debug('StickPropertiesController getPossiblSeries', [
                'getPossiblSeries' => $this->getPossibleSeries($brandId),
            ]);

            // Получаем все возможные свойства для шага 2
            $data = [
                'product'       => $product,                //   для восстановления данных формы
                'title'         => $product->title,
                // 'similarProps' => $similarProps,
                'series'        => $this->getPossibleSeries($brandId),
                'grips'         => $this->getPossibleGrips($brandId),
                'profiles'      => $this->getPossibleProfiles($brandId),
                'bladeModels'   => $this->getPossibleBladeModels($brandId),
                // 'brands' => Brand::where('category_id', 1)->get(),
            ];



            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // выбираем из БД доступные и активные все возможные варианты серий для данной торговой марки и предлагем выбрать возможный вариант...
    protected function getPossibleSeries($brandId) {
        \Log::debug('StickPropertiesController getPossiblSeries', [
            'begin' => $brandId,
        ]);

        return Property::where('category_id', 1)
            ->select('id', 'prop_value', 'prop_value_view')
            ->where(function($query) use ($brandId) {
                $query->where('brand_id', $brandId)
                    ->orWhereNull('brand_id');
            })
            ->where('prop_title', 'serie')
            ->whereNotNull('prop_value_view')
            ->where(function($query) {
                $query->where('archived', 0)
                    ->orWhereNull('archived');
            })
            ->orderBy('prop_value_view')
            ->get();
    }

    // смотрим тип обмоток:
    protected function getPossibleGrips($brandId) {
        \Log::debug('StickPropertiesController getPossibleGrips', [
            'begin' => $brandId,
        ]);

        return Property::where('category_id', 1)
            ->select('id', 'prop_value', 'prop_value_view')
            ->where(function($query) use ($brandId) {
                $query->where('brand_id', $brandId)
                    ->orWhereNull('brand_id');
            })
            ->where('prop_title', 'grip_type')
            ->whereNotNull('prop_value_view')
            ->where(function($query) {
                $query->where('archived', 0)
                    ->orWhereNull('archived');
            })
            ->orderBy('prop_value_view')
            ->get();
    }

    // профиль рукоятки:
    protected function getPossibleProfiles($brandId) {
        \Log::debug('StickPropertiesController getPossibleProfiles', [
            'begin' => $brandId,
        ]);

        return Property::where('category_id', 1)
            ->select('id', 'prop_value', 'prop_value_view')
            ->where(function($query) use ($brandId) {
                $query->where('brand_id', $brandId)
                    ->orWhereNull('brand_id');
            })
            ->where('prop_title', 'shaft_profile')
            ->whereNotNull('prop_value_view')
            ->where(function($query) {
                $query->where('archived', 0)
                    ->orWhereNull('archived');
            })
            ->orderBy('prop_value_view')
            ->get();
    }

    // модель крюка для клюшки (выбираем возможные варианты для предложения на сайт):
    protected function getPossibleBladeModels($brandId) {
        \Log::debug('StickPropertiesController getPossibleBladeModels', [
            'begin' => $brandId,
        ]);

        return Property::where('category_id', 1)
            ->select('id', 'prop_value', 'prop_value_view')
            ->where(function($query) use ($brandId) {
                $query->where('brand_id', $brandId)
                    ->orWhereNull('brand_id');
            })
            ->where('prop_title', 'blade_model')
            ->whereNotNull('prop_value_view')
            ->where(function($query) {
                $query->where('archived', 0)
                    ->orWhereNull('archived');
            })
            ->orderBy('prop_value_view')
            ->get();
    }

    public function addGrip(Request $request) {

        \Log::debug('StickPropertiesController addGrip', [
            'request' => $request->all(),
        ]);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[A-Z0-9®]+.?([A-Z0-9]+)?.?([A-Z0-9]+)?.?([A-Z0-9]+)?.?([A-Z0-9]+)?.?([A-Z0-9]+)?.?$/',
                Rule::unique('properties', 'prop_value_view')->where(function ($query) {
                    return $query->where('category_id', 1)
                        ->where('prop_title', 'grip_type');
                })
            ],
            'brandId' => 'nullable|exists:brands,id'
        ]);

        \Log::debug('StickPropertiesController addGrip', [
            'validated' => $validated,
        ]);

        try {
            $propValue = strtr(trim(strtolower($validated['name'])), ['-'=>'_', ' '=>'_']);
            
            $property = Property::create([
                'category_id' => 1,
                'brand_id' => $validated['brandId'] > 0 ? $validated['brandId'] : null,
                'prop_title' => 'grip_type',
                'prop_value' => $propValue,
                'prop_value_view' => $validated['name'],
                'prop_description' => 'Тип обмотки клюшки',
                //'author_id' => auth()->id()
            ]);

            return response()->json($property);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Аналогичные методы addProfile и addBlade...

    // Фронт отправляет POST на /stick-properties/save-step2/123 + JSON data, Laravel: Видит роут /{productId} → извлекает 123 из URL, Автоматически передает 123 как первый аргумент в метод, Данные из тела запроса попадают в $request
    public function saveStep2($productId, Request $request) {
        // $productId уже доступен
        \Log::debug('StickPropertiesController saveStep2 input', $request->all());
        
        // Laravel может автоматически найти модель!
        // $product - уже готовая модель Product с id = 123
        // $product->id = 123
        // $product->title = "Флорбольная клюшка..."

        
        // Подготовка данных - реализовал так, что на входе м.б. id = 0 - для того, чтобы админы автоматом не переходили на следующий шаг, а реально смотрели все возможные поля... Отсеиваем такие нулевые значения - осознанный выбор...
        $request->merge([
            'gripId' => $request->gripId == 0 ? null : $request->gripId,
            'profileId' => $request->profileId == 0 ? null : $request->profileId,
            'bladeModel' => $request->bladeModel == 0 ? null : $request->bladeModel,
        ]);
            
        $validated = $request->validate([
            'editedTitle'   => 'nullable|string|max:255',
            'series'        => 'nullable|array',
            'series.*'      => 'exists:properties,id',
            'gripId'        => 'nullable|exists:properties,id',
            'profileId'     => 'nullable|exists:properties,id',
            'bladeModel'    => 'nullable|exists:properties,id',
        ]);

        \Log::debug('StickPropertiesController saveStep2 $validates', $validated);

        DB::beginTransaction();
        try {
            $product = Product::findOrFail($productId);

            // Обновление названия
            if (!empty($validated['editedTitle'])) {
                $product->title = $validated['editedTitle'];
                $product->save();
            }

            // Сохранение свойств
            $this->saveProperties($productId, $validated);

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Данные успешно сохранены']);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Save step2 error: ' . $e->getMessage());
            return response()->json(['error' => 'Ошибка при сохранении данных'], 500);
        }
    }

    protected function saveProperties($productId, $data) {

        // Добавляем новые связи
        $propsToAdd = [];

        if (!empty($data['series'])) {
            foreach ($data['series'] as $seriesId) {
                $propsToAdd[] = [
                    'product_id' => $productId,
                    'property_id' => $seriesId,
                    'author_id' => auth()->id()
                ];
            }
        }

        if ($data['gripId']) {
            $propsToAdd[] = [
                'product_id' => $productId,
                'property_id' => $data['gripId'],
                'author_id' => auth()->id()
            ];
        }

        if ($data['profileId']) {
            $propsToAdd[] = [
                'product_id' => $productId,
                'property_id' => $data['profileId'],
                'author_id' => auth()->id()
            ];
        }

        if ($data['bladeModel']) {
            $propsToAdd[] = [
                'product_id' => $productId,
                'property_id' => $data['bladeModel'],
                'author_id' => auth()->id()
            ];
        }

        if (!empty($propsToAdd)) {             
            ProductProperty::insert($propsToAdd);
        }
    }
}