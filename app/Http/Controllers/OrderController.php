<?php

namespace App\Http\Controllers;

use App\Services\DiscountService;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    protected $discountService;

    public function __construct(DiscountService $discountService)
    {
        $this->discountService = $discountService;
    }

    public function store(Request $request)
    {
        // Создание заказа
        $order = Order::create([
            'total' => $request->input('total'),
            'user_id' => $request->input('user_id'),
        ]);

        // Получение клиента
        $user = User::find($request->input('user_id'));

        // Получение товаров в заказе
        $items = $request->input('items');

        // Применение скидок
        $this->discountService->applyDiscounts($order, $user, $items);

        return response()->json($order, 201);
    }
}