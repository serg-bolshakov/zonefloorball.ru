<?php

namespace App\View\Components\Catalog;
use App\Traits\CategoryTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;  // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class SubNav extends Component
{
    use CategoryTrait;
    
    # Теперь получим данные строки запроса в конструкторе, указав объект запроса параметром действия, используя контроль типов:
    public function __construct(Request $request)
    {
        # у нас будет доступна переменная $request, содержащая нужный нам объект запроса. Получаем GET-запрос из адресной строки и записываем его в свойство:
        $this->requestWithFilters = $request->all();
        //dd($this->requestWithFilters);
    }

    public function render(): View|Closure|string
    {
        $res = [];
        $categoryId = $this->getCategoryIdViaUrl();
        $filtersArr = $this->requestWithFilters;

        if(!$categoryId && !empty($filtersArr)) {
            /*
                array:2 [▼ // app\View\Components\Catalog\SubNav.php:20
                "sticks" => "serie"
                "serie" => "signature-sticks-series"
                ]
            */
            $categoryUrlSemantic = array_key_first($filtersArr);                        // Получить первый ключ заданного массива array, не затрагивая внутренний указатель массива.
            $categoryId = $this->getCategoryIdViaSlug($categoryUrlSemantic);            // если изначально id категории был неопределен - пробуем его получить

            # если категория товара определена, определяем запрашиваемое свойство:
            if($categoryId) {
                $prodPropTitle = $filtersArr[$categoryUrlSemantic];
                $categoryValueView = DB::table('categories')->where('url_semantic', '=', $categoryUrlSemantic)->value('category_view_2');
                $res['categoryValueView'] = $categoryValueView;
                // dd($prodPropTitle);
                # если это модель, то просто делаем выборку подходящих товаров из $products:
                if(!empty($prodPropTitle) && $prodPropTitle == 'model') {
                    $propValueView = DB::table('products')->select('model')->where('model', '=', $filtersArr[$prodPropTitle])->first()->model; 
                    // dd($propValueView);
                    $res['propClass'] = 'Модель:';
                } elseif(!empty($prodPropTitle) && $prodPropTitle == 'serie') {
                    $propValueView = DB::table('properties')->where('prop_url_semantic', '=', $filtersArr[$prodPropTitle])->value('prop_value_view'); 
                    $res['propClass'] = 'Серия:';
                }

                if(isset($propValueView)) {$res['propValueView'] = $propValueView;} // до манипуляций 08.01.2025 было просто: if($propValueView) {$res['propValueView'] = $propValueView;}
                
            }
        }
        //dd($res);
        return view('components.sub-nav', [
            'subNavBar' => $res
        ]);
    }
}