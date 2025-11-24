<?php
// app/Enums/PriceType.php

namespace App\Enums;
use Illuminate\Http\Request; 

enum PriceType: int {
    case PRICE_INCOME           = 1;    // Закупочная цена (себестоимость) - для внутреннего учета
    case PRICE_REGULAR          = 2;    // Регулярная цена продажи для розничных покупателей
    case PRICE_SPECIAL          = 3;    // Специальная цена (акции, распродажи)
    case PRICE_PREORDER         = 4;    // Цена предзаказа (ранние бронирования)
    case PRICE_COST             = 5;    // Средняя себестоимость товара. Рассчитывается автоматически при проведении документов поступления.
        
    public function title(): string {   // title() - для отображения ранга пользователю
        
        $base = match($this) {
            self::PRICE_INCOME              => 'Закупочная цена (себестоимость) - для внутреннего учета',
            self::PRICE_REGULAR             => 'Регулярная цена продажи для розничных покупателей',
            self::PRICE_SPECIAL             => 'Специальная цена (акции, распродажи)',
            self::PRICE_PREORDER            => 'Цена предзаказа (ранние бронирования)',
            self::PRICE_COST                => 'Средняя себестоимость товара. Рассчитывается автоматически при проведении документов поступления.',
                        
            default                         => 'Неизвестно'
        };

        return $base;
    }
        
    public static function forSelect(): array {
        return collect(self::cases())
            ->mapWithKeys(fn($case) => [
                $case->value => $case->title()
            ])
            ->toArray();
    }
        // Использование: PriceType::forSelect();
        // Вернёт: [1 => 'Закупочная цена (себестоимость) - для внутреннего учета', 2 => 'Регулярная цена продажи для розничных покупателей', ...]

    public static function fromValue(int $value): self {
        return match($value) {
            1 => self::PRICE_INCOME,
            2 => self::PRICE_REGULAR,
            3 => self::PRICE_SPECIAL,
            4 => self::PRICE_PREORDER,
            5 => self::PRICE_COST ,
                       
            default => throw new \InvalidArgumentException("Неизвестный тип цены: $value")
        };
    }
}