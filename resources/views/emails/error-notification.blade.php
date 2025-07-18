{{-- resources/views/emails/error-notification.blade.php  Шаблон письма (Markdown)  --}}

@component('mail::message')
# 🚨 Произошла ошибка в {{ $appName }}

**Время:** {{ $time }}  
**Ошибка:** `{{ $exception->getMessage() }}`  
**Файл:** `{{ $exception->getFile() }}:{{ $exception->getLine() }}`

@if(!empty($context))
**Контекст:**  
```json
{{ json_encode($context, JSON_PRETTY_PRINT) }}
@endif

{{-- @component('mail::button', ['url' => url('/admin')])
Перейти в админку
@endcomponent
--}}

@endcomponent