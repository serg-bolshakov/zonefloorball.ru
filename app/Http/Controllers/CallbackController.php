<?php
// app/Http/Controllers/CallbackController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail; 
use App\Models\CallbackRequest;
use App\Mail\CallbackRequestNotification; 
use Illuminate\Support\Facades\Log; 

class CallbackController extends Controller {

    public function store(Request $request) {

        $validated = $request->validate([
            'phone'         => 'required|string|max:20',
            'help_type'     => 'required|in:ordering,consultation,technical,other',
        ], [
            'phone.required' => 'Пожалуйста, укажите номер телефона!',
            'help_type.required' => 'Пожалуйста, выберите тему обращения!',
            'help_type.in' => 'Выберите тему обращения из списка!',
        ]);

        $callback = CallbackRequest::create([
            'phone'         => $validated['phone'],
            'help_type'     => $validated['help_type'],
            'ip_address'    => $request->ip(),
            'status'        => CallbackRequest::STATUS_NEW,
        ]);

        // Отправка уведомлений админу
        // Mail::to(config('mail.admin_email'))->send(new CallbackRequestNotification($callback));

        $recipients = array_filter([
            config('mail.admin_email'),
            config('mail.boss_email')
        ]);
        
        if (!empty($recipients)) {
            Mail::to($recipients)->send(
                new CallbackRequestNotification($callback)
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Спасибо. Мы перезвоним вам в течение ближайшего времени!'
        ]);
    }

}