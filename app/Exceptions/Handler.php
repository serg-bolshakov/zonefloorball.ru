<?php
// app/Exceptions/Handler.php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use App\Services\ErrorNotifierService;
use Illuminate\Session\TokenMismatchException;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            if (app()->environment('production')) {
                ErrorNotifierService::notifyAdmin($e, [
                    'url' => request()?->fullUrl(),
                    'user_id' => auth()->id() ?? 'Гостевой визит',
                ]);
            }
        });
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $exception)
    {
        // Обрабатываем ошибку устаревшей CSRF-сессии
        if ($exception instanceof TokenMismatchException) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Ваша сессия истекла. Пожалуйста, обновите страницу.',
                    'refresh_required' => true
                ], 419);
            }
            
            // Для обычных запросов - редирект с сообщением
            return back()->withInput()->withErrors([
                'session' => 'Сессия устарела. Пожалуйста, повторите действие.'
            ]);
        }

        return parent::render($request, $exception);
    }
}
