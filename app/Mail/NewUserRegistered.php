<?php
// app/Mail/NewUserRegistered.php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use App\Models\Review;

/**
 * Email уведомление о новом зарегистрированном пользователе приложения
 * {{-- resources/views/emails/new-user-registered.blade.php --}}
 */

class NewUserRegistered extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user) {}

    public function envelope(): Envelope
    {
        $type = $this->user->client_type_id === 2 ? 'Юридическое лицо' : 'Физическое лицо';
        
        return new Envelope(
            subject: "Новый пользователь зарегистрирован - {$type}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.new-user-registered',
            with: [
                'user' => $this->user,
                'registrationTime' => now()->format('d.m.Y H:i'),
            ],
        );
    }
}