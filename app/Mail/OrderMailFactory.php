<?php
// app/Mail/OrderMailFactory.php - класс для генерации писем

namespace App\Mail;

use App\Models\Order;
use App\Models\User;

use Illuminate\Mail\Mailable;


class OrderMailFactory {

    public static function create(Order $order, User $user): Mailable {
        $isPreorder = $order->is_preorder;
        
        return match (true) {
            // $isPreorder && $user->isIndividual() => new PreorderReserve($order, $user),
            $isPreorder && $user->isIndividual()    => new OrderReserve($order, $user),            // Пока оставим как есть... просто отправим резерв... Дальше - посмотрим...
            $isPreorder && $user->isLegal()         => new PreorderInvoice($order, $user),
            $user->isLegal()                        => new OrderInvoice($order, $user),
            default                                 => new OrderReserve($order, $user)
        };
    }
}