<?php
// app/Http/Controllers/ProfileController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

use Illuminate\Support\Facades\Auth; 
# вам часто будет требоваться взаимодействовать с текущим аутентифицированным пользователем. 
# При обработке входящего запроса вы можете получить доступ к аутентифицированному пользователю с помощью метода user фасада Auth:

use Inertia\Inertia;
use App\Traits\DateTrait;

class ProfileController extends Controller
{    
    use DateTrait;

    public function index(Request $request) {
        
        // если пользователь авторизован:
        if(Auth::check()) {
            // получить к нему доступ можем и так: Auth::user() ... и так: $request->user()
            // Получаем пользователя с загруженным отношением rank
            $user = $request->user()->load('rank'); // $user = $request->user()->with('rank')->first();
            $priceDiscountAccordingToTheRank = $user->rank->price_discount;
                
             /*    // если были POST-запросы на изменение данных профиля:
                if(isset($request->editperstelnum) && $user->client_type_id == '1') {
                    $user->pers_tel = $request->editperstelnum;
                    $user->save();
                }

                // если юзер решил изменить Имя и/или Фамилию:
                if(isset($request->editinprofilepersname) && isset($request->editinprofileperssurname) && $user->client_type_id == '1') {
                    $input['editinprofilepersname'] = $request->editinprofilepersname;
                    $input['editinprofileperssurname'] = $request->editinprofileperssurname;

                    Validator::make($input, [
                        'editinprofilepersname' => ['required', 'string', 'max:30', "regex:#^[а-яА-ЯёЁ\s'-]+$#u"],
                        'editinprofileperssurname' => ['required', 'string', 'max:30', "regex:#^[а-яА-ЯёЁ\s'-]+$#u"],
                    ], $messages = [
                        'required' => 'Поле обязательно для заполнения.',
                        // Вы также можете использовать другие заполнители в сообщениях валидатора. Например:
                        // По желанию можно указать собственное сообщение об ошибке только для определенного атрибута. 
                        // Вы можете сделать это, используя «точечную нотацию». Сначала укажите имя атрибута, а затем правило:
                        'editinprofilepersname.max'        => 'Длина имени по нашему мнению не может превышать :max символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.',
                        'editinprofilepersname.regex'      => 'Пожалуйста, укажите имя на русском языке.',
                        'editinprofileperssurname.max'     => 'Длина фамилии, по нашему мнению, не может превышать :max символов!? Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.',
                        'editinprofileperssurname.regex'   => 'Напишите фамилию на русском языке, пожалуйста.',
                    ])->validate(); 

                    // если валидация данных для регистрации пройдена, то:
                    session()->flash('flash', 'Вы успешно изменили в системе данные своих Имени и Фамилии. Спасибо.' );  // с помощью метода flash сохраняем элемент в сессию только для следующего запроса...  

                    $user->name = $request->editinprofilepersname;
                    $user->pers_surname = $request->editinprofileperssurname;
                    $user->save();

                }

                // если юзер решил изменить/добавить/удалить дату рождения:
                if(isset($request->date_of_birth_edit_in_profile) && !isset($request->deletebirthdayfromaccount) && $user->client_type_id == '1') {
                    $input['date_of_birth_edit_in_profile'] = $request->date_of_birth_edit_in_profile;
                    //dd($request->date_of_birth_edit_in_profile);
                    Validator::make($input, [
                        'date_of_birth_edit_in_profile' => ['nullable', "regex:#^((19[5-9][0-9])|(20[0-1][0-9]))-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])$#"],
                    ], $messages = [
                        'date_of_birth_edit_in_profile.regex'    => 'Непохоже на то, что вы вводите дату своего рождения... Если уверены в своей правоте, - пожалуйста, оставьте поле пока пустым и напишите нам об ошибке.',
                    ])->validate(); 

                    // если валидация данных для регистрации пройдена, то:
                    session()->flash('flash', 'Вы успешно изменили в системе данные даты своего рождения. Спасибо.' );  // с помощью метода flash сохраняем элемент в сессию только для следующего запроса...    

                    $user->date_of_birth = $request->date_of_birth_edit_in_profile;
                    $user->save();
                } elseif(isset($request->deletebirthdayfromaccount)) {
                    session()->flash('flash', 'Вы успешно удалили из системы данные даты своего рождения.' );  // с помощью метода flash сохраняем элемент в сессию только для следующего запроса...  
                    $user->date_of_birth = NULL;
                    $user->save();
                }
            
                // если юзер решил изменить/добавить/удалить адрес доставки заказов по умолчанию:
                if(isset($request->editdeliveryaddrinprofile) && !isset($request->deletedeliveryaddressfromaccount) && isset($request->checkchangingaddringprofile) && $user->client_type_id == '1') {
                    $input['editdeliveryaddrinprofile'] = $request->editdeliveryaddrinprofile;
                    
                    Validator::make($input, [
                        'editdeliveryaddrinprofile' => ['nullable', 'max:255', "regex:#^[а-яА-ЯёЁ\d\s.,\"\!:\)\(\/№-]*$#u"],
                    ], $messages = [
                        'editdeliveryaddrinprofile.regex'   => 'Пожалуйста, укажите корректный адрес на русском языке.',
                        'editdeliveryaddrinprofile.max'     => 'Длина адреса по нашему мнению не может превышать 255 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.',
                    ])->validate(); 
                    
                    // если валидация данных для регистрации пройдена, то:
                    session()->flash('flash', 'Вы успешно адрес доставки заказов, используемый по умолчанию.' );  // с помощью метода flash сохраняем элемент в сессию только для следующего запроса...    

                    $user->delivery_addr_on_default = $request->editdeliveryaddrinprofile;
                    $user->save();
                } elseif(isset($request->deletedeliveryaddressfromaccount) && isset($request->checkchangingaddringprofile)) {
                    session()->flash('flash', 'Вы успешно удалили из системы адрес доставки заказов, используемый по умолчанию.' );  // с помощью метода flash сохраняем элемент в сессию только для следующего запроса...    

                    $user->delivery_addr_on_default = NULL;
                    $user->save();
                }

                // если это организация - делает запрос на корректировку наименования организации:
                if(isset($request->editinprofileorgname) && isset($request->checkchangingorgnameaddringprofile)) {
                    $request->validate([
                        'editinprofileorgname' => ['required', 'string', 'max:255', "regex:#^[a-zA-Zа-яА-ЯёЁ\d\s.,\"!:\)\(/№-]+$#u"],
                    ], $messages =[
                        'editinprofileorgname.regex' => 'Пожалуйста, укажите наименование организации в соответствии с учредительными документами',
                    ]);

                    // если валидация данных для регистрации пройдена, то:
                    session()->flash('flash', 'Вы успешно провели корректировку наименования организации.' );  // с помощью метода flash сохраняем элемент в сессию только для следующего запроса...
                    // Пробуем этот способ, который выполнит обновление в базе данных напрямую, без необходимости загружать модель.
                    // User::where('id', $user->id)->update(['name' => $request->editinprofileorgname]);
                    // Если использовать способ, описанный выше, то обновления в личном кабинете юзера появляются только после дополнительной перезагрузки, так что используем наш "старый способ":
                    $user->name = $request->editinprofileorgname;
                    $user->save();
                }
                
                // если это организация - делает запрос на корректировку юридического адреса:
                if(isset($request->editorgaddrinprofile) && isset($request->checkchangingaddringprofile)) {
                    $request->validate([
                        'editorgaddrinprofile' => ['filled', 'max:255', "regex:#^[а-яА-ЯёЁ\d\s.,\"\!:\)\(\/№-]*$#u"],
                    ], $messages =[
                        'editorgaddrinprofile.regex' => 'Пожалуйста, укажите корректный адрес на русском языке.',
                        'editorgaddrinprofile.max'   => 'Длина адреса по нашему мнению не может превышать 255 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.',
                    ]);

                    // если валидация данных для регистрации пройдена, то:
                    session()->flash('flash', 'Вы успешно изменили юридический адрес организации.' );  // с помощью метода flash сохраняем элемент в сессию только для следующего запроса...
                    $user->org_addr = $request->editorgaddrinprofile;
                    $user->save();
                } elseif(isset($request->editorgaddrinprofile) && !isset($request->checkchangingaddringprofile)) {
                    // Возвращаем ошибку вручную
                    return redirect()->back()
                    ->withErrors(['checkchangingaddringprofile' => 'Пожалуйста, укажите, что вы "не робот".'])
                    ->withInput();
                }

                // если это организация - делает запрос на корректировку номера телефона:
                if(isset($request->editorgtelnum)) {
                    $request->validate([
                        'editorgtelnum' => ['filled', "regex:#^(\+7)\s[\(][0-9]{3}[\)]\s[0-9]{3}-[0-9]{2}-[0-9]{2}$#"],
                    ], $messages =[
                        'editorgtelnum.regex' => 'Пожалуйста, укажите номер телефона в указанном формате.',
                    ]);

                    // если валидация данных для регистрации пройдена, то:

                    session()->flash('flash', 'Вы успешно изменили номер телефона организации' );  // с помощью метода flash сохраняем элемент в сессию только для следующего запроса... 

                    $user->org_tel = $request->editorgtelnum;
                    $user->save();
                }

                // get - запросы из профиля абонента:
                $getRequest = $getRequestValue = '';
                if(isset($request->getproducts) && !empty($request->getproducts)) { $getRequest = 'getproducts'; $getRequestValue = $request->getproducts; }
                if(isset($request->getorders  ) && !empty($request->getorders  )) { $getRequest = 'getorders'  ; $getRequestValue = $request->getorders  ; }
                    
                // если авторизованный пользователь выбрал "просмотр заказа":
                if(isset($request->orderactionselected) && !empty($request->orderactionselected)) { $getRequest = 'orderactionselected'  ; $getRequestValue = $request->orderactionselected  ; }
            
            $representPerson = null;*/

            // если авторизованный пользователь - организация (ИП), нам нужно получить представителя, если такой есть
            $representPerson = $user->this_id 
                ? User::find($user->this_id)?->only(['name', 'email', 'pers_surname', 'pers_email', 'pers_tel'])
                : null;

            if ($representPerson) {
                $representPerson = [
                    'org_rep_name' => $representPerson['name'],
                    'org_rep_surname' => $representPerson['pers_surname'],
                    'org_rep_email' => $representPerson['email'] ?? $representPerson['pers_email'],
                    'org_rep_phone' => $representPerson['pers_tel']
                ];
            }

            $title = 'Профиль';
            
            /* // если авторизовано физическое лицо:
                if($user->client_type_id == '1') {
                    $title = 'Мой личный кабинет';
                    $user->date_of_birth_view = 'Не указана';
                    if(!empty($user->date_of_birth)) { $user->date_of_birth_view = $this->date_ru($user->date_of_birth); }

                    $user->delivery_addr_on_default_view = 'не оформлен';
                    if(!empty($user->delivery_addr_on_default)) { $user->delivery_addr_on_default_view = $user->delivery_addr_on_default; }
                // если юридическое:
                } elseif($user->client_type_id == '2') {
                    $title = $user->name;
                    // нужно ещё "прикрепить" представителя организации:
                    $representPerson = User::find($user->this_id);
                }
                // dd($priceDiscountAccordingToTheRank);
                // return view('components.profile.person', [
            */
                return Inertia::render('ProfileIndex', [
                    'title' => $title,
                    'robots' => 'NOINDEX,NOFOLLOW',
                    'description' => '',
                    'keywords' => '',
                    // 'user' => $user,
                    // 'getRequest' => $getRequest,
                    // 'getRequestValue' => $getRequestValue,
                    'representPerson' => $representPerson,
                    'priceDiscountAccordingToTheRank' => $priceDiscountAccordingToTheRank,
                ]);
        } else {
            session()->flash('flash', 'Только зарегистрированные и авторизованные пользователи имеют доступ к этой странице. <br>Пожалуйста, авторизуйтесь...');
            return Inertia::render('Home', [
                'title' => 'ZoneFloorball Флорбольная экипировка.Всё для флорбола. Купить',
                'robots' => 'INDEX,FOLLOW',
                'description' => 'Найти, выбрать и купить товары для флорбола для детей и взрослых. Всё для флорбола от ведущего мирового производителя.',
                'keywords' => 'Клюшки для флорбола, обувь, очки, сумки и чехлы для взрослых и детей. Флорбольные ворота и мячи.',
            ]);
        }        
    }

