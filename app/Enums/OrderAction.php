<?php
// app/Enums/OrderAction.php

namespace App\Enums;
use Illuminate\Http\Request; 

enum OrderAction: string {
    case PAY = 'pay';
    case RESERVE = 'reserve';
    case PREORDER = 'preorder';

    public function label(): string {
        return match($this) {
            self::PAY       => 'pay',
            self::RESERVE   => 'reserve',
            self::PREORDER  => 'preorder'
        };
    }

    public static function forRequest(Request $request): self {
        return match(true) {
            $request->input('action') === 'pay'     => self::PAY,
            $request->input('action') === 'reserve' => self::RESERVE,
            default                                 => self::PREORDER
        };
    }
}