<?php
// app/Mail/ErrorNotification.php - шаблон писем
// Далее: {{-- resources/views/emails/error-notification.blade.php  Шаблон письма (Markdown)  --}}
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Throwable;

class ErrorNotification extends Mailable
{
    use Queueable;

    public function __construct(
        public Throwable $exception,
        public array $context = []
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Ошибка в приложении: '.config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.error-notification',
            with: [
                'exception' => $this->exception,
                'context' => $this->context,
                'appName' => config('app.name'),
                'time' => now()->format('Y-m-d H:i:s'),
            ],
        );
    }
}