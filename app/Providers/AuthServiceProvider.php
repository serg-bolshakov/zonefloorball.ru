<?php
// app/Provider/AuthServiceProvider.php
namespace App\Providers;

// use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;

class AuthServiceProvider extends ServiceProvider
{
    /**                                                     Это оригинальный файл "из коробки"! Только пустой изначально.
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        //
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // пробую настроить переадресацию пользователя после авторизации на ту старницу, на которой он инициировал процесс авторизации 25.05.2025
        
        $this->registerPolicies();

        // Только если это первый запрос (не редирект)
        if (!session()->has('login_original_url')) {
            $referer = request()->header('Referer');
            // Проверяем, что это не страница логина (чтобы не сохранять её как исходную)
            if ($referer && !str_contains($referer, '/login')) {
                cookie()->queue('login_redirect', $referer, 5); // 5 минут
                session(['login_original_url' => $referer]);
                session()->save(); // Принудительно сохраняем сессию!

                /*\Log::debug('AuthServiceProvider Session', [
                    'login_original_url' => $referer,
                    'sessionHere' => session('login_original_url', '/') // Просто get, без pull!
                ]);*/
            }
            
        }
    }
}
