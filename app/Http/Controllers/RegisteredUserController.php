<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\LegalDocument;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

use App\Rules\RegistrationRules;

class RegisteredUserController extends Controller
{
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
        // Валидация данных
        $rules = $request->has('org') 
            ? RegistrationRules::legalRules() 
            : RegistrationRules::individualRules();

        $validated = $request->validate($rules, RegistrationRules::registrationMessages());

        // Получаем актуальные версии документов
        $privacyPolicy = LegalDocument::where('type', 'privacy_policy')
            ->where('is_active', true)
            ->first();
        
        $offer = LegalDocument::where('type', 'offer')
            ->where('is_active', true)
            ->first();
        
        
        $userData = array_merge($validated, [
            'initial_legal_agreement_ip' => $request->ip()
        ]);

        // Определяем тип регистрации (физлицо или юрлицо)
        if (!$request->has('org') && !$request->has('orgneedsregularcontract')) {
            $this->createIndividualUser($userData);
        } elseif ($request->has('org') && !$request->has('orgneedsregularcontract')) {
            $this->createLegalUser($userData);
        }

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
            'privacy_policy_version'     => $privacyPolicy->version,
            'offer_version'              => $offer->version,
            'initial_legal_agreement_ip' => $data['initial_legal_agreement_ip'],
        ]);
    // Вызов события Registered
        event(new Registered($user));
        return $user;
    }

    protected function createLegalUser(array $data): User {
        $representId = NULL;
            
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
            $represent->client_rank_id = 10;// Представитель организации
            $represent->user_access_id = 6; // Гость guest     
            $represent->save();
            $representId = $represent->id;   // вносим в БД новую запись и получаем id этой записи
        } else {
            $representId = $personUser->id;
        }
            
        // Создание пользователя - Юридическое лицо!!!
        $user = User::create([
            'name'                          => $data['name_of_org'],
            'email'                         => $data['regorgemail'],
            'is_taxes_pay'                  => $data['orgvatpayer'],
            'password'                      => Hash::make($data['password']),
            'org_tel'                       => $data['regorgtel'],
            'org_inn'                       => $data['org_inn'],
            'org_kpp'                       => $data['org_kpp'],
            'org_addr'                      => $data['org_addr'],
            'action_auth_id'                => 0,   // он-лайн
            'client_type_id'                => 2,   // Юридическое лицо
            'client_rank_id'                => 2,   // Юрлицо, зарегистрированное
            'this_id'                       => $representId,
            'initial_legal_agreement_ip'    => $data['initial_legal_agreement_ip'],
        ]);

        // Вызов события Registered
        event(new Registered($user));
        return $user;
    }
    
}