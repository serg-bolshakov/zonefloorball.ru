<?php
// app/Enums/OrderStatus.php

namespace App\Enums;

enum OrderStatus: int {
    case PENDING                = 1;    // Ожидание
    case CREATED                = 2;    // Создан
    case RESERVED               = 3;    // Зарезервирован
    case CONFIRMED              = 4;    // Подтверждён
    case CANCELLED              = 5;    //Отменён
    case IN_PROCESSING          = 6;    // Заказ оплачен (или принято решение об отгрузке без предоплаты). Комплектуется и готовится к отгрузке (отправке/получению) со склада.
    case READY_TO_BE_DISPATCHED = 7;    // Готов к отгрузке/отправке/получению со склада
    case SHIPPED                = 8;    // Заказ отпрален
    case DELIVEVERED            = 9;    // Заказ доставлен в место получения/выдачи
    case RECEIVED               =10;    // Товары получены покупателем
    case COMPLETED              =11;    // Заказ завершён (товар получен, заказ оплачен, претензий у сторон нет)
    case RETURNED               =12;    // Оформлен возврат товара
    case NULLIFY                =13;    // Счёт/резерв не оплачен в течение 3-х дней: аннулирован, товары снимаются с резерва, счёт не подлежит оплате, делать недействительным
    
    public function title(): string {
        return match($this) {
            self::PENDING                   => 'Ожидание обработки',
            self::CREATED                   => 'Заказ создан',
            self::RESERVED                  => 'Товар зарезервирован',
            self::CANCELLED                 => 'Заказ отменён',
            self::IN_PROCESSING             => 'В обработке',
            self::READY_TO_BE_DISPATCHED    => 'Готов к отгрузке',
            self::SHIPPED                   => 'Отгружен',
            self::DELIVEVERED               => 'Доставлен',
            self::RECEIVED                  => 'Получен',
            self::COMPLETED                 => 'Завершён',
            self::RETURNED                  => 'Оформлен возврат',
            self::NULLIFY                   => 'Аннулирован',
            default                         => 'Неизвестно'
        };
    }

    public static function forSelect(): array {
        return collect(self::cases())
            ->mapWithKeys(fn($case) => [
                $case->value => $case->title()
            ])
            ->toArray();
    }
        // Использование: OrderStatus::forSelect();
        // Вернёт: [1 => 'Ожидание обработки', 2 => 'Заказ создан', ...]

    public static function fromValue(int $value): self {
        return match($value) {
             1 => self::PENDING,
             2 => self::CREATED,
             3 => self::RESERVED,
             4 => self::CONFIRMED,
             5 => self::CANCELLED,
             6 => self::IN_PROCESSING,
             7 => self::READY_TO_BE_DISPATCHED,
             8 => self::SHIPPED,
             9 => self::DELIVEVERED,
            10 => self::RECEIVED,
            11 => self::COMPLETED,
            12 => self::RETURNED,
            13 => self::NULLIFY,
            default => throw new \InvalidArgumentException("Неизвестный статус: $value")
        };
    }
}
