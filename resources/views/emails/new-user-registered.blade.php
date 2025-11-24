{{-- resources/views/emails/new-user-registered.blade.php --}}
<x-mail::message>
# Новый пользователь зарегистрирован

**Тип:** {{ $user->client_type_id === 2 ? 'Юридическое лицо' : 'Физическое лицо' }}

**Email:** {{ $user->email }}

**Имя:** {{ $user->name }}

**Время регистрации:** {{ $registrationTime }}

<x-mail::button :url="config('app.url') . '/admin/users/' . $user->id">
Посмотреть профиль
</x-mail::button>

</x-mail::message>