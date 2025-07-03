<?php
// app/Providers/AppServiceProvider.php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Validator;
use App\Services\InnValidator;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        
        // Старый вариант (можно оставить для обратной совместимости)
        Validator::extend('inn', function ($attribute, $value, $parameters) {
            return InnValidator::validate($value);
        });

        // Новый вариант - прямое использование класса (29.06.2025)
        Validator::extend('inn_rule', InnValidator::class);
    }
}
