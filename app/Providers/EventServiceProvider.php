<?php

namespace App\Providers;

use App\Listeners\RedirectAfterRegistration;        // 09.01.2025 регистрируем слушатель RedirectAfterRegistration в EventServiceProvider (здесь)  для события Registered:
use Illuminate\Auth\Events\Registered;

use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
            RedirectAfterRegistration::class,           // 09.01.2025 регистрируем слушатель RedirectAfterRegistration в EventServiceProvider (здесь)  для события Registered:
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
        {
            //
        }
    
/*
    public function boot()
    {
        parent::boot();
    }
*/
    /**
     * Determine if events and listeners should be automatically discovered.
     */

/*
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
*/
}
