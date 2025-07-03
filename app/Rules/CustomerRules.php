<?php
// app/Rules/CustomerRules.php

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

class CustomerRules extends ValidationRules {
        
    public static function getRules(?string $customerType): array {
        $rules = [
            // общие для всех типов покупателей правила валидации входных данных для оформления заказа:
            'customer.type'             => 'required|string|in:guest,individual,legal',
            'legal_agreement'           => 'required|accepted',
            'delivery.address'          => parent::addressRules(),
            'delivery.price'            => 'numeric',
            'delivery.time'             => 'nullable|string',
            'delivery.transportId'      => 'required|numeric',
            'products'                  => 'required|array|min:1',
            'products.*.id'             => 'required|integer',
            'products.*.quantity'       => 'required|integer|min:1',
            'products.*.price'          => 'required|numeric|min:1',
            'paymentMethod'             => 'required|string|in:online,bank_transfer,cash',
            'products_amount'           => 'required|numeric',
            'total'                     => 'required|numeric|min:1',
        ];
        
        return array_merge($rules, match($customerType) {
            'legal'                     => self::legalRules(),
            'individual'                => self::individualRules(),
            default                     => self::guestRules()
        });
    }

    public static function orderMessages(): array {
        return [
            // Общие для всех типов
            'customer.type.required'        => 'Тип покупателя обязателен.',
            'customer.type.in'              => 'Неизвестный тип покупателя.',
            'legal_agreement.required'      => 'Необходимо ознакомиться принять условия оферты и политики конфиденциальности',
            'legal_agreement.accepted'      => 'Вы должны подтвердить согласие с документами',

            // Для гостей (guest)
            'customer.firstName.required'   => 'Имя обязательно для заполнения.',
            'customer.firstName.regex'      => 'Имя должно быть на русском языке.',
            'customer.firstName.max'        => 'Длина имени по нашему мнению не может превышать :max символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.',
            'customer.lastName.required'    => 'Фамилия обязательна для заполнения.',
            'customer.lastName.regex'       => 'Фамилия должна быть на русском языке.',
            'customer.lastName.max'         => 'Длина Фамилии по нашему мнению не может превышать :max символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.',
            'customer.phone.required'       => 'Поле: "Телефон" обязательно для заполнения.',
            'customer.phone.regex'          => 'Пожалуйста, укажите номер телефона в указанном формате.',
            'customer.email.required'       => 'Поле email обязательно для заполнения.',
            'customer.email.max'            => 'Поле email слишком длинное.',
            'customer.deliveryAddress.max'  => 'Поле address слишком длинное.',
            'customer.deliveryAddress.regex'=> 'Адрес должен быть на русском языке.',
            
            // Для физлиц (individual) - если будут поля
            // 'customer.passportNumber' => '...',
            
            // Для юрлиц (legal)
            'customer.orgname.required'     => 'Название компании обязательно для юрлиц.',
            'customer.orgname.max'          => 'Название компании не должно превышать :max символов.',
            
            // Доставка и продукты
            'delivery.address.max'          => 'Поле address слишком длинное.',
            'delivery.address.regex'        => 'Адрес доставки должен быть на русском языке.',
            'delivery.price.numeric'        => 'Стоиммость доставки должна быть выражена в числовом эквиваленте.',
            'delivery.transportId.required' => 'Необходимо указать способ доставки (transportId).',
            'delivery.transportId.numeric'  => 'Не опознан вид способа доставки (transportId).',
            'products.*.id.integer'         => 'ID товара должно быть числом.',
            'products.*.quantity.min'       => 'Количество товара не может быть меньше :min.',
            'products.*.price.min'          => 'Товар не может быть бесценным.',
            'products.min'                  => 'Массив продуктов не может быть пустым.',
            
            // ... остальные сообщения
            'paymentMethod.in'              => 'Метод платежа :attribute может быть одним из следующих: :values',
            'products_amount.numeric'       => 'Общая сумма товаров должна быть числом.',
            'total.numeric'                 => 'Общая стоимость заказа должна быть числом.',
            'total.min'                     => 'Общая стоимость заказа должна стоить хоть сколько-то. Хотя бы :min руб.',
        ];
    }

    public static function individualRules(): array {
        return [
            // ... правила для зарегистрированных и авторизованных физлиц
        ];
    }

    public static function legalRules(): array {
        return [
            // ... правила для юрлиц
        ];
    }

    public static function guestRules(): array {
        return [
            'customer.firstName'        => parent::nameRules(),
            'customer.lastName'         => parent::nameRules(),
            'customer.phone'            => parent::phoneRules(),
            'customer.email'            => parent::emailRules(),
            'customer.deliveryAddress'  => parent::addressRules(true),
        ];
    }
}