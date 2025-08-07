{{-- resources/views/emails/error-notification.blade.php  Шаблон письма (Markdown)  --}}

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ru" lang="ru">
<head>
<title>{{ config('app.name') }}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

<style>
body  { margin: 0 0 0 0; padding: 10px 10px 10px 10px; background: #ffffff; color: #000000; font-size: 14px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 18px; } 
a     { color: #003399; text-decoration: underline; font-size: 14px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 18px; } 
p     { margin: 0 0 20px 0; padding: 0 0 0 0; color: #000000; font-size: 14px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 18px; } 
ul    { margin: 0 0 20px 20px; padding: 0 0 0 0; color: #000000; font-size: 14px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 18px; } 
ol    { margin: 0 0 20px 20px; padding: 0 0 0 0; color: #000000; font-size: 14px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 18px; } 
h1    { margin: 0 0 20px 0; padding: 0 0 0 0; color: #000000; font-size: 22px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 26px; font-weight: bold; } 
h2    { margin: 0 0 20px 0; padding: 0 0 0 0; color: #000000; font-size: 20px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 24px; font-weight: bold; } 
h3    { margin: 0 0 20px 0; padding: 0 0 0 0; color: #000000; font-size: 18px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 22px; font-weight: bold; } 
h4    { margin: 0 0 20px 0; padding: 0 0 0 0; color: #000000; font-size: 16px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 20px; font-weight: bold; } 
h5    { margin: 0 0 20px 0; padding: 0 0 0 0; color: #000000; font-size: 14px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 20px; font-weight: bold; }
hr    { height: 1px; border: none; color: #dddddd; background: #dddddd; margin: 0 0 20px 0; }
</style>
</head>

<body>


@component('mail::message')
# 🚨 Произошла ошибка в {{ $appName }}

**Время:** {{ $time }}  
**Ошибка:** `{{ $exception->getMessage() }}`  
**Файл:** `{{ $exception->getFile() }}:{{ $exception->getLine() }}`

@if(!empty($context))
**Контекст:**  
```json
{!! json_encode($context, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) !!}
@endif

@endcomponent
<hr>
</body>
</html>