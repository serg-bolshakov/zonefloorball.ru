<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisteredUserController extends Controller
{
    /**
     * Показывает форму регистрации.
     */
    public function create()
    {
        return view('auth.register');
    }

    /**
     * Обрабатывает регистрацию пользователя.
     */
    public function store(Request $request)
    {
        // dd($request);
        // Валидация данных
        $request->validate([
            'name' => ['required', 'string', 'max:30', "regex:#^[а-яА-ЯёЁ\s'-]+$#u"],
            'surname' => ['required', 'string', 'max:30', "regex:#^[а-яА-ЯёЁ\s'-]+$#u"], 
            'pers_tel' => ['required', "regex:#^(\+7)\s[\(][0-9]{3}[\)]\s[0-9]{3}-[0-9]{2}-[0-9]{2}$#"],
            //'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)], - для физлица, если регистрируется, как юзер - проверку на уникальность проведём в его случае: случай №1
            'email' => ['required', 'string', 'email', 'max:255'],
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
            'name_of_org' => ['filled', 'string', 'max:255', "regex:#^[a-zA-Zа-яА-ЯёЁ\d\s.,\"!:\)\(/№-]+$#u"],
            'org_inn' => ['filled', 'numeric', 'digits_between:10,12', 'unique:users,org_inn'],
            'org_kpp' => ['filled', 'numeric', 'digits:9',],
            'org_addr' => ['filled', 'max:255', "regex:#^[а-яА-ЯёЁ\d\s.,\"\!:\)\(\/№-]*$#u"],
            'regorgtel' => ['filled', "regex:#^(\+7)\s[\(][0-9]{3}[\)]\s[0-9]{3}-[0-9]{2}-[0-9]{2}$#"],
            // если регистрируем организацию, именно этот имейл будет использоваться в качестве логина - здесь проверим его на уникальность логинов:
            'regorgemail' => ['filled', 'string', 'email', 'max:255', 'unique:users,email'],
            // если регистрируем физика - запустим валидатор в его случае (случай №1)
        ], $messages = [
            // По желанию можно указать собственное сообщение об ошибке только для определенного атрибута. Это можно сделать, используя «точечную нотацию». Сначала имя атрибута, а затем правило:
            'required' => 'Поле обязательно для заполнения.',
            'filled' => 'Проверяемое поле не должно быть пустым, если оно присутствует.',
            'org_inn.numeric' => 'ИНН должен содержать только цифры.',
            'org_inn.digits_between'   => 'ИНН может содержать от 10 до 12 цифр.',
            'org_inn.unique'           => 'Организация с таким ИНН уже является нашим партнёром. Пожалуйста, авторизуйтесь.',
            /* Вы также можете использовать другие заполнители в сообщениях валидатора. Например:
                'same' => 'The :attribute and :other must match.',
                'size' => 'The :attribute must be exactly :size.',
                'between' => 'The :attribute value :input is not between :min - :max.',
                'in' => 'The :attribute must be one of the following types: :values',
            */
            'name_of_org.regex'        => 'Пожалуйста, укажите наименование организации в соответствии с учредительными документами',
            'name.max'                 => 'Длина имени по нашему мнению не может превышать :max символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.',
            'name.regex'               => 'Пожалуйста, укажите имя на русском языке.',
            'surname.max'              => 'Длина фамилии, по нашему мнению, не может превышать :max символов!? Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.',
            'surname.regex'            => 'Напишите фамилию на русском языке, пожалуйста.',
            'pers_tel.regex'           => 'Пожалуйста, укажите номер телефона в указанном формате.',
            'regorgtel.regex'          => 'Пожалуйста, укажите номер телефона в указанном формате.',
            'email.unique'             => 'Пользователь с данным email уже зарегистрирован в системе. Пожалуйста, авторизуйтесь.',
            'regorgemail.unique'       => 'Пользователь с данным email уже зарегистрирован в системе. Пожалуйста, авторизуйтесь.',
            'pers_addr.regex'          => 'Пожалуйста, укажите корректный адрес на русском языке.',
            'pers_addr.max'            => 'Длина адреса по нашему мнению не может превышать 255 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.',
            'org_kpp.digits'           => 'КПП должен содержать ровно 9 цифр.', 
            'org_addr.regex'           => 'Пожалуйста, укажите корректный адрес на русском языке.',
            'org_addr.max'             => 'Длина адреса по нашему мнению не может превышать 255 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.',
            'date_of_birth.regex'      => 'Непохоже на то, что вы вводите дату своего рождения... Если уверены в своей правоте, - пожалуйста, оставьте поле пока пустым и напишите нам об ошибке.',
            'password.min'             => 'Требуется не менее 8 символов ...',
            'password.uncompromised'   => 'Вводимый вами пароль, возможно, уже появляллся в базе данных "украденных паролей". Рекомендуем придумать другой!',
        ]); 
        
        # случай №1: когда регистрируется физическое лицо (делаем проверку в условии, что !isset($_POST['org']) and !isset($_POST['orgneedsregularcontract']):
        if(!isset($request['org']) and !isset($request['orgneedsregularcontract'])) {
            // Валидация данных - для физлиц проверяем уникальность заявленного имейл (будет использоваться в качестве логина):
            $request->validate([
                'email' => [Rule::unique(User::class)],
            ], $messages = [
                'email.unique'    => 'Пользователь с данным email уже зарегистрирован в системе. Пожалуйста, авторизуйтесь.',
            ]); 

            /*  прежний вариант валидации
                $request->validate([
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
                    'pers_addr.max'   => 'Длина адреса по нашему мнению не может превышать 255 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.',
                    'date_of_birth.regex'    => 'Непохоже на то, что вы вводите дату своего рождения... Если уверены в своей правоте, - пожалуйста, оставьте поле пока пустым и напишите нам об ошибке.',
                    'password.min'           => 'Требуется не менее 8 символов ...',
                    'password.uncompromised' => 'Вводимый вами пароль, возможно, уже появляллся в базе данных "украденных паролей". Рекомендуем придумать другой!',
                ]); 
            */

            // Создание пользователя
            $user = User::create([
                'name' => $request['name'],
                'email' => $request['email'],
                'pers_surname' => $request['surname'],
                'pers_tel' => $request['pers_tel'],
                'delivery_addr_on_default' => $request['pers_addr'],
                'password' => Hash::make($request['password']),
                'date_of_birth' => $request['date_of_birth'],
                'action_auth_id' => 0,
            ]);
        } 
        # случай №2: когда регистрируется юридическое лицо и НЕ НУЖЕН ДОГОВОР:
        elseif(isset($request['org']) and !isset($request['orgneedsregularcontract'])) {
            // у юридического лица должен быть представитель, который и оформляет регистрацию юридического лица. Сначала нужно записать в систему его id:
            $representId = NULL;
            
            // возможно представитель уже зарегистрирован в БД, как самостоятельное частное (физическое) лицо - сначала проверим это его имейлу:
            $personUser = User::where('email', $request['email'])->first();
            // если такого зарегистрированного пользователя нет, заносим его в базу данных как нового, в качестве представителя компании:
            if(!$personUser) {
                $represent = new User;
                $represent->name = $request['name'];
                $represent->pers_surname = $request['surname'];
                $represent->pers_tel = $request['pers_tel'];
                $represent->pers_email = $request['email'];
                $represent->action_auth_id = 0;
                $represent->client_rank_id = 10;// Представитель организации
                $represent->user_access_id = 6; // Гость guest     
                $represent->save();
                $representId = $represent->id;   // вносим в БД новую запись и получаем id этой записи
            } else {
                $representId = $personUser->id;
            }
            
            // Создание пользователя - Юридическое лицо!!!
            $user = User::create([
                'name'                  => $request['name_of_org'],
                'email'                 => $request['regorgemail'],
                'is_taxes_pay'          => $request['orgvatpayer'],
                'password'              => Hash::make($request['password']),
                'org_tel'               => $request['regorgtel'],
                'org_inn'               => $request['org_inn'],
                'org_kpp'               => $request['org_kpp'],
                'org_addr'              => $request['org_addr'],
                'action_auth_id'        => 0,   // он-лайн
                'client_type_id'        => 2,   // Юридическое лицо
                'client_rank_id'        => 2,   // Юрлицо, зарегистрированное
                'this_id'               => $representId,
            ]);

            /*  Сегодня, 11.01.2025, подумал и решил, что лучше будет не у физика прописывать придлежность к компании, а наоборот - у организации показать кто будет ёё контактным лицом...
                // Получаем id новой организации, чтобы прописать связь с представителем организации:
                $userId = $user->id;
            
                // Этот способ выполнит обновление в базе данных напрямую, без необходимости загружать модель.
                if(!empty($userId)) {
                    User::where('id', $representId)->update(['this_id' => $userId]);
                }
            */
        }
        
        // Вызов события Registered
        event(new Registered($user));

        // Редирект после регистрации
        return redirect('/email/verify');
    } 
}