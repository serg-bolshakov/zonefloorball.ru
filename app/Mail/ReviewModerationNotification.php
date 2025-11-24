<?php
// app/Mail/ReviewModerationNotification.php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use App\Models\Review;

/**
 * Email уведомление о новом отзыве
 * Сначала создадим шаблон письма для модерации:
 * {{-- resources/views/emails/review-moderation.blade.php --}}
 */

class ReviewModerationNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Review $review
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Новый отзыв требует модерации - ' . config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.review-moderation',
            with: [
                'review' => $this->review,
                'appName' => config('app.name'),
                'moderationUrl' => config('app.url') . '/admin/reviews', // позже заменим на реальный URL админки
            ],
        );
    }
}