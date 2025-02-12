<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Person;
use App\Models\Organization;

class LkController extends Controller
{    
    public function index(Request $request) {
        // если пользователь авторизован:
        if(session()->has('auth')) {
            // get - запросы из профиля абонента:
            $getRequest = $getRequestValue = '';
            if(isset($request->getproducts) && !empty($request->getproducts)) { $getRequest = 'getproducts'; $getRequestValue = $request->getproducts; }
            if(isset($request->getorders  ) && !empty($request->getorders  )) { $getRequest = 'getorders'  ; $getRequestValue = $request->getorders  ; }
                
            // если авторизованный пользователь выбрал "просмотр заказа":
            if(isset($request->orderactionselected) && !empty($request->orderactionselected)) { $getRequest = 'orderactionselected'  ; $getRequestValue = $request->orderactionselected  ; }
            
            // если авторизовано физическое лицо:
            if(session('user_type') == '1') {
                $keyUserId = session('id');
                $persInfo = Person::where('id', $keyUserId)->first();
                //dd($getRequest);
                return view('lk.person', [
                    'title' => 'Мой личный кабинет',
                    'robots' => 'NOINDEX,NOFOLLOW',
                    'description' => '',
                    'keywords' => '',
                    'persInfo' => $persInfo,
                    'getRequest' => $getRequest,
                    'getRequestValue' => $getRequestValue,
                ]);
            // если юридическое:
            } elseif($keyUserType == '2') {
                // 
            }
        } else {
            session()->flash('flash', 'Только зарегистрированные и авторизованные пользователи имеют доступ к этой странице. <br>Пожалуйста, авторизуйтесь...');
            return view('index.index', [
                'title' => 'UnihocZoneRussia Флорбольная экипировка.Всё для флорбола. Купить',
                'robots' => 'INDEX,FOLLOW',
                'description' => 'Найти, выбрать и купить товары для флорбола для детей и взрослых. Всё для флорбола от ведущего мирового производителя.',
                'keywords' => 'Клюшки для флорбола, обувь, очки, сумки и чехлы для взрослых и детей. Флорбольные ворота и мячи.',
            ]);
        }        
    }
}