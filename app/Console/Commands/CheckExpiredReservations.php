<?php

namespace App\Console\Commands;

use Illuminate\Support\Facades\DB;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\WorkingDaysService;
use Illuminate\Console\Command;

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
        $expiredOrders = Order::where('status_id', OrderStatus::RESERVED->value)
            ->where('created_at', '<=', WorkingDaysService::getExpirationDate(-3))
            ->with(['items.productReport'])
            ->get();

        foreach ($expiredOrders as $order) {
            $this->processExpiredOrder($order);
        }
    }

    private function processExpiredOrder(Order $order): void
    {
        DB::transaction(function () use ($order) {
            // а) Обновляем статус заказа
            $order->update(['status_id' => OrderStatus::NULLIFY->value]);
            
            // б) Возвращаем товары в продажу
            foreach ($order->items as $item) {
                $item->productReport->update([
                    'reserved' => DB::raw("reserved - {$item->quantity}"),
                    'on_sale' => DB::raw("on_sale + {$item->quantity}")
                ]);
            }
            
            // в) Фиксируем в истории
            $order->statusHistories()->create([
                'old_status' => OrderStatus::RESERVED->value,
                'new_status' => OrderStatus::NULLIFY->value,
                'comment' => 'Покупатель не оплатил заказ в течение 3-х рабочих дней'
            ]);
        });
    }
}
