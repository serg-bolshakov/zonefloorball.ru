<?php
// app/Rules/ValidationRules.php

/** Проблема дублирования валидации (29/06/2025)
 *      Фронтенд (React): Уже есть валидация в формах
 *      StoreOrderRequest: Валидация перед контроллером
 *      Модели (Eloquent): Правила в $fillable/$casts/аксессорах
 *      БД (миграции): Ограничения NOT NULL, VARCHAR(length)
 * 
 *  Решение: Единый источник истины: 
 *      1. Создадим базовый класс для всех правил валидации: app/Rules/ValidationRules.php
 *      2. Создадим класс для правил регистрации, наследующий базовый: app/Rules/RegistrationRules.php
 *      3. Создадим класс для правил создания заказов и покупателей, наследующий базовый: app/Rules/CustomerRules.php
*/

namespace App\Rules;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use App\Services\InnValidator;

class ValidationRules
{
    // Общие правила для имен
    public static function nameRules(): array {
        return ['required', 'string', 'max:30', "regex:#^[а-яА-ЯёЁ\s'-]+$#u"];
    }

    // Правила для телефона
    public static function phoneRules(): array {
        return ['required', "regex:#^(\+7)\s[\(][0-9]{3}[\)]\s[0-9]{3}-[0-9]{2}-[0-9]{2}$#"];
    }

    // Правила для email
    public static function emailRules(bool $unique = false): array {
        $rules = [
            'bail',         // Прекращает проверку при первой ошибке
            'filled',       // Не обязательное: на тот случай, когда пользователь регистрируем персональную почту, которая не является логином...
            'string',
            'max:32',       // Оптимальная длина email 64 - больше не нужно (меньше? - нужно подумать): средняя длина email: 20-30 символов. Максимум по стандарту RFC 5321: 254 символа. Практический лимит для большинства сервисов: 64 символа
            // 'email:rfc,dns,spoof,filter', // Строгая проверка: rfc - строгое соответствие RFC; dns - проверка MX-записей домена; spoof - защита от поддельных адресов; filter - использование PHP filter_var()
            'regex:/^[a-zA-Z0-9а-яА-ЯёЁ._%+-]+@[a-zA-Z0-9а-яА-ЯёЁ.-]+\.[a-zA-Zа-яА-ЯёЁ]{2,}$/u', // По задумке должен блокировать явно мусорные значения: 
        ];
        
        // Добавляем проверку окружения
        $rules[] = app()->environment('production') 
            ? 'email:rfc,dns,spoof,filter' 
            : 'email:rfc,dns,filter';

        if ($unique) {
            $rules[] = Rule::unique('users', 'email')->whereNull('deleted_at');
        }

        return $rules;
    }

    // Правила для адреса
    public static function addressRules(bool $isRequired = false): array {
        return $isRequired 
        ? ['bail', 'filled', 'string', 'max:255', "regex:#^[а-яА-ЯёЁ\d\s.,\"\!:\)\(\/№-]*$#u"]      // filled для обязательного случая (поле должно присутствовать, но может быть null)
        : ['bail', 'nullable', 'string', 'max:255', "regex:#^[а-яА-ЯёЁ\d\s.,\"\!:\)\(\/№-]*$#u"];   // nullable для необязательного (можно полностью пропустить поле или передать null)      
    }

    // Правила для пароля
    public static function passwordRules(): array {
        return [
            'required', 
            'confirmed', 
            Password::min(8)
                ->letters()
                ->mixedCase()
                ->numbers()
                // ->symbols()
                // ->uncompromised()
        ];
    }

    // Правила для даты рождения
    public static function birthDateRules(): array {
        return ['nullable', "regex:#^((19[5-9][0-9])|(20[0-1][0-9]))-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])$#"];
    }

    // Правила для ИНН
    public static function innRules(User $user = null): array {
        $uniqueRule = Rule::unique('users', 'org_inn');
        
        if ($user) {
            $uniqueRule->ignore($user->id)->whereNull('deleted_at');
        }

        return [
            'bail',                     // Прекратит валидацию при первой ошибке
            'filled',                   // 1. Не пустое (если присутствует)
            // 'numeric',               // проверяет, что значение является числом (может быть строкой, содержащей цифры)
            'digits_between:10,12',     // Уже подразумевает цифры
            new InnValidator(),         // Наш кастомный валидатор, который проверяет контрольную сумму по алгоритму ФНС: отсеивает "мусорные" значения, типа: 1234567890...
            $uniqueRule                 // 4. Уникальность в БД
        ];
    }

    // Правила для КПП
    public static function kppRules(): array {
        return [
            'nullable', 
            'numeric', 
            'digits:9',
        ];
    }

    // Правила для названия организации
    public static function orgNameRules(): array {
        return ['filled', 'string', 'max:255', "regex:#^[a-zA-Zа-яА-ЯёЁ\d\s.,\"!:\)\(/№-]+$#u"];
    }
}