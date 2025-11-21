<?php
// app/Mail/CallbackRequestNotification.php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use App\Models\CallbackRequest;

/**
 * Email уведомление о новом зарегистрированном запросе на обратный звонок
 * {{-- resources/views/emails/callbackrequest-notification.blade.php --}}
 */

class CallbackRequestNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public CallbackRequest $callback) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Запрос телефонного звонка",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.callbackrequest-notification',
            with: [
                'callback' => $this->callback,
                'helpTypeText' => $this->callback->help_type_text, // используем аксессор
                'registrationTime' => now()->format('d.m.Y H:i'),
            ],
        );
    }
}