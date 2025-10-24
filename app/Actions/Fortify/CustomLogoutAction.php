<?php
// app/Actions/Fortify/CustomLogoutAction.php - кастомный контроллер logout!
// 21.10.2025 регистрируем кастомный обработчик в FortifyServiceProvider...
// Пока нигде не вызывается!!! Функционал прописан прямо в роуте 
namespace App\Actions\Fortify;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Laravel\Fortify\Contracts\LogoutResponse;

class CustomLogoutAction
{
    public function __invoke(Request $request)
    {
        \Log::debug('Custom Fortify logout started', [
            'user_id' => Auth::id(),
            'client_type' => Auth::user()->client_type_id ?? null
        ]);

        // Получаем пользователя ДО выхода
        $user = Auth::user();
        
        // Стандартный logout Fortify
        Auth::logout();

        // Очищаем ВСЕ куки
        $cookies = [
            'laravel_session',
            'XSRF-TOKEN', 
            'remember_web',
            // Добавьте другие кастомные куки
        ];

        foreach ($cookies as $cookieName) {
            Cookie::queue(Cookie::forget($cookieName));
        }

        // Инвалидируем сессию
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        \Log::debug('Custom Fortify logout completed', [
            'previous_user' => $user->id ?? null
        ]);

        // Возвращаем стандартный response Fortify
        return app(LogoutResponse::class);
    }
}