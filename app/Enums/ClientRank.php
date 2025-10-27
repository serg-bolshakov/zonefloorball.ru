<?php
// app/Enums/ClientRank.php

namespace App\Enums;
use Illuminate\Http\Request; 

enum ClientRank: int {
    case PERSON                 = 1;    // Физлицо, зарегистрированное
    case ORGANIZATION           = 2;    // Юрлицо, зарегистрированное
    case UNTRUE                 = 3;    // Ненадёжный
    case VIP                    = 4;    // VIP
    case MAJOR                  = 5;    // Крупный, надёжный
    case BANNED                 = 6;    // Не партнёр
    case OWN_COMPANY            = 7;    // Своя фирма
    case UNREGISTERED           = 8;    // Гость. Не зарегистрированный
    case SUPPLIER               = 9;    // Поставщик
    case ORG_REPRES             =10;    // Представитель организации
    
    public function title(): string {   // title() - для отображения ранга пользователю
        
        $base = match($this) {
            self::PERSON                    => 'Физлицо, зарегистрированное',
            self::ORGANIZATION              => 'Юрлицо, зарегистрированное',
            self::UNTRUE                    => 'Ненадёжный',
            self::VIP                       => 'VIP',
            self::MAJOR                     => 'Крупный, надёжный',
            self::BANNED                    => 'Не партнёр',
            self::OWN_COMPANY               => 'Своя фирма',
            self::UNREGISTERED              => 'Гость. Не зарегистрированный',
            self::SUPPLIER                  => 'Поставщик',
            self::ORG_REPRES                => 'Представитель организации',
            
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
        // Использование: ClientRank::forSelect();
        // Вернёт: [1 => 'Физлицо, зарегистрированное', 2 => 'Юрлицо, зарегистрированное', ...]

    public static function fromValue(int $value): self {
        return match($value) {
             1 => self::PERSON,
             2 => self::ORGANIZATION,
             3 => self::UNTRUE,
             4 => self::VIP,
             5 => self::MAJOR,
             6 => self::BANNED,
             7 => self::OWN_COMPANY,
             8 => self::UNREGISTERED,
             9 => self::SUPPLIER,
            10 => self::ORG_REPRES,
           
            default => throw new \InvalidArgumentException("Неизвестный ранг пользователя: $value")
        };
    }
}