<?php
// app/Enums/OrderAction.php

namespace App\Enums;
use Illuminate\Http\Request; 

enum OrderAction: string {
    case PAY = 'pay';
    case RESERVE = 'reserve';
    case PREORDER = 'preorder';

    public function label(): string {
        /* return match($this) {
            self::PAY       => 'pay',
            self::RESERVE   => 'reserve',
            self::PREORDER  => 'preorder'
        }; */

        return $this->value; // Проще, чем match!
    }

    public static function fromRequest(Request $request): self {
        return self::tryFrom($request->input('action')) 
            ?? throw new \InvalidArgumentException('Invalid action');
    }

    /* public static function forRequest(Request $request): self {
        return match(true) {
            $request->input('action') === 'pay'     => self::PAY,
            $request->input('action') === 'reserve' => self::RESERVE,
            default                                 => self::PREORDER
        };} */

    public static function forRequest(Request $request): self {            // forRequest(). Задача: Обработка HTTP-запроса с fallback-значением (PREORDER). Поведение: Всегда возвращает enum (даже для невалидных значений). Использование: Когда нужна "мягкая" обработка с дефолтным значением7 
        return self::tryFrom($request->input('action'))                    // tryFrom() (стандартный метод enum). Задача: Строгая конвертация строки в enum с проверкой. Поведение: Вернёт null при невалидном значении. Использование: Когда нужно чётко валидировать входные данные 
            ?? self::PREORDER; // Fallback
    }
}