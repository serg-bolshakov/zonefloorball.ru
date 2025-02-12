<?php

namespace App\View\Components\Package;
use Illuminate\Http\Request; // подключим класс Request
use App\Models\Product;

use App\Traits\CategoryTrait;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;
use Illuminate\Support\Facades\Auth;

class Favorites extends Component
{
    use CategoryTrait;
    
    public function __construct(Request $request)
    {
       $this->request = $request;
    }

    public function render(): View|Closure|string
    {
        $prodsInFavoriteIdsArr = [];
        $prodsInFavoriteIdsStr = $this->request->favoriteslistfromlocalstorage;
        $productsArr = [];
        $user = NULL;
        $rankDiscount = $rankDiscountPercent = NULL;

        // если пользователь авторизован, нужно получить его данные для возможного оформления заказов:
        if(Auth::check()) {
            // Получаем пользователя с загруженным отношением rank
            $user = Auth::user()->load('rank');
        }

        if(!empty($prodsInFavoriteIdsStr)) {
            $prodsInFavoriteIdsArr = explode(',', $prodsInFavoriteIdsStr);
        }
        //dd($prodsInFavoriteIdsStr);
        
        if(!empty($prodsInFavoriteIdsArr)) {
        
            $products = Product::with(['actualPrice', 'regularPrice', 'productReport', 'productShowCaseImage'])
                ->where('product_status_id', '=', 1)
                ->when($prodsInFavoriteIdsArr, function ($query, $prodsInFavoriteIdsArr) {
                    $query->whereIn('id', $prodsInFavoriteIdsArr);
                })
            ->get();
        
            $i = 0;
        
            // если пользователь авторизован, мы должны проверить какие скидки ему доступны (по умолчанию, согласно рангу):
            if(isset($user->rank->price_discount) && ($user->rank->price_discount > 0)) {
                $rankDiscountPercent = $user->rank->price_discount;
            }

            foreach($products as $product) {
                $productsArr[$i]['id'] = $product->id;
                $productsArr[$i]['title'] = $product->title;
                $productsArr[$i]['prod_url_semantic'] = $product->prod_url_semantic;
                $productsArr[$i]['img_link'] = $product->productShowCaseImage->img_link;
                $productsArr[$i]['on_sale'] = $product->productReport->on_sale;
                $productsArr[$i]['article'] = $product->article;
                
                $productsArr[$i]['price_actual'] = $product->actualPrice->price_value  ?? NULL;
                $productsArr[$i]['price_regular'] = $product->regularPrice->price_value  ?? NULL;

                // Работаем с примененим системы скидок:
                $productsArr[$i]['price_with_rank_discount'] = $productsArr[$i]['percent_of_rank_discount'] = NULL;
                $productsArr[$i]['price_with_action_discount'] = $productsArr[$i]['summa_of_action_discount'] = NULL; // это скидки по "акциям"

                // если в корзину идёт регулярная цена (без скидки), подсчитаем цену со скидкой, в зависимости от ранга покупателя: 
                if(+$product->actualPrice->price_value == +$product->regularPrice->price_value) {
                    if($rankDiscountPercent) {
                        $productsArr[$i]['price_with_rank_discount'] = round($product->regularPrice->price_value - ($product->regularPrice->price_value * ($rankDiscountPercent / 100))); 
                        $productsArr[$i]['percent_of_rank_discount'] = $rankDiscountPercent;
                    }
                } elseif(+$product->actualPrice->price_value < +$product->regularPrice->price_value) {
                    // если есть специальная цена, нужно посмотреть какая цена меньше, ту и показываем => скидки не суммируем!
                    $actualPrice = $product->actualPrice->price_value;
                    $regularPrice = $product->regularPrice->price_value;
                    $possiblePriceWithDiscount = round($regularPrice - ($regularPrice * ($rankDiscountPercent / 100)));
                    if($possiblePriceWithDiscount < $actualPrice) {
                        $productsArr[$i]['price_with_rank_discount'] = $possiblePriceWithDiscount;
                        $productsArr[$i]['percent_of_rank_discount'] = $rankDiscountPercent;
                    } else {
                        // выводим для покупателя его выгоду от покупки товара по цене со кидкой по акции:
                        $productsArr[$i]['summa_of_action_discount'] = $regularPrice - $actualPrice;
                    }
                }
                
                $productsArr[$i]['date_end'] = NULL;
                if(+$product->actualPrice->price_value < +$product->regularPrice->price_value) {
                    $productsArr[$i]['price_special'] = $product->actualPrice->price_value;
                    $productsArr[$i]['date_end'] = $product->actualPrice->date_end  ?? NULL;
                } else {
                    $productsArr[$i]['price_special'] = NULL;
                }
                
                // $productsArr[$i]['prod_status'] = $product->product_status_id;
                $i++;
            }
        }
        
            //dd($productsArr);    
        return view('components.package.favorites', [
            'data' => $productsArr,
            'user' => $user,
        ]);
    }
}
