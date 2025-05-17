<?php
// app/Console/Kernel.php
namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Генерация sitemap
        $schedule->command('sitemap:generate')->daily();
        
        // Очистка старых просмотров товаров (товаров, просмотренных более года назад)
        $schedule->call(function () {
            RecentlyViewedProduct::where('viewed_at', '<', now()->subYear())->delete(); // now()->subYear() — вычисляет дату "год назад".
        })->daily();
        // Если записей будет много, будем использовать chunk для оптимизации:
        /*  $schedule->call(function () {
                RecentlyViewedProduct::where('viewed_at', '<', now()->subYear())
                    ->chunkById(1000, function ($items) {
                        $items->each->delete();
                    });
            })->daily();
        */

    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
