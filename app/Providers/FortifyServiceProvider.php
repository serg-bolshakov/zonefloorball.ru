<?php
// app/Providers/FortifyServiceProvider.php
namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;              // Это не используем (вариант из коробки), реализовали в самописном контроллере...
use App\Actions\Fortify\ResetUserPassword;
use App\Actions\Fortify\UpdateUserPassword;
use App\Actions\Fortify\UpdateUserProfileInformation;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

// обрабатываем процесс аутентификации (12.12.2024): https://github.com/russsiq/laravel-docs-ru/blob/9.x/docs/fortify.md#customizing-user-authentication
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Fortify\Fortify;

use Laravel\Fortify\Features;   /* не работает: Class "App\Providers\Features" not found* - на "авось" прописал use Laravel\Fortify\Features; строка 21 */

// обрабатываем процесс подтверждения адреса электронной почты (13.12.2024): https://github.com/russsiq/laravel-docs-ru/blob/9.x/docs/fortify.md#email-verification

// Настройка конвейра аутентификации 13.12.2024 https://github.com/russsiq/laravel-docs-ru/blob/9.x/docs/fortify.md#customizing-the-authentication-pipeline
use Laravel\Fortify\Actions\AttemptToAuthenticate;
use Laravel\Fortify\Actions\EnsureLoginIsNotThrottled;
use Laravel\Fortify\Actions\PrepareAuthenticatedSession;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;
// вот этот кусочек зарисовал... но не понимаю где можно увидеть эти Actions... 

// Если вам нужна расширенная настройка этого поведения, то вы можете связать реализации контрактов LoginResponse и LogoutResponse 
// в контейнере служб Laravel. Обычно это должно быть сделано в методе register поставщика App\Providers\FortifyServiceProvider 
// вашего приложения:     https://github.com/russsiq/laravel-docs-ru/blob/9.x/docs/fortify.md#customizing-authentication-redirects
use Laravel\Fortify\Contracts\LogoutResponse;
use Laravel\Fortify\Contracts\LoginResponse;

// Выход из приложения (пытаюсь как-то сделать) https://github.com/russsiq/laravel-docs-ru/blob/9.x/docs/authentication.md#logging-out
use Illuminate\Support\Facades\Auth;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        /*  Настройка переадресации. Если попытка входа в систему окажется успешной, то Fortify перенаправит вас на URI, 
            настроенный с помощью параметра home конфигурации в конфигурационном файле fortify вашего приложения. Если запрос был запросом XHR, 
            будет возвращен 200 HTTP-ответ. После выхода пользователя из приложения он будет перенаправлен на URI /.

            Если вам нужна расширенная настройка этого поведения, то вы можете связать реализации контрактов LoginResponse и 
            LogoutResponse в контейнере служб Laravel. Обычно это должно быть сделано в методе register поставщика 
            App\Providers\FortifyServiceProvider вашего приложения: 

                12/12/2024
        */
               
        /*$this->app->instance(LogoutResponse::class, new class implements LogoutResponse {
            public function toResponse($request) {
                return redirect('/');
            }
        });*/

        // 26.05.2025 решили задачу переадресации пользователя после авторизации на ту страницу, с которой он инициировал процесс авторизации: пробовал передать корректный URL через сессию,
        // но в процессе авторизации происходила регенерация session_id и URL терялся. Задача решена путём передачи корректного URL
        // через куки. Корректный URL для переадресации "отловили" в AuthServiceProvider - только там это можно сделать... как оказалось...
        $this->app->instance(LoginResponse::class, new class implements LoginResponse {
            public function toResponse($request)
            {
                $redirectUrl = $request->cookie('login_redirect', '/');
                // $redirectUrl = session()->pull('login_original_url', '/');
                // $redirectUrl = session('login_original_url', '/');
                // session()->forget('login_original_url'); // Очищаем
                
                return redirect($redirectUrl);
            }
        });
    }

    // Выход из приложения (пытаюсь как-то сделать) https://github.com/russsiq/laravel-docs-ru/blob/9.x/docs/authentication.md#logging-out
    /** Выход пользователя из приложения.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    /*public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // $root = session('_previous.url');
        // dd($root);   - когда жмём логаут - сюда не приходим...
        // return redirect("$root");
        return redirect('/');
    }*/

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::updateUserProfileInformationUsing(UpdateUserProfileInformation::class);
        Fortify::updateUserPasswordsUsing(UpdateUserPassword::class);
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);

        // Настройка конвейра аутентификации 13.12.2024 https://github.com/russsiq/laravel-docs-ru/blob/9.x/docs/fortify.md#customizing-the-authentication-pipeline
        /* не работает: Class "App\Providers\Features" not found* - на "авось" прописал use Laravel\Fortify\Features; строка 21 */
        Fortify::authenticateThrough(function (Request $request) {
            return array_filter([
                    config('fortify.limiters.login') ? null : EnsureLoginIsNotThrottled::class,
                    Features::enabled(Features::twoFactorAuthentication()) ? RedirectIfTwoFactorAuthenticatable::class : null,
                    AttemptToAuthenticate::class,
                    PrepareAuthenticatedSession::class,
            ]);
        });
        
        // Настройка конвейра аутентификации 13.12.2024... до сих - этот кусочек вписал... 

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        // добавил 08.12.2024 (изучаю документацию Ларавел): Fortify позаботится об определении маршрута /login, который возвращает этот шаблон:
        Fortify::loginView(function () {
            return view('auth.login');
        });

        // 12.12.2024: требуется полная настройка того, как аутентифицируются учетные данные для входа и извлекаются пользователи. 
        // К счастью, Fortify позволяет легко добиться этого с помощью метода Fortify::authenticateUsing.
        Fortify::authenticateUsing(function (Request $request) {
            $user = User::where('email', $request->email)->first();

            if ($user &&
                Hash::check($request->password, $user->password)) {
                    /*\Log::debug('Fortify auth success', [
                        'user_id' => $user->id,
                        'session_id' => session()->getId()
                    ]);*/
                session()->flash('flash', "Вы авторизовались. Мы ждали вас, $user->name!");  // с помощью метода flash сохраняем элемент в сессию только для следующего запроса. - это тз прежнего - тоже пока настроить не могу... 
                return $user;
            }
        });

        Fortify::requestPasswordResetLinkView(function () {
            return view('auth.forgot-password');
        });

        Fortify::registerView(function () {
            return view('auth.register');
        });
        
        // 07/01/2025 - всё работает! Это работает, когда юзер при логине, жмёт на ссылку "не помню пароль" и ему по электронной почте приходит ссылка на сброс пароля!!! Проходим по этой ссылке и попадаем сюда:
        Fortify::resetPasswordView(function (Request $request) { 
            return view('auth.reset-password', ['request' => $request]);
        });

        // 13.12.2024 - подтверждение адреса электронной почты:
        Fortify::verifyEmailView(function () {
            return view('auth.verify-email');
        });

        Fortify::confirmPasswordView(function () {
            return view('auth.confirm-password');
        });
    }
}
