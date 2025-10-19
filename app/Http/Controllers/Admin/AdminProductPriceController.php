<?php
// app/Http/Controllers/Admin/AdminProductPriceController.php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;      
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Price;
use Carbon\Carbon;

class AdminProductPriceController extends Controller {
    
    public function updatePrices(Request $request, Product $product) {

        \Log::info('🎯 Update prices STARTED', [
            'product_id' => $product->id,
            'product_title' => $product->title,
            'request_data' => $request->all()
        ]);

        try {
                // Декодируем JSON строку в массив
                /* $pricesData = json_decode($request->prices, true);
                
                \Log::debug('🔍 Декодированные данные prices', [
                    'raw_prices' => $request->prices,
                    'decoded_prices' => $pricesData
                ]);
            
                // Валидируем декодированные данные
                $validated = validator($pricesData, [
                    'prices' => 'required|array',
                    'prices.*.price_type_id' => 'required|integer|in:2,3,4',
                    'prices.*.price_value' => 'nullable|numeric|min:0',
                    'prices.*.date_start' => 'nullable|date',
                    'prices.*.date_end' => 'nullable|date|after_or_equal:prices.*.date_start',
                ])->validate();

                \Log::debug('✅ Валидация пройдена', [
                    'validated_prices_count' => count($validated['prices']),
                    'validated_data' => $validated
                ]);*/

                // Данные приходят напрямую как массив
                $validated = $request->validate([
                    'prices' => 'required|array',
                    'prices.*.price_type_id' => 'required|integer|in:2,3,4',
                    'prices.*.price_value' => 'nullable|numeric|min:0',
                    'prices.*.date_start' => 'nullable|date',
                    'prices.*.date_end' => 'nullable|date|after_or_equal:prices.*.date_start',
                ]);

                DB::transaction(function () use ($product, $validated) {
                    \Log::debug('🔄 Транзакция начата');
                    
                    foreach ($validated['prices'] as $index => $priceData) {
                        \Log::debug("📦 Обработка цены {$index}", [
                            'price_type' => $priceData['price_type_id'],
                            'price_value' => $priceData['price_value'],
                            'date_start' => $priceData['date_start'],
                            'date_end' => $priceData['date_end']
                        ]);
                        $this->processPrice($product, $priceData);
                    }
                    
                    \Log::debug('✅ Все цены обработаны');

                    // Обновляем кэшированные цены в products
                    // $this->updateProductPriceCache($product);
                });

                \Log::info('🎉 Update prices COMPLETED successfully');

            return redirect()->back()->with('success', 'Цены успешно обновлены');
        } catch (\Exception $e) {
            \Log::error('❌ Update prices FAILED', [
                'error' => $e->getMessage(),
                'product_id' => $product->id,
                'trace' => $e->getTraceAsString()
            ]);
        
            return redirect()->back()->with('error', 'Ошибка при обновлении цен: ' . $e->getMessage());
        }
    }
        
