<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// use App\Traits\FilterTrait; комментирую 15.01.2025 - не нужно это здесь

class BasketController extends Controller
{    
    public function show(Request $request) {

        /* пока отложим... реализацию идей... 15.01.2025
            $user = Auth::user();
            $items = $this->getBasketItems($request); // Получаем товары из корзины
        */
        return view('components.package.basketlayout', [
            'title' => 'Корзина покупок',
            'robots' => 'NOINDEX,NOFOLLOW',
            'description' => '',
            'keywords' => '',
        ]);
    }
}
