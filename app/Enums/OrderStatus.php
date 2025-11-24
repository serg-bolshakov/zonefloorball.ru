<?php
// app/Enums/OrderStatus.php

namespace App\Enums;

enum OrderStatus: int {
    case PENDING                = 1;    // Ожидание
    case CREATED                = 2;    // Создан
    case RESERVED               = 3;    // Зарезервирован
    case CONFIRMED              = 4;    // Подтверждён
    case CANCELLED              = 5;    // Отменён
    case FAILED                 = 6;    // Ошибка при создании
    case IN_PROCESSING          = 7;    // Заказ оплачен (или принято решение об отгрузке без предоплаты). Комплектуется и готовится к отгрузке (отправке/получению) со склада.
    case READY_TO_BE_DISPATCHED = 8;    // Готов к отгрузке/отправке/получению со склада
    case SHIPPED                = 9;    // Заказ отпрален
    case DELIVEVERED            =10;    // Заказ доставлен в место получения/выдачи
    case RECEIVED               =11;    // Товары получены покупателем
    case COMPLETED              =12;    // Заказ завершён (товар получен, заказ оплачен, претензий у сторон нет)
    case RETURNED               =13;    // Оформлен возврат товара
    case NULLIFY                =14;    // Счёт/резерв не оплачен в течение 3-х дней: аннулирован, товары снимаются с резерва, счёт не подлежит оплате, делать недействительным
    case PREORDER               =15;    // Предзаказ
    
    public function title(?string $latestDate = null): string {   // title() - для отображения статуса заказа
        
        $base = match($this) {
            self::PENDING                   => 'Ожидание обработки',
            self::CREATED                   => 'Заказ создан',
            self::RESERVED                  => 'Товар зарезервирован',
            self::CONFIRMED                 => 'Подтверждён',
            self::CANCELLED                 => 'Заказ отменён',
            self::FAILED                    => 'Ошибка при создании',
            self::IN_PROCESSING             => 'В обработке',
            self::READY_TO_BE_DISPATCHED    => 'Готов к отгрузке/отправке покупателю',
            self::SHIPPED                   => 'В пути',
            self::DELIVEVERED               => 'Доставлен',
            self::RECEIVED                  => 'Получен',
            self::COMPLETED                 => 'Завершён',
            self::RETURNED                  => 'Оформлен возврат',
            self::NULLIFY                   => 'Не оплачен в срок. Аннулирован',
            self::PREORDER                  => 'Ожидание поступления товара',
            default                         => 'Неизвестно'
        };

        return $latestDate && $this === self::PREORDER
            ? "{$base} (до {$latestDate})"
            : $base;
    }
        /** Где брать $latestDate: 
         * В сервисе при подтверждении заказа
         *       $latestDate = $order->items()
         *           ->where('is_preorder', true)
         *           ->max('expected_delivery_date');
         */

    
    public function getDefaultComment(): string {
        return match($this) {
            self::CREATED => 'Покупатель создал заказ',
            self::PREORDER => 'Покупатель оформил предзаказ',
            self::RESERVED => 'Товары зарезервированы',
            // ... остальные статусы
            default => 'Статус изменён'
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
             6 => self::FAILED,
             7 => self::IN_PROCESSING,
             8 => self::READY_TO_BE_DISPATCHED,
             9 => self::SHIPPED,
            10 => self::DELIVEVERED,
            11 => self::RECEIVED,
            12 => self::COMPLETED,
            13 => self::RETURNED,
            14 => self::NULLIFY,
            15 => self::PREORDER,
            default => throw new \InvalidArgumentException("Неизвестный статус: $value")
        };
    }
}
