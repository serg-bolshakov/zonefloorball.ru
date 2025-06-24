<?php
// app/Http/Controllers/UserOrdersCountController.php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Models\Order;
use App\Models\User;

class UserOrdersCountController extends Controller
{
    public function index()
    {
        /*
        // если пользователь авторизован:
        if(Auth::check()) {
            // Получаем пользователя с загруженным отношением rank: $user = Auth::user()->load('rank'); // $user = $request->user()->with('rank')->first();
            // Получаем текущего авторизованного пользователя. По идее можно упростить код, используя auth() хелпер, который возвращает текущего авторизованного пользователя. Пробуем:
            $user = auth();

            // Получаем заказы Пользователя и выводим кол-во заказов: $ordersCount = Order::all()->where('order_client_id', $user->id)->count();
            // Получаем ТОЛЬКО количество заказов пользователя. Использование Order::all() может быть неэффективно, так как это должно загружать все заказы из базы данных. Пробуем использовать count() напрямую, чтобы избежать лишней нагрузки на базу данных:
            $ordersCount = Order::where('order_client_id', $user->id)->count();

            // Возвращаем количество заказов
            return response()->json(['ordersCount' => $ordersCount], 200);
        }

        // Если пользователь не авторизован, возвращаем 0
        return response()->json(['ordersCount' => 0], 200);*/
    }
}