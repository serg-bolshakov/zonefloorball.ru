<?php
// app/Providers/AuthRedirectServiceProvider.php 
// создал с целью настроить переадрацию пользователя после авторизации обратно на ту страницу, с которой он нажал login
// 21.05.2025 - пока неудачно - цели не достиг...

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Fortify\Fortify;

class AuthRedirectServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void {
        Fortify::authenticateUsing(function (Request $request) {
            $request->session()->put('url.intended', url()->previous());
        });
        
        Fortify::loginView(function () {
            return redirect()->back(); // Возврат на предыдущую страницу
        });
    }
}
