<?php

namespace App\Http\Controllers;

use App\Traits\FilterTrait;

class PackageController extends Controller
{    
    use FilterTrait;

    public function show() {
        
        $slug = $this->getSlug();

        if      ($slug == 'favorites')  { $title = 'Избранное';         } 
        elseif  ($slug == 'basket')     { $title = 'Корзина покупок';   } 
        elseif  ($slug == 'orders')     {    
            return view('components.package.orderslayout', [
                'title' => 'Мои покупки и заказы',
                'robots' => 'NOINDEX,NOFOLLOW',
                'description' => '',
                'keywords' => '',
            ]);
        } 
        else                            { $title = 'Секретная страница';}


        return view('components.package.layout', [
            'title' => $title,
            'robots' => 'NOINDEX,NOFOLLOW',
            'description' => '',
            'keywords' => '',
            'targetComponent' => "package.$slug",
        ]);
    }
}
