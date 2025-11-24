{{-- resources/views/emails/review-moderation.blade.php --}}

@component('mail::message')
# 📝 Новый отзыв требует модерации

Пользователь **{{ $review->user->name }}** оставил отзыв на товар **"{{ $review->product->title }}"**.

**Оценка:** {{ $review->rating }}/5 ⭐  
**Дата:** {{ $review->created_at->format('d.m.Y H:i') }}

@if($review->advantages)
**Достоинства:**  
{{ $review->advantages }}
@endif

@if($review->disadvantages)
**Недостатки:**  
{{ $review->disadvantages }}
@endif

**Комментарий:**  
{{ $review->comment }}

@component('mail::button', ['url' => $moderationUrl])
Перейти к модерации
@endcomponent

@endcomponent