<?php

namespace App\View\Components\Profile;
use Illuminate\Http\Request; // подключим класс Request
use Illuminate\Support\Facades\DB;  // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды

use App\Models\Product;
use App\Models\Category;

use App\Traits\CategoryTrait;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class TableProducts extends Component
{
    use CategoryTrait;
    
    public function __construct(Request $request)
    {
       $this->request = $request;
    }

    public function render(): View|Closure|string
    {
        // dd($this->request);
        
        # выбираем категории (подкатегории), где есть товары в наличии, для продажи или для заказа (не архивированные)
        $categories = DB::table('categories')
        ->join('products', 'categories.id', '=', 'products.category_id') 
        ->where('products.product_status_id', '<>', '2')
        ->distinct()
        ->get('categories.*');

        $categoryCheckedId = $categoryChecked = '';
        if($this->request->productCategory) {
            // получаем id запрошенной категории:
            $categoryCheckedSlug = ($this->request->productCategory);
            $categoryCheckedId = $this->getCategoryIdViaSlug($categoryCheckedSlug);
            // получаем наименование запрошенной категории для передачи в представление:
            $categoryChecked = Category::where('id', $categoryCheckedId)->first()->category_view_2;
        }

        # получаем список товаров:
        $products = Product::with(['brand', 'actualPrice', 'regularPrice', 'productReport', 'productUnit', 'productMainImage', 'productShowCaseImage'])
            ->where('product_status_id', '<>', '2')
            ->when($categoryCheckedId, function ($query, $categoryCheckedId) {
                $query->where('category_id', $categoryCheckedId);
       })
            ->get();
        //dd($products);

        return view('components.profile.table-products', [
            'categories' => $categories,
            'products'   => $products,
            'categoryChecked' => $categoryChecked,
        ]);
    }
}