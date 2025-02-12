<?php

namespace App\View\Components\AsideWithFilters;
use Illuminate\Http\Request; // подключим класс Request


use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

use App\Traits\FilterTrait;

class Balls extends Component
{   

    use FilterTrait;

    /**
     * Create a new component instance.
     */
    public function __construct(Request $request)
    {
        # у нас будет доступна переменная $request, содержащая нужный нам объект запроса. Получаем GET-запрос из адресной строки и записываем его в свойство:
        $this->requestWithFilters = $request->all();
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        $asideWithFilters = $this->getAsideWithFilters($categoryId = 3, $prodStatus = 1); 

        return view('components.aside-with-filters.balls', [
            'asideWithFilters' => $asideWithFilters,
        ]);

    }
}
