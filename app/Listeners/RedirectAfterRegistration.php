<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

// вот этот код добавили: 09.01.2025
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;

class RedirectAfterRegistration
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */

    /* это реализация функции handle из коробки. Перепишем её!
        public function handle(object $event): void
        {
            // 
        }
    */
    
    // вторая попытка:
    public function handle(Registered $event)
    {
        return new RedirectResponse('/email/verify');
    }
}
