<?php
// app/Services/DocumentService.php

namespace App\Services;

use App\Models\Document;
use App\Models\DocumentItem;
use App\Models\StockMovement;
use App\Models\ProductReport;
use App\Models\Price;
use App\Models\Product;
use App\Models\PriceType;

use Illuminate\Support\Facades\DB;
use Exception;

class DocumentService
{
    /**
     * Создание нового документа
     */
    public function createDocument(array $data): Document
    {
        return DB::transaction(function () use ($data) {

            \Log::debug('🔄 DocumentService->createDocument Транзакция начата');

            // ✅ РАССЧИТЫВАЕМ ОБЩУЮ СУММУ ДОКУМЕНТА
            $totalAmount = collect($data['items'])->sum(function ($item) {
                return ($item['quantity'] ?? 0) * ($item['price'] ?? 0);
            });

            \Log::debug('💰 Расчет общей суммы документа', [
                'total_amount' => $totalAmount,
                'items_count' => count($data['items'])
            ]);

            // логирование общего количества позиций
            \Log::debug("📦 Обработка документа", [
                'document_type_id' => $data['document_type_id'],
                'document_date' => $data['document_date'],
                'items_count' => count($data['items'] ?? [])
            ]);

            \Log::debug("📦 Вызываем метод сервиса: Генерация номера документа", [
                'document_type_id' => $data['document_type_id'],
                'document_date' => $data['document_date'],
            ]);

            // Генерация номера документа
            $documentNumber = $this->generateDocumentNumber(
                $data['document_type_id'],
                $data['document_date']
            );

            \Log::debug('✅ Номер документа получен, начинаем создавать документ: $document = Document::create', [
                'documentNumber' => $documentNumber
            ]);

            $document = Document::create([
                'uuid' => \Illuminate\Support\Str::uuid(),
                'document_number' => $documentNumber,
                'document_type_id' => $data['document_type_id'],
                'document_date' => $data['document_date'],
                'warehouse_id' => $data['warehouse_id'] ?? 1,
                'user_id' => $data['user_id'] ?? null,
                'comment' => $data['comment'] ?? null,
                'total_amount' => $totalAmount,
                'created_by' => auth()->id(),
                'status' => 'draft',
            ]);

            \Log::debug('✅ Новый документ создан', [
                'document_id' => $document->id,
                'document_number' => $document->document_number,
                'status' => $document->status
            ]);

            // Добавляем позиции если есть
            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $index => $itemData) {
                    \Log::debug("📦 Обработка позиции {$index}", [
                        'product_id' => $itemData['product_id'],
                        'quantity' => $itemData['quantity'],
                        'price' => $itemData['price']
                    ]);
                    $this->addItemToDocument($document, $itemData);
                }

                \Log::debug('✅ Все позиции документа обработаны', [
                    'processed_items' => count($data['items'])
                ]);
            }

            \Log::debug('📋 Документ создан, позиции добавлены. Начинаем ПРОВЕДЕНИЕ');
            $postedDocument = $this->postDocument($document);
            
            // финал транзакции
            \Log::debug('🎉 DocumentService->createDocument Транзакция завершена успешно', [
                'document_id' => $postedDocument->id,
                'status' => $postedDocument->status,
                'posted_at' => $postedDocument->posted_at
            ]);

            /** $document->load('items'); 
             * 
             * $document->items; // Collection с позициями документа
             * return $document;
             * 
             */

            // return $document->load('items');

            return $postedDocument->load('items');
        });
    }

    /**
     * Добавление позиции в документ
     */
    public function addItemToDocument(Document $document, array $itemData): DocumentItem
    {
        if ($document->status !== 'draft') {
            throw new Exception('Нельзя добавлять позиции в проведенный документ');
        }

        return DocumentItem::create([
            'uuid' => \Illuminate\Support\Str::uuid(),
            'document_id' => $document->id,
            'product_id' => $itemData['product_id'],
            'quantity' => $itemData['quantity'],
            'price' => $itemData['price'] ?? 0,
            'unit_id' => $itemData['unit_id'] ?? 1,
            'comment' => $itemData['comment'] ?? null,
            'sort_order' => $this->getNextSortOrder($document->id),
        ]);
    }

    /**
     * Проведение документа
     */
    public function postDocument(Document $document): Document
    {
        return DB::transaction(function () use ($document) {

            \Log::debug('🔄 DocumentService->postDocument. Проведение документа. Транзакция начата');

            if ($document->status !== 'draft') {
                throw new Exception('Документ уже проведен или отменен');
            }

            if ($document->items->isEmpty()) {
                throw new Exception('Нельзя провести документ без позиций');
            }

            \Log::debug('🔄 DocumentService->postDocument. Создаём движение документа. createStockMovements');
            
            // В зависимости от типа документа создаем движения
            $this->createStockMovements($document);

            \Log::debug('✅ Движение документа создано');

            // Обновляем статус документа
            $document->update([
                'status' => 'posted',
                'posted_at' => now(),
                'posted_by' => auth()->id(),
            ]);

            return $document->load(['items', 'movements']);
        });
    }

    /**
     * Создание движений товаров при проведении
     */
    protected function createStockMovements(Document $document): void
    {
        $movementType = $this->getMovementType($document->document_type_id);

        foreach ($document->items as $item) {
            // Рассчитываем остаток после движения
            
            // ✅ Блокируем запись для предотвращения гонок
            $report = ProductReport::where('product_id', $item->product_id)
                ->lockForUpdate()
                ->first();

            if (!$report) {
                $report = ProductReport::create([
                    'product_id' => $item->product_id,
                    'in_stock' => 0,
                    'on_sale' => 0,
                    'reserved' => 0
                ]);
            }

            \Log::debug('📊 Расчет остатков товара', [
                'product_id' => $item->product_id,
                'current_stock' => $report->in_stock,
                'movement_type' => $movementType,
                'quantity' => $item->quantity
            ]);
            
            // ✅ Атомарное обновление в БД
            if ($movementType === 'in') {
                $report->increment('in_stock', $item->quantity);
                // $report->on_sale += $item->quantity; // ⏳ Пока не добавляем в продажу!
            } else {
                $report->decrement('in_stock', $item->quantity);
                // on_sale тоже уменьшаем если нужно
            }

            // ✅ Получаем обновленное значение
            $newStock = $report->fresh()->in_stock;

            \Log::debug('✅ Остатки обновлены', [
                'product_id' => $item->product_id,
                'new_stock' => $newStock
            ]);

            // Создаем движение
            \Log::debug('📝 Создаем запись движения товара', [
                'document_id' => $document->id,
                'product_id' => $item->product_id,
                'quantity' => $item->quantity
            ]);
            
            \Log::debug('📝 Проверяем данные перед созданием движения', [
                'document_id' => $document->id,
                'product_id' => $item->product_id,
                'unit_id' => $item->unit_id,
                'movement_type' => $movementType,
                'quantity' => $item->quantity,
                'stock_after_movement' => $newStock,
                'movement_date' => $document->document_date,
                'movement_date_type' => gettype($document->document_date),
                'movement_date_value' => $document->document_date
            ]);

            try {
                $movement = StockMovement::create([
                    'document_id' => $document->id,
                    'product_id' => $item->product_id,
                    'unit_id' => $item->unit_id,
                    'movement_type' => $movementType,
                    'quantity' => $item->quantity,
                    'stock_after_movement' => $newStock,
                    'movement_date' => $document->document_date, // Формат Y-m-d?
                ]);
                
                \Log::debug('✅ Движение StockMovement создано', ['id' => $movement->id]);
                
            } catch (\Exception $e) {
                \Log::error('❌ Ошибка создания движения', [
                    'error' => $e->getMessage(),
                    'data' => [
                        'document_date' => $document->document_date,
                        'unit_id' => $item->unit_id,
                    ]
                ]);
                throw $e;
            }

            \Log::debug('✅ Движение StockMovement создано');

            // ✅ Расчет себестоимости (для ЛЮБОГО прихода с ценой > 0)
            if ($movementType === 'in' && $item->price > 0) {
                $this->updateProductCost($item->product_id, $item->quantity, $item->price);
            }
        }
    }

    /**
     * Определение типа движения по типу документа
     */
    protected function getMovementType(int $documentTypeId): string
    {
        // логика такая: 1-приход, 2-расход, 3-приход, 4-расход
        return in_array($documentTypeId, [1, 3]) ? 'in' : 'out';
    }

    /**
     * Генерация номера документа
     */
    protected function generateDocumentNumber(int $documentTypeId, string $date): string
    {
        $prefix = $this->getDocumentPrefix($documentTypeId);
        $year = date('Y', strtotime($date));
        
        $lastDocument = Document::where('document_type_id', $documentTypeId)
            ->whereYear('document_date', $year)
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $lastDocument ? (int) substr($lastDocument->document_number, -5) + 1 : 1;

        return $prefix . '-' . $year . '-' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Префикс для номера документа
     */
    protected function getDocumentPrefix(int $documentTypeId): string
    {
        return match($documentTypeId) {
            1 => 'TN-P', // Товарная накладная приход
            2 => 'TN-R', // Товарная накладная расход
            3 => 'OP',   // Оприходование
            4 => 'SP',   // Списание
            default => 'DOC'
        };
    }

    /**
     * Получение следующего порядка сортировки
     */
    protected function getNextSortOrder(int $documentId): int
    {
        $lastItem = DocumentItem::where('document_id', $documentId)
            ->orderBy('sort_order', 'desc')
            ->first();

        return $lastItem ? $lastItem->sort_order + 1 : 1;
    }

    /**
     * Получение текущей себестоимости товара
     */
    protected function getCurrentCostPrice(int $productId): float {
        $costPrice = Price::where([
                'product_id' => $productId,
                'price_type_id' => Price::TYPE_COST
            ])
            ->where(function($query) {
                $query->where('date_end', '>=', now())
                    ->orWhereNull('date_end');
            })
            ->where('date_start', '<=', now())
            ->latest('date_start')
            ->value('price_value');
        
        return $costPrice ?? 0;
    }

    protected function updateProductCost(int $productId, int $quantity, float $incomePrice): void
    {
        // находим продукт
        $product = Product::find($productId);

        if (!$product) {
            \Log::error('❌ Продукт не найден', ['product_id' => $productId]);
            return;
        }

        // Получаем текущую себестоимость - было: $currentCost = $this->getCurrentCostPrice($productId); Стало:
        $currentCost = $product->getCostPriceAtDate(now());
        
        \Log::debug('🧮 Расчет себестоимости START', [
            'product_id' => $productId,
            'current_cost' => $currentCost,
            'new_quantity' => $quantity,
            'purchase_price' => $incomePrice
        ]);
        
        // ✅ Пересчитываем ТОЛЬКО если цена изменилась
        if ($currentCost != $incomePrice) {
            $newCost = $this->calculateAverageCost($productId, $quantity, $currentCost, $incomePrice);
            
            \Log::debug('📈 Себестоимость изменилась', [
                'old_cost' => $currentCost,
                'new_cost' => $newCost,
                'change' => $newCost - $currentCost
            ]);

            // ✅ 1. СНАЧАЛА закрываем предыдущую себестоимость
            $closedCount = (int) Price::where('product_id', $productId)     // $closedCount не будет null - метод update() всегда возвращает int (количество обновленных строк).
                ->where('price_type_id', Price::TYPE_COST)
                ->whereNull('date_end')
                ->where('date_start', '<=', now()) // ✅ Только текущие и прошлые
                ->update(['date_end' => now()]);
                
            \Log::debug('🔒 Закрыто предыдущих цен', ['count' => $closedCount]);
            
            // ✅ 2. ПОТОМ создаем новую себестоимость
            $newPrice = Price::create([
                'product_id' => $productId,
                'price_type_id' => Price::TYPE_COST,
                'price_value' => $newCost,
                'date_start' => now(),  // ✅ Дата начала действия, Бессрочно до следующего изменения
                'author_id' => auth()->id()
            ]);
            \Log::debug('✅ Новая себестоимость создана', [
                'price_id' => $newPrice->id,
                'value' => $newPrice->price_value
            ]);
        } else {
            \Log::debug('⚖️ Себестоимость не изменилась', [
                'current_cost' => $currentCost,
                'purchase_price' => $incomePrice
            ]);
        }
    }

    /**
     * Формула средневзвешенной себестоимости:
     * Новая_себестоимость = (Старый_запас * Старая_себестоимость + Новое_количество * Цена_закупки) / (Старый_запас + Новое_количество)
     */
    public function calculateAverageCost(int $productId, int $newQuantity, float $currentCost , float $incomePrice): float {

        $product = Product::with('productReport')->find($productId);
        $currentStock = $product->productReport->in_stock ?? 0; // Здесь уже ОБНОВЛЁННОЕ значение
        $oldStock = $currentStock - $newQuantity;
        
        if ($oldStock + $newQuantity == 0) {
            return 0;
        }
        
        $newCost = (
            ($oldStock * $currentCost) + 
            ($newQuantity * $incomePrice)
        ) / ($currentStock);

        
        \Log::info('DocumentService: расчет себестоимости', [
            'product_id' => $productId,
            'old_quantity' => $oldStock,
            'old_price' => $currentCost,
            'new_quantity' => $newQuantity, 
            'new_income_price' => $incomePrice,
            'current_stock' => $currentStock,
            'new_cost' => $newCost
        ]);

        return round($newCost, 2);
    }

    public function createAssemblyDocument(array $data): Document
    {
        return DB::transaction(function () use ($data) {
            // Генерация номера документа
            $documentNumber = $this->generateDocumentNumber(5, $data['document_date']);
            
            // Создаем документ
            $document = Document::create([
                'uuid' => Str::uuid(),
                'document_number' => $documentNumber,
                'document_type_id' => 5, // Комплектация
                'document_date' => $data['document_date'],
                'comment' => $data['comment'] ?? 'Автоматическая комплектация',
                'created_by' => auth()->id(),
                'status' => 'draft',
            ]);

            // Для каждого собираемого товара
            foreach ($data['items'] as $itemData) {
                $this->processAssemblyItem($document, $itemData);
            }

            // Проводим документ
            return $this->postDocument($document);
        });
    }

    protected function processAssemblyItem(Document $document, array $itemData): void
    {
        $product = Product::with('kitComponents.component.productReport')->find($itemData['product_id']);
        
        if (!$product) {
            throw new Exception("Товар для комплектации не найден");
        }

        if (!$product->canBeAssembled()) {
            throw new Exception("Товар '{$product->title}' нельзя собрать - недостаточно комплектующих");
        }

        $availability = $product->getAssemblyAvailability($itemData['quantity']);

        if (!$availability['can_assemble']) {
            $missingDetails = collect($availability['missing_components'])
                ->map(fn($item) => "{$item['component']->title}: нужно {$item['required']}, есть {$item['available']}")
                ->implode('; ');
                
            throw new Exception("Нельзя собрать '{$product->title}'. Недостаточно: {$missingDetails}");
        }
        
        $assemblyQuantity = $itemData['quantity'];
        $assemblyCost = 0;

        \Log::debug('🔧 Начинаем комплектацию товара', [
            'product_id' => $product->id,
            'product_name' => $product->title,
            'quantity' => $assemblyQuantity
        ]);

        // 1. СПИСЫВАЕМ комплектующие (СОЗДАЕМ ПОЗИЦИИ ДОКУМЕНТА)
        foreach ($product->kitComponents as $kitComponent) {
            $component = $kitComponent->component;
            $requiredQuantity = $kitComponent->quantity * $assemblyQuantity;
            
            \Log::debug('📤 Списание комплектующей', [
                'component_id' => $component->id,
                'component_name' => $component->title,
                'required_quantity' => $requiredQuantity,
                'kit_quantity' => $kitComponent->quantity
            ]);

            // Создаем позицию списания для комплектующей
            DocumentItem::create([
                'uuid' => Str::uuid(),
                'document_id' => $document->id,
                'product_id' => $component->id,
                'quantity' => $requiredQuantity,
                'price' => $component->current_cost_price,
                'unit_id' => $component->product_unit_id ?? 1,
                'comment' => "Комплектующая для {$product->title}",
                'sort_order' => $this->getNextSortOrder($document->id),
            ]);

            $assemblyCost += $kitComponent->getComponentCost($assemblyQuantity); // с множителем!
        }

        // 2. ОПРИХОДУЕМ собранный товар
        $assemblyUnitCost = $assemblyCost / $assemblyQuantity;

        \Log::debug('📥 Оприходование собранного товара', [
            'product_id' => $product->id,
            'quantity' => $assemblyQuantity,
            'unit_cost' => $assemblyUnitCost,
            'total_cost' => $assemblyCost
        ]);

        DocumentItem::create([
            'uuid' => Str::uuid(),
            'document_id' => $document->id,
            'product_id' => $product->id,
            'quantity' => $assemblyQuantity,
            'price' => $assemblyUnitCost,
            'unit_id' => $product->product_unit_id ?? 1,
            'comment' => "Собран из комплектующих",
            'sort_order' => $this->getNextSortOrder($document->id),
        ]);

        // Обновляем общую сумму документа
        $document->update([
            'total_amount' => $assemblyCost
        ]);

        // ВОТ ТЕПЕРЬ ФИЗИЧЕСКОЕ СПИСАНИЕ И ОПРИХОДОВАНИЕ!
        $this->executeInventoryOperations($document);
    }

    protected function executeInventoryOperations(Document $document): void
    {
        foreach ($document->items as $item) {
            $stockMovementType = $this->getMovementTypeForItem($document->document_type_id, $item);
            
            StockMovement::create([
                'uuid' => Str::uuid(),
                'document_item_id' => $item->id,
                'product_id' => $item->product_id,
                'warehouse_id' => $document->warehouse_id, // Добавляем в документ!
                'quantity' => $stockMovementType === 'out' ? -$item->quantity : $item->quantity,
                'movement_type' => $stockMovementType,
                'cost_price' => $item->price,
                'movement_date' => $document->document_date,
            ]);
            
            // Обновляем остатки товара
            $this->updateProductStock($item->product_id, $document->warehouse_id, $item->quantity, $stockMovementType);
        }
    }

    protected function getMovementTypeForItem(int $documentTypeId, DocumentItem $item): string
    {
        // Для документа "Комплектация":
        // - Комплектующие списываются (out)
        // - Собранный товар приходуется (in)
        
        if ($documentTypeId === 5) { // Комплектация
            // Определяем по продукту: если это комплектующая в составе - списание
            $isComponent = $document->items
                ->where('product_id', $item->product_id)
                ->where('comment', 'like', '%Комплектующая для%')
                ->isNotEmpty();
                
            return $isComponent ? 'out' : 'in';
        }
        
        return 'out'; // по умолчанию
    }
}