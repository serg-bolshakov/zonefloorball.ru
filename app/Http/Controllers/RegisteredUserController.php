<?php
// app/Http/Controllers/RegisteredUserController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\LegalDocument;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

use App\Rules\RegistrationRules;

class RegisteredUserController extends Controller {
    /**
     * Показывает форму регистрации.
     */
    public function create() {
        return view('auth.register');
    }

    /**
     * Обрабатывает регистрацию пользователя.
     */
    public function store(Request $request) {
        // dd($request);
        // \Log::debug('RegisteredUserController:', [ 'requesr' => $request->all(),  ]);
        // Валидация данных
        $rules = $request->has('org') 
            ? RegistrationRules::legalRules() 
            : RegistrationRules::individualRules();

        $messages = RegistrationRules::registrationMessages();

        $validated = $request->validate($rules, RegistrationRules::registrationMessages());
        // \Log::debug('RegisteredUserController:', [ 'validated' => $validated,  ]);       
        
        $userData = array_merge($validated, [
            'initial_legal_agreement_ip' => $request->ip()
        ]);

        // Определяем тип регистрации (физлицо или юрлицо)
        $user = null;   

        /* if (!$request->has('org') && !$request->has('orgneedsregularcontract')) {
            $user = $this->createIndividualUser($userData);
        } elseif ($request->has('org') && !$request->has('orgneedsregularcontract')) {
            $user = $this->createLegalUser($userData);
        } */

        if ($request->has('org')) {
            if ($request->has('orgneedsregularcontract')) {
                // Обработка специального случая для юрлиц
                // $user = $this->createSpecialLegalUser($userData);
                $user = $this->createLegalUser($userData);
            } else {
                // Обычное юрлицо
                $user = $this->createLegalUser($userData);
            }
        } else {
            // Физлицо (дефолтный случай)
            $user = $this->createIndividualUser($userData);
        }

        if (!$user) {
            throw new \RuntimeException('User creation failed');
        }

        Auth::login($user); // Авторизуем сразу

        // Редирект после регистрации
        return redirect('/email/verify');
    } 

    protected function createIndividualUser(array $data): User {
        $user = User::create([
            'name'                       => $data['name'],
            'email'                      => $data['email'],
            'pers_surname'               => $data['surname'],
            'pers_tel'                   => $data['pers_tel'],
            'password'                   => Hash::make($data['password']),
            'action_auth_id'             => 0,
            'privacy_policy_agreed_at'   => now(),
            'offer_agreed_at'            => now(),
            'privacy_policy_version'     => $this->getPrivacyPolicy()?->version ?? '1.0.0',
            'offer_version'              => $this->getOfferVersion()?->version ?? '1.0.0',
            'initial_legal_agreement_ip' => $data['initial_legal_agreement_ip'],
        ]);
        
        // Вызов события Registered
        event(new Registered($user));
        return $user;
    }

    protected function createLegalUser(array $data): User {
        $representId = NULL;
        \Log::debug('RegisteredUserController: createLegalUser', [ 'data' => $data,  ]);        
        // возможно представитель уже зарегистрирован в БД, как самостоятельное частное (физическое) лицо - сначала проверим это его имейлу:
        $personUser = User::where('email', $data['email'])->first();
        
        // если такого зарегистрированного пользователя нет, заносим его в базу данных как нового, в качестве представителя компании:
        if(!$personUser) {
            $represent = new User;
            $represent->name = $data['name'];
            $represent->pers_surname = $data['surname'];
            $represent->pers_tel = $data['pers_tel'];
            $represent->pers_email = $data['email'];
            $represent->action_auth_id = 0;
            $represent->client_rank_id = 10;    // Представитель организации
            $represent->user_access_id = 6;     // Гость guest     
            $represent->save();
            $representId = $represent->id;      // вносим в БД новую запись и получаем id этой записи
        } else {                                // если в системе зарегистрирован пользователь с таким email, нужно сравнить данные, которые вводятся сейчас, с теми, которые есть в БД для этого пользователя
            $errors = [];
        
            if ($data['name'] != $personUser->name) {
                $errors['name'] = 'Имя представителя не совпадает с именем в вашем профиле';
            }
        
            if ($data['surname'] != $personUser->pers_surname) {
                $errors['surname'] = 'Фамилия представителя не совпадает с фамилией в вашем профиле';
            }
        
            if ($data['pers_tel'] != $personUser->pers_tel) {
                $errors['pers_tel'] = 'Телефон представителя не совпадает с телефоном в вашем профиле';
            }
        
            if (!empty($errors)) {
                throw ValidationException::withMessages($errors);
            }
        
            $representId = $personUser->id;
        }
            
        // Создание пользователя - Юридическое лицо!!!
        $user = User::create([
            'name'                          => $data['name_of_org'],
            'email'                         => $data['regorgemail'],
            'password'                      => Hash::make($data['password']),
            'org_tel'                       => $data['regorgtel'],
            'org_inn'                       => $data['org_inn'],
            'org_kpp'                       => $data['org_kpp'],
            'is_taxes_pay'                  => $data['orgvatpayer'] ?? NULL,
            'org_addr'                      => $data['org_addr'],
            'action_auth_id'                => 0,   // он-лайн
            'client_type_id'                => 2,   // Юридическое лицо
            'client_rank_id'                => 2,   // Юрлицо, зарегистрированное
            'this_id'                       => $representId,
            'privacy_policy_agreed_at'      => now(),
            'offer_agreed_at'               => now(),
            'privacy_policy_version'        => $this->getPrivacyPolicy()?->version ?? '1.0.0',
            'offer_version'                 => $this->getOfferVersion()?->version ?? '1.0.0',
            'initial_legal_agreement_ip'    => $data['initial_legal_agreement_ip'],
        ]);

        // Вызов события Registered
        event(new Registered($user));
        return $user;
    }

    // Получаем актуальные версии документов
    private function getPrivacyPolicy(): ?LegalDocument {
        return LegalDocument::where('type', 'privacy_policy')
            ->where('is_active', true)
            ->first(); // Вернёт null, если нет документа
    }
    
    private function getOfferVersion(): ?LegalDocument {
        return LegalDocument::where('type', 'offer')
            ->where('is_active', true)
            ->first(); 
    }
}