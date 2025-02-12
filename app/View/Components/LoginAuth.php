<?php

namespace App\View\Components;
use Illuminate\Http\Request;                // подключим класс Request
use Illuminate\Support\Facades\DB;          // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды
use Illuminate\Http\RedirectResponse;       // Ответы с перенаправлением являются экземплярами класса Illuminate\Http\RedirectResponse и содержат корректные заголовки, необходимые для перенаправления пользователя на другой URL. 
use App\Models\Login;
use App\Models\Person;
use App\Models\Organization;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

use App\Traits\TestInputTrait;

class LoginAuth extends Component
{
    use TestInputTrait;

    public function __construct(Request $request)
    {
       # Чтобы получить полный URL для входящего запроса, можно использовать методы url или fullUrl. 
       # Метод url вернет URL без строки запроса, а метод fullUrl, включая строку запроса:
       $this->locationString = $request->url();
       $this->full_url = $request->fullUrl();
       $this->request = $request;
       // dd($request->url());
    }

    public function render(): View|Closure|string
    {
        $locationString = $this->locationString;
        $fullUrl = $this->full_url;
        $request = $this->request;

        // определяем переменные, которые будем использовать в форме, и устанавливаем им первоначально пустые значения:
        $passwordErr = $user = $hash = $sessionName = $sessionUserId = $sessionUserStatus = '';
        // dump(isset($request->password));
        // dump(isset($request->email));
        if (isset($request->email) && !empty($request->email) && isset($request->password) && !empty($request->password)) {
            $loginPosted = strtolower($this->test_input($request->email));
            if (preg_match("/^[A-Za-z0-9]+\_*\.?[A-Za-z0-9]+@[A-Za-z0-9]+\.[A-Za-z0-9]+$/", $loginPosted)) {
                $login = Login::where('email', $loginPosted)->first();
                if($login) {
                    $emailClientId = $login->email_client_id;
                    $loginId = $login->id;
                    $emailClientTypeId = $login->email_client_type_id;

                    if($login->email_client_type_id == '1') {
                        $user = Person::select('id', 'user_access_id', 'password', 'name')->where('pers_login_id', $loginId)->first();
                        $hash = $user->password;
                        $sessionName = $user->name;
                        $sessionUserId = $user->id;
                        $sessionUserStatus = $user->user_access_id;
                    } elseif($login->email_client_type_id == '2') {
                        $user = Organization::select('id', 'user_access_id', 'password')->where('org_login_id', $loginId)->first();
                        $hash = $user->password;
                        $sessionName = 'ЮрЛицо';
                        $sessionUserId = $user->id;
                        $sessionUserStatus = $user->user_access_id;
                    }
                }
            } else {
                $passwordErr = 'Вы что-то не то вводите...';
            }
            
            $passwordPosted = $request->password;
            $passwordPosted = $this->test_input($passwordPosted);
            //$passwordPosted = mysqli_real_escape_string($connect, $passwordPosted);
            
            if(!empty($hash) && !empty($passwordPosted)) {            
                if(password_verify($passwordPosted, $hash)) {   
                    dd('!');    
                    session(['auth'=>true, 'user_type'=>$emailClientTypeId, 'id'=>$sessionUserId, 'user_status'=>$sessionUserStatus, 'name'=>$sessionName]);
                    session()->flash('flash', 'Вы авторизовались. Мы ждали вас!');  // с помощью метода flash сохраняем элемент в сессию только для следующего запроса. 
                    // после авторизации абонента возвращаемся на страницу, с которой была заявка на авторизацию:
                    return redirect($locationString);
                } else {
                    $passwordErr = 'Неверно введены логин или пароль';
                }
            } else {
                $passwordErr = 'Неверно введены логин или пароль';
            }
        }
        
        return view('components.login-auth', [
            'passwordErr' => $passwordErr, 'user' => $user, 'hash' => $hash, 'sessionName' => $sessionName, 'sessionUserId' => $sessionUserId, 'sessionUserStatus' => $sessionUserStatus,
            'locationString' => $locationString,
        ]);
    }
}