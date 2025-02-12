<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\NewOrder;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class NewOrderController extends Controller
{
    /**
     * Получаем новый заказ.        Пока НЕ работет!!!
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $order = Order::findOrFail($request->order_id);

        // Информируем о новом заказе ...

        Mail::to('unihoczonerussia@gmail.com')->send(new NewOrder($order));
    }
}