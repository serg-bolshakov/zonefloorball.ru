{{-- resources/views/emails/callbackrequest-notification.blade.php --}}
@component('mail::message')
# 🎧 Новый запрос звонка

**Тип помощи:** {{ $helpTypeText }}  
**Телефон:** {{ $callback->phone }}  
**Время заявки:** {{ $registrationTime }}  
**IP:** {{ $callback->ip_address }}

@component('mail::button', ['url' => config('app.url') . '/admin/callbacks'])
Посмотреть заявку
@endcomponent

@endcomponent