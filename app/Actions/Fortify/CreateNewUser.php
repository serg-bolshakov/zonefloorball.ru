<?php
namespace App\Actions\Fortify;
use Illuminate\Http\Request; // подключим класс Request

use App\Models\User;
use App\Models\Person;
use App\Models\Login;

use Illuminate\Support\Facades\Hash;

/* Если вы не хотите использовать метод validate запроса, то вы можете создать экземпляр валидатора вручную, 
   используя фасад Validator. Метод make фасада генерирует новый экземпляр валидатора: */
use Illuminate\Support\Facades\Validator;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */

    public function create(array $input): User {
        # случай №1: когда регистрируется физическое лицо (делаем проверку в условии, что !isset($_POST['org']) and !isset($_POST['orgneedsregularcontract']):
        if(!isset($input['org']) and !isset($input['orgneedsregularcontract'])) {
            // dump($input);
            Validator::make($input, [
                'name' => ['required', 'string', 'max:30', "regex:#^[а-яА-ЯёЁ\s'-]+$#u"],
                'surname' => ['required', 'string', 'max:30', "regex:#^[а-яА-ЯёЁ\s'-]+$#u"], 
                'pers_tel' => ['required', "regex:#^(\+7)\s[\(][0-9]{3}[\)]\s[0-9]{3}-[0-9]{2}-[0-9]{2}$#"],
                'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class),],
                'pers_addr' => ['nullable', 'max:255', "regex:#^[а-яА-ЯёЁ\d\s.,\"\!:\)\(\/№-]*$#u"],
                'date_of_birth' => ['nullable', "regex:#^((19[5-9][0-9])|(20[0-1][0-9]))-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])$#"],
                // 'password' => $this->passwordRules(),    // этот вариант шёл "в коробке"
                'password' => ['required', 'confirmed', Password::min(3)
                //    ->letters()
                //    ->mixedCase()
                //    ->numbers()
                //    ->symbols()
                //    ->uncompromised()
                ],
            ], $messages = [
                'required' => 'Поле обязательно для заполнения.',
                // Вы также можете использовать другие заполнители в сообщениях валидатора. Например:
                'same' => 'The :attribute and :other must match.',
                'size' => 'The :attribute must be exactly :size.',
                'between' => 'The :attribute value :input is not between :min - :max.',
                'in' => 'The :attribute must be one of the following types: :values',
                // По желанию можно указать собственное сообщение об ошибке только для определенного атрибута. 
                // Вы можете сделать это, используя «точечную нотацию». Сначала укажите имя атрибута, а затем правило:
                'name.max'        => 'Длина имени по нашему мнению не может превышать :max символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.',
                'name.regex'      => 'Пожалуйста, укажите имя на русском языке.',
                'surname.max'     => 'Длина фамилии, по нашему мнению, не может превышать :max символов!? Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.',
                'surname.regex'   => 'Напишите фамилию на русском языке, пожалуйста.',
                'pers_tel.regex'  => 'Пожалуйста, укажите номер телефона в указанном формате.',
                'email.unique'    => 'Пользователь с данным email уже зарегистрирован в системе. Пожалуйста, авторизуйтесь.',
                'pers_addr.regex' => 'Пожалуйста, укажите корректный адрес на русском языке.',
                'pers_addr.max'   => 'Длина адреса по нашему мнению не может превышать :max символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.',
                'date_of_birth.regex'    => 'Непохоже на то, что вы вводите дату своего рождения... Если уверены в своей правоте, - пожалуйста, оставьте поле пока пустым и напишите нам об ошибке.',
                'password.min'           => 'Требуется не менее 8 символов ...',
                'password.uncompromised' => 'Вводимый вами пароль, возможно, уже появляллся в базе данных "украденных паролей". Рекомендуем придумать другой!',
            ])->validate(); 

            // если валидация данных для регистрации пройдена, то:
            
            /* комментирую 05.01.2025 - не вижу пока смысла в этой манипуляции - потом УДАЛИТЬ (если что)
                // Во-первых, через глобальный помощник «session», добавляем в сессию событие ...
                //session(['newUserRegisteredAndNeedToKnowConfirmEmail' => true]);
                session()->flash('newUserRegisteredAndNeedToKnowConfirmEmail');  
            */

            // создаём юзера:
            return User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'pers_surname' => $input['surname'],
                'pers_tel' => $input['pers_tel'],
                'delivery_addr_on_default' => $input['pers_addr'],
                'password' => Hash::make($input['password']),
                'date_of_birth' => $input['date_of_birth'],
                'action_auth_id' => 0,
            ]);
            /*  по умолчанию, после регистрации, Laravel перенаправляет пользователя на маршрут home, который настроен в файле конфигурации.
                мы решили, что пользователь после успешной регистрации должен быть переадресован на /email/verify , чтобы он сразу понял, что зарегистрирован и должен подтвердить адрес электронной почты.
                Реализуем задуманное:
                1. Создаём новый слушатель, который будет обрабатывать перенаправление после регистрации. Выполняем команду: php artisan make:listener RedirectAfterRegistration
                2. В файле app/Listeners/RedirectAfterRegistration.php добавляем код...
                3. Регистрируем слушатель в EventServiceProvider: в файле app/Providers/EventServiceProvider.php и регистрируем слушатель для события Registered...
                !!! Ошибка: \app\Http\Middleware\RedirectIfAuthenticated - Target class [App\Providers\RedirectAfterRegistration] does not exist.
                4. Переименуем адрес переадресации на /profile - туда могут попасть только зарегистрированные пользователи и подтверждённой почтой
                5. и заюзаем требуемый клаасс.                
            */
        } else {
            dd($input);
        }
    }
}