    public function update(Request $request) {
        
        $user = $request->user();

        // Кастомные сообщения
        $messages = [
            'required' => 'Поле обязательно для заполнения.',
            'name.max' => 'Название не может превышать :max символов.',
            'name.regex' => 'Допустимы только буквы, цифры и стандартные символы пунктуации.',
            'inn' => 'ИНН содержит ошибку. Проверьте правильность ввода.',
            'org_inn.digits_between' => 'ИНН должен содержать от 10 или 12 цифр.',
            'org_inn.unique'    => 'Пользователь с данным ИНН уже зарегистрирован в системе.',
            'pers_surname.max' => 'Фамилия не может превышать :max символов.',
            'pers_surname.regex' => 'Фамилия должна содержать только русские буквы и дефисы.',
            'pers_tel.regex' => 'Телефон должен быть в формате: +7 (XXX) XXX-XX-XX',
            'org_tel.regex' => 'Телефон должен быть в формате: +7 (XXX) XXX-XX-XX',
            'date_of_birth.regex' => 'Неверный формат даты рождения (ГГГГ-ММ-ДД).',
            'delivery_addr_on_default.regex' => 'Адрес содержит недопустимые символы.',
            'delivery_addr_on_default.max'   => 'Длина адреса по нашему мнению не может превышать :max символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.',
            'org_addr.regex' => 'Адрес содержит недопустимые символы.',
            'org_addr.max'   => 'Длина адреса по нашему мнению не может превышать :max символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.',
        ];
        
        // Правила валидации
        $rules = [
            'name' => [
                'sometimes', 
                'string', 
                'max:255', 
                'regex:~^[a-zA-Zа-яА-ЯёЁ\d\s\',."!:)(№/-]+$~u'
            ],
            'org_inn' => [
                'nullable',
                'digits_between:10,12', // Для ИНН (10 или 12 цифр)
                'inn',
                Rule::unique('users', 'org_inn')->ignore($user->id)->whereNull('deleted_at')
            ],
            'pers_surname' => [
                'sometimes',
                'string',
                'max:30',
                'regex:~^[а-яА-ЯёЁ\s\'-]+$~u'
            ],
            'pers_tel' => [
                'sometimes',
                'regex:/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/'
            ],
            'date_of_birth' => [
                'nullable',
                'regex:~^((19[5-9][0-9])|(20[0-1][0-9]))-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])$~'
            ],
            'delivery_addr_on_default' => [
                'nullable',
                'max:255',
                'regex:~^[а-яА-ЯёЁ\d\s.,"!:\-()/№]+$~u'
            ],
            'org_addr' => [
                'nullable',
                'max:255', 
                'regex:~^[а-яА-ЯёЁ\d\s.,"!:\-()/№]+$~u'
            ],
            'org_tel' => [
                'sometimes',
                'regex:/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/'
            ],
        ];

        // Валидация
        $validator = Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            /*\Log::debug('Validation failed', [
                'errors' => $validator->errors()->toArray(),
                'input' => $request->all()
            ]);*/
            
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        // Обработка null-значений
        $validated = $validator->validated();
        if ($request->has('date_of_birth') && $request->input('date_of_birth') === null) {
            $validated['date_of_birth'] = null;
        }

        try {
            $user->update($validated);
            
            return response()->json([
                'success' => true,
                'user' => $user->fresh(),
                'message' => 'Данные успешно обновлены'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'validated' => $validated
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Ошибка сервера при обновлении',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }

        /*
            $validated = $request->validate([
                // 'name'          => ['sometimes', 'string', 'max:30', 'regex:/^[а-яА-ЯёЁ\s\'-]+$/u'],        
                // так как поле name одно и для физ, и для юр лиц меняем регурярку на расширенный вариант:
                'name'                      => ['sometimes', 'string', 'max:255', 'regex:~^[a-zA-Zа-яА-ЯёЁ\d\s\',."!:)(№/-]+$~u'],
                'pers_surname'              => ['sometimes', 'string', 'max:30', 'regex:/^[а-яА-ЯёЁ\s\'-]+$/u'],
                'pers_tel'                  => ['sometimes', 'regex:/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/'],
                'date_of_birth'             => ['nullable', "regex:#^((19[5-9][0-9])|(20[0-1][0-9]))-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])$#"],
                'delivery_addr_on_default'  => ['nullable', "regex:~^[а-яА-ЯёЁ\d\s.,\"!:\-()/№]+$~u"], 
                // ... другие правила
            ]);

            // Явная обработка null
            if ($request->has('date_of_birth') && $request->input('date_of_birth') === null) {
                $validated['date_of_birth'] = null;
            }

            \Log::debug('ProfileController $validated:', [
                'validated' => $validated,
            ]);

            try {
                $user->update($validated);
            } catch (\Exception $e) {
                \Log::error('Update failed', [
                    'error' => $e->getMessage(),
                    'validated' => $validated
                ]);
                return response()->json(['error' => 'Update failed'], 500);
            }

            return response()->json(['user' => $user->fresh()]); // Отправляем обновленного пользователя
        */
    }

    public function destroy(Request $request) {
        $request->user()->delete(); // Мягкое удаление // Помечает как удалённого
        auth()->logout();
        return redirect('/')->with('message', 'Профиль удалён');
    }
}