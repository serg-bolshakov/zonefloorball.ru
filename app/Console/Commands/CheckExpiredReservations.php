<?php

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
    protected $signature = 'app:check-expired-reservations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Аннулирует неоплаченные резервы';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Начало проверки просроченных резервов...');
        $this->line('Дата отсечки: '.WorkingDaysService::getExpirationDate(-3));

        $expiredOrders = Order::where('status_id', OrderStatus::RESERVED->value)
            ->where('created_at', '<=', WorkingDaysService::getExpirationDate(-3))
            ->with(['items.productReport'])
            ->get();

        foreach ($expiredOrders as $order) {
            $this->processExpiredOrder($order);
        }

        $this->info('Обработано заказов: '.$expiredOrders->count());
        \Log::info('Expired reservations processed', ['count' => $expiredOrders->count()]);
    }

    private function processExpiredOrder(Order $order): void
    {
        DB::transaction(function () use ($order) {

            // а) Обновляем и логируем статус заказа (Фиксируем в истории)
                $order->changeStatus(
                    newStatus: OrderStatus::NULLIFY,
                    comment: 'Покупатель не оплатил заказ в течение установленного периода.'
                );
            
            // б) Освобождаем резерв товаров (возвращаем в продажу) и Логируем резерв
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
