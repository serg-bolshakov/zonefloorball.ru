<?php
// app/Console/Commands/CheckExpiredReservation.php
namespace App\Console\Commands;

use Illuminate\Support\Facades\DB;
use App\Enums\OrderStatus;
use App\Services\WorkingDaysService;
use Illuminate\Console\Command;

use App\Models\Order;
use App\Models\ProductReport;
use App\Models\ProductReservation;

class CheckExpiredReservations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservations:check-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Аннулирует неоплаченные резервы';

    /**
     * Execute the console command.
     */
    public function handle() {
        $this->info('Начало проверки просроченных резервов...');
        $cutoffDate = WorkingDaysService::getCutoffDate(3);
        $this->line('Дата отсечки: '.$cutoffDate);

        // Добавляем chunk для обработки больших объемов (на будущее - надеюсь оно скоро! :) )
        $processedCount = 0;

        /* $expiredOrders = Order::where('status_id', OrderStatus::RESERVED->value)
            ->where('created_at', '<=', WorkingDaysService::getExpirationDate(-3))
            ->with(['items.productReport'])
            ->get();

        foreach ($expiredOrders as $order) {
            $this->processExpiredOrder($order);
        }*/

        Order::where('status_id', OrderStatus::RESERVED->value)
            ->where('created_at', '<=', $cutoffDate)
            ->chunkById(100, function ($orders) use (&$processedCount) {
                foreach ($orders as $order) {
                    $this->processExpiredOrder($order);
                    $processedCount++;
                }
        });

        $this->info('Обработано заказов: '.$processedCount);
        \Log::info('Expired reservations processed', [
            'count' => $processedCount,
            'cutoff_date' => $cutoffDate->format('Y-m-d H:i:s') // 👈 И в лог
        ]);
        
        return Command::SUCCESS;
    }

    private function processExpiredOrder(Order $order): void {
        DB::transaction(function () use ($order) {

            // а) Обновляем payment_details
                $order->addPaymentDetails([
                    'reason' => 'cancelled',
                    'cancelled_at' => now()->toDateTimeString(),
                    'cancellation_reason' => 'Покупатель не оплатил заказ в течение установленного периода.'
                ]);
            
            // б) Обновляем payment_status
                $order->update([
                    'payment_status' => 'cancelled'
                ]);
            
            // в) Устанавливаем срок действия доступа (например, +30 дней для просмотра истории)
                $order->update([
                    'access_expires_at' => now()->addDays(30)
                ]);

            // г) Обновляем и логируем статус заказа (Фиксируем в истории)
                $order->changeStatus(
                    newStatus: OrderStatus::NULLIFY,
                    comment: 'Покупатель не оплатил заказ в течение установленного периода.'
                );
            
            // д) Освобождаем резерв товаров (возвращаем в продажу) и Логируем резерв
                // пробуем на атомарном уровне: DB::raw - атомарные операции на уровне БД (избегаем race condition)
                    /* foreach ($order->items as $item) {
                        $item->productReport->update([
                            'reserved' => DB::raw("reserved - {$item->quantity}"),
                            'on_sale' => DB::raw("on_sale + {$item->quantity}")
                        ]);
                    нужно "допились атомарное обновление таблицы резервации товаров 

                    } */

                // тоже самое, но на обычном... с предварительным чтением текущих значений:
                    $order->items()->each(function($item) use ($order) {        // Передаем $order в замыкание
                        \Log::info(" {$item}");
                        try {
                            // 1. Обновляем отчёт по остаткам (снимаем с резерва, возвращаем в продажу)
                            $productReport = ProductReport::where('product_id', $item['product_id'])
                                ->lockForUpdate() // Решает проблему "гонки"
                                ->first();
                            
                            if (!$productReport) { throw new \Exception("processExpiredOrder товар ID: {$item['product_id']} не найден в отчётах по остаткам"); }
                            $productReport->update([
                                'reserved'  => (int)$productReport->reserved - (int)$item['quantity'],
                                'on_sale'   => (int)$productReport->on_sale + (int)$item['quantity']
                            ]);

                            // 2. Обновляем таблицу резервации товаров
                            $productReservation = ProductReservation::where('product_id', $item['product_id'])->where('order_id', $order->id)
                                ->lockForUpdate() 
                                ->first();
                            if (!$productReservation) { throw new \Exception("processExpiredOrder товар ID: {$item['product_id']} не найден в отчётах по резервированию"); }
                            $productReservation->update([
                                'cancelled_at' => now(),
                            ]);

                        } catch (\Exception $e) {
                            Log::error("processExpiredOrder Ошибка снятия товара с резерва", [
                                'order_id' => $order->id,  // Логируем ID заказа
                                'product_id' => $item['product_id'],
                                'error' => $e->getMessage()
                            ]);
                            throw $e; // Пробрасываем выше для отката транзакции
                        }
                    });
        });
    }
}