    private function processPrice(Product $product, array $newPrice)
    {
        \Log::debug('✅ метод processPrice запущен');
        
        $priceType = $newPrice['price_type_id'];
        \Log::debug("🔄 processPrice Тип цены priceType: {$priceType})");

        $priceTypeName = match($priceType) {
            2 => 'REGULAR',
            3 => 'SPECIAL', 
            4 => 'PREORDER',
            default => 'UNKNOWN'
        };
        
        \Log::debug("💰 Обработка {$priceTypeName} цены", [
            'product_id' => $product->id,
            'new_price_value' => $newPrice['price_value'],
            'date_range' => $newPrice['date_start'] . ' - ' . $newPrice['date_end']
        ]);
        
        // Если цена null или 0 - удаляем/деактивируем существующие
        if (empty($newPrice['price_value'])) {
            \Log::debug('🗑️ Удаление/деактивация цены', [
                'price_type' => $priceTypeName,
                'reason' => 'price_value is empty'
            ]);
            $this->deactivatePrices($product->id, $priceType);
            return;
        }

        $currentPrice = $this->getCurrentActivePrice($product->id, $priceType);
        \Log::debug('🔍 Текущая активная цена', [
            'current_price' => $currentPrice ? [
                'id' => $currentPrice->id,
                'value' => $currentPrice->price_value,
                'dates' => $currentPrice->date_start . ' - ' . $currentPrice->date_end
            ] : 'NOT_FOUND'
        ]);

        $operation = $this->determineOperation($currentPrice, $newPrice);
        \Log::debug("⚡ Определена операция: {$operation}");

        switch ($operation) {
            case 'create_new':
                Price::create([
                    'product_id' => $product->id,
                    'price_type_id' => $priceType,
                    'price_value' => $newPrice['price_value'],
                    'date_start' => $newPrice['date_start'],
                    'date_end' => $newPrice['date_end'],
                ]);
                \Log::debug('🆕 Создана новая цена', ['price_id' => $price->id]);
                break;

            case 'update_current':
                $updates = [];

                if ((float)$currentPrice->price_value != (float)$newPrice['price_value']) {
                    $updates['price_value'] = $newPrice['price_value'];
                }

                if (!$this->datesAreEqual($currentPrice->date_start, $newPrice['date_start'])) {
                    $updates['date_start'] = $newPrice['date_start'];
                }
                if (!$this->datesAreEqual($currentPrice->date_end, $newPrice['date_end'])) {
                    $updates['date_end'] = $newPrice['date_end'];
                }

                /* $currentPrice->update([
                    'price_value' => $newPrice['price_value'],
                    'date_start' => $newPrice['date_start'],
                    'date_end' => $newPrice['date_end'],
                ]);
                \Log::debug('✏️ Обновлена текущая цена', ['price_id' => $currentPrice->id]);*/

                if (!empty($updates)) {
                    $currentPrice->update($updates);
                    \Log::debug('✏️ Обновлена текущая цена', ['price_id' => $currentPrice->id, 'updates' => $updates]);
                } else {
                    \Log::debug('⏭️ Цена не изменилась, пропускаем обновление', ['price_id' => $currentPrice->id]);
                }

                break;

            case 'create_override':
                // Закрываем текущую цену
                if ($currentPrice) {
                    $currentPrice->update(['date_end' => Carbon::now()]);
                    \Log::debug('📝 Закрыта текущая цена', ['price_id' => $currentPrice->id]);
                }
                // Создаем новую
                $price = Price::create([
                    'product_id' => $product->id,
                    'price_type_id' => $priceType,
                    'price_value' => $newPrice['price_value'],
                    'date_start' => $newPrice['date_start'],
                    'date_end' => $newPrice['date_end'],
                ]);
                \Log::debug('🔄 Создана новая цена с отменой предыдущей', ['price_id' => $price->id]);
                break;

            case 'no_change':
                \Log::debug('⏭️ No_change, пропускаем обновление', [
                    'price_id' => $currentPrice->id,
                    'price_type' => $priceTypeName, 
                    'product_id' => $product->id,
                    'current_value' => $currentPrice->price_value,
                    'new_value' => $newPrice['price_value'],
                    'date_range' => [
                        'current' => $currentPrice->date_start . ' - ' . $currentPrice->date_end,
                        'new' => $newPrice['date_start'] . ' - ' . $newPrice['date_end']
                    ]
                ]);
                break;
        }
        \Log::debug("✅ {$priceTypeName} цена обработана");
    }

    private function getCurrentActivePrice($productId, $priceTypeId) {
        
        $price = Price::where('product_id', $productId)
            ->where('price_type_id', $priceTypeId)
            ->where(function ($query) {
                $query->whereNull('date_start')
                    ->orWhere('date_start', '<=', Carbon::now());
            })
            ->where(function ($query) {
                $query->whereNull('date_end')
                    ->orWhere('date_end', '>=', Carbon::now());
            })
            ->orderBy('created_at', 'desc')
            ->first();

        \Log::debug('🔍 Поиск активной цены', [
            'product_id' => $productId,
            'price_type_id' => $priceTypeId,
            'found_price' => $price ? [
                'id' => $price->id,
                'value' => $price->price_value,
                'created_at' => $price->created_at,
                'date_start' => $price->date_start,
                'date_end' => $price->date_end
            ] : 'NOT_FOUND',
            'sql' => Price::where('product_id', $productId)
                ->where('price_type_id', $priceTypeId)
                ->where(function ($query) {
                    $query->whereNull('date_end')
                        ->orWhere('date_end', '>=', Carbon::now());
                })
                ->where(function ($query) {
                    $query->whereNull('date_end')
                        ->orWhere('date_end', '>=', Carbon::now());
                })
                ->orderBy('created_at', 'desc')
                ->toSql()
        ]);

        return $price;
    }

    private function deactivatePrices($productId, $priceTypeId)
    {
        Price::where('product_id', $productId)
            ->where('price_type_id', $priceTypeId)
            ->whereNull('date_end')
            ->orWhere('date_end', '>=', Carbon::now())
            ->update(['date_end' => Carbon::now()]);
    }

    private function datesAreEqual($date1, $date2): bool {

        if ($date1 === null && $date2 === null) return true;
        if ($date1 === null || $date2 === null) return false;
        
        return Carbon::parse($date1)->eq(Carbon::parse($date2));
    }


    private function determineOperation(?Price $currentPrice, array $newPrice): string
    {
        if (!$currentPrice) {
            return 'create_new';
        }

        $valuesChanged = 
            (float)$currentPrice->price_value != (float)$newPrice['price_value'] ||
            !$this->datesAreEqual($currentPrice->date_start, $newPrice['date_start']) ||
            !$this->datesAreEqual($currentPrice->date_end, $newPrice['date_end']);

        
        // Если ничего не изменилось
        if (!$valuesChanged) {
            return 'no_change';
        }

        // Смотрим, что именно изменилось: цена или даты:
        $priceChanged = (float)$currentPrice->price_value != (float)$newPrice['price_value'];
        $datesChanged = !$this->datesAreEqual($currentPrice->date_start, $newPrice['date_start']) ||
                        !$this->datesAreEqual($currentPrice->date_end, $newPrice['date_end']);

        \Log::debug('🔍 Детальное сравнение с нормализацией дат', [
            'price_changed' => $priceChanged,
            'dates_changed' => $datesChanged,
        ]);
        
        // Если изменились ТОЛЬКО даты - обновляем текущую запись
        if (!$priceChanged && $datesChanged) {
            return 'update_current';
        }

        $now = Carbon::now();
        
        // Проверяем активна ли текущая цена
        $isCurrentActive = (!$currentPrice->date_start || $currentPrice->date_start <= $now) &&
                          (!$currentPrice->date_end || $currentPrice->date_end >= $now);

        if (!$isCurrentActive) {
            return 'create_new';
        }

        // Проверяем пересечение периодов
        $currentStart = $currentPrice->date_start ? Carbon::parse($currentPrice->date_start) : Carbon::minValue();
        $currentEnd = $currentPrice->date_end ? Carbon::parse($currentPrice->date_end) : Carbon::maxValue();
        $newStart = $newPrice['date_start'] ? Carbon::parse($newPrice['date_start']) : Carbon::minValue();
        $newEnd = $newPrice['date_end'] ? Carbon::parse($newPrice['date_end']) : Carbon::maxValue();

        $periodsOverlap = $currentStart <= $newEnd && $currentEnd >= $newStart;

        return $periodsOverlap ? 'create_override' : 'create_new';
    }

    // Оставим на будущее - сейчас не вызывается... нужно будет подумать...
    private function updateProductPriceCache(Product $product) {
        // Здесь обновляем price_regular, price_special, price_preorder в products
        // на основе актуальных записей в prices
        $product->refreshPriceCache();
    }
}
