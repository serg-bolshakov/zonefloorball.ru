<?php

namespace App\View\Components\AsideWithFilters;
use Illuminate\Http\Request; // подключим класс Request
use Illuminate\Support\Facades\DB;  // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

use App\Traits\FilterTrait;
use App\Traits\CategoryTrait;

class Bags extends Component
{   

    use FilterTrait;
    use CategoryTrait;

    public function __construct(Request $request)
    {
        # у нас будет доступна переменная $request, содержащая нужный нам объект запроса. Получаем GET-запрос из адресной строки и записываем его в свойство:
        $this->requestWithFilters = $request->all();
    }

    public function render(): View|Closure|string
    {
        $categoryUrlSemantic = $this->getCategoryUrlSemantic();
        $categoryId = $this->getCategoryIdViaUrl();
        $target = $this->getBrandedCategoriesMenuArrMainCategory($branId = 0, $categoryId);
        $brands = $this->getCategoryPossibleBrands($target['catIds']);
        
        # если в категории товары одного бренда, нет смысла делать фильтр по бренду:
        $asideWithFilters['brands'] = $this->getCheckedFilterBrandsIfExists($brands);

        # тоже, проверяем если категория не одна...
        $categories = $target[$categoryId];
        $asideWithFilters['categories'] = $this->getCheckedFilterCategoriesIfExists($categories);

        //dd($asideWithFilters);

        return view("components.aside-with-filters.$categoryUrlSemantic", [
            'asideWithFilters' => $asideWithFilters,
        ]);

    }

}