<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductReport;
use App\Models\Price;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProductPriceController extends Controller
{
    public function storeStep3(Request $request, $productId) {
        // Laravel автоматически разрешит этот порядок
        // $productId будет взят из маршрута
        // public function storeStep3($productId, Request $request) - также работает, но менее привычно
        try {
            DB::beginTransaction();

            // Валидация
            $validator = Validator::make($request->all(), [
                'regularPrice' => 'required|numeric|min:0|max:999999.99',
                'specialPrice' => 'nullable|numeric|min:0|max:999999.99',
                'specialPriceDateStart' => 'nullable|date',
                'specialPriceDateFinish' => 'nullable|date|after_or_equal:specialPriceDateStart',
            ], [
                'regularPrice.required' => 'Регулярная цена обязательна',
                'regularPrice.numeric' => 'Цена должна быть числом',
                'specialPrice.numeric' => 'Специальная цена должна быть числом',
                'specialPriceDateFinish.after_or_equal' => 'Дата окончания не может быть раньше даты начала',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибки валидации',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Проверяем существование товара
            $product = Product::findOrFail($productId);

            // Создаем регулярную цену (price_type_id = 2)
            Price::create([
                'product_id' => $product->id,
                'price_type_id' => 2, // регулярная цена
                'price_value' => $request->regularPrice,
                'author_id' => auth()->id()
            ]);

            // Создаем специальную цену если указана (price_type_id = 3)
            if ($request->filled('specialPrice')) {
                Price::create([
                    'product_id' => $product->id,
                    'price_type_id' => 3, // специальная цена
                    'price_value' => $request->specialPrice,
                    'date_start' => $request->specialPriceDateStart,
                    'date_end' => $request->specialPriceDateFinish,
                    'author_id' => auth()->id()
                ]);
            }

            // Для страховки проверим есть запись в БД id-товара (не должно быть):
            $report = ProductReport::where('product_id', $productId)->first();

            // Создаём базовую запись с нулевыми значениями по умолчанию
            if (!$report) {
                ProductReport::create([
                    'product_id' => $productId,
                    // остальные поля с значениями по умолчанию
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Цены успешно добавлены',
                'productId' => $product->id
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Товар не найден'
            ], 404);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Ошибка сервера: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получение актуальных цен для товара
     */
    public function getActualPrices($productId)
    {
        $prices = Price::where('product_id', $productId)
            ->actual()
            ->with('priceType')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $prices
        ]);
    }
}