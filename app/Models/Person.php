<?php

namespace App\Models;

//use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// use Illuminate\Foundation\Auth\Person as Authenticatable;
use Illuminate\Notifications\Notifiable;

// class Person extends Model implements MustVerifyEmail           // ссылка автоматически отправляется пользователю по электронной почте, если ваша модель App\Models\Person (User) реализует интерфейс MustVerifyEmail:

class Person extends Model
{
    use HasFactory, Notifiable;

}

/*
Laravel 9 · Подтверждение адреса электронной почты

Подготовка модели
Убедитесь, что ваша модель App\Models\User реализует контракт Illuminate\Contracts\Auth\MustVerifyEmail:

<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    use Notifiable;

    // ...
}
Как только этот интерфейс будет добавлен в вашу модель, вновь зарегистрированным пользователям будет автоматически отправлено электронное письмо со ссылкой для подтверждения адреса электронной почты. Изучив App\Providers\EventServiceProvider, вы можете увидеть, что Laravel уже содержит слушатель SendEmailVerificationNotification, который прикреплен к событию Illuminate\Auth\Events\Registered. Этот слушатель события отправит по электронной почте пользователю ссылку для подтверждения.

*/