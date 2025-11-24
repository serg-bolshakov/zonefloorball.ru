<?php
// app/Listeners/SendNewUserNotification.php

namespace App\Listeners;

use App\Mail\NewUserRegistered;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Mail;

class SendNewUserNotification
{
    public function handle(Registered $event) {
        
        $recipients = array_filter([
            config('mail.admin_email'),
            config('mail.boss_email')
        ]);
        
        if (!empty($recipients)) {
            Mail::to($recipients)->send(
                new NewUserRegistered($event->user)
            );
        }
    }
}

// ПРАВИЛЬНЫЙ вариант - все получатели в to, админ в bcc
/*Mail::to($recipients)
    ->bcc([                             скрытая копия...
        config('mail.admin_email'),
        config('mail.boss_email')
    ])
    ->send(new NewUserRegistered($event->user));*/