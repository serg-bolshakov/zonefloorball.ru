<?php
// app/Models/User.php
namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;


/*  https://github.com/russsiq/laravel-docs-ru/blob/9.x/docs/fortify.md#password-confirmation
    13.12.2024
    После регистрации мы хотим, чтобы пользователь подтвердил свой адрес электронной почты, 
    прежде чем он продолжит взаимодействие с приложением. Для начала убедитесь, 
    что функционал emailVerification включен в массиве features вашего файла конфигурации fortify. (убедился...)
    Затем вы должны убедиться, что ваш класс App\Models\User реализует интерфейс Illuminate\Contracts\Auth\MustVerifyEmail.
*/

   class User extends Authenticatable implements MustVerifyEmail    // если я правильно понял... добавил реализацию интерфейса... implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name', 
        'email', 'pers_email',
        'password', 'privacy_policy_agreed_at', 'offer_agreed_at', 'privacy_policy_version', 'offer_version',
        'pers_surname', 'pers_tel', 'delivery_addr_on_default', 'date_of_birth', 'action_auth_id', 'initial_legal_agreement_ip', 
        'is_taxes_pay', 'org_tel', 'org_inn', 'org_kpp', 'org_addr', 'client_type_id', 'client_rank_id', 'email_verified_at', 'this_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast (приведение типов...)
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // метод для проверки актуальности согласий оферты и пользовательского соглашения:
    public function needsLegalReconfirm(): bool {
        $latestPrivacyVersion = LegalDocument::getCurrentVersion('privacy_policy')->version;
        $latestOfferVersion = LegalDocument::getCurrentVersion('offer')->version;
        
        return $this->privacy_policy_version !== $latestPrivacyVersion || 
            $this->offer_version !== $latestOfferVersion;
    }

    /* Получить ранг пользователя */
    public function rank() {
        return $this->belongsTo(ClientRank::class, 'client_rank_id');
    }
    
    /* У авторизованного пользователя может быть одна JSON-строка избранного */
    public function favorites() {
        // return $this->hasOne(Favorite::class);
        return $this->hasOne(Favorite::class)->withDefault([
            'product_ids' => '[]' // Всегда JSON-строка
        ]);
    }

    // получить список просмотренных товаров - вернёт коллекцию записей:
    public function recentlyViewedProducts() {
        // У пользователя много записей в этой таблице
        return $this->hasMany(RecentlyViewedProduct::class);
    }

    /* Получить права доступа пользователя */
    /**
     * Связь: Пользователь → Права доступа
     * - Не может быть NULL (RESTRICT при удалении)
     * - Обновляется автоматически при изменении ID в user_accesses (CASCADE)
     */
    public function access() {
        return $this->belongsTo(UserAccess::class, 'user_access_id');
    }

    /** Получить заказы пользователя
     *  Связь: Пользователь → Заказы
     */
    # При вызове метода orders, Eloquent попытается найти модели Order, 
    # у которой есть order_client_id, который соответствует столбцу id в модели User.
    public function orders() {
        // У пользователя может быть много записей в таблице orders
        return $this->hasMany(Order::class, 'order_client_id');
    }

    /** Определение типа организации по ИНН */
    public function isIndividualEntrepreneur(string $inn): bool {
        // ИП имеют ИНН физлица (12 цифр)
        return strlen(preg_replace('/\D/', '', $inn)) === 12;
    }
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