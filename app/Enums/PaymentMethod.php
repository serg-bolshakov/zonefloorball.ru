<?php
    //  app/Enums/PaymentMethod.php
    namespace App\Enums;

    use Illuminate\Http\Request; 

    enum PaymentMethod: string {         // Изменяем на string-based enum
        
        case ONLINE = 'online';
        case BANK_TRANSFER = 'bank_transfer';
        case CASH = 'cash';
    
        public function label(): string {
            return match($this) {
                self::ONLINE => 'Онлайн-оплата',
                self::BANK_TRANSFER => 'Банковский перевод',
                self::CASH => 'Наличные'
            };
        }
    
        public static function forRequest(Request $request): self {
            return match(true) {
                // Юрлица + выбор "по счету" → банковский перевод
                $request->input('paymentMethod') === 'bank_transfer' 
                    && $request->input('customer.type') === 'legal' => self::BANK_TRANSFER,
                    
                // Явный выбор наличных → cash
                $request->input('paymentMethod') === 'cash' => self::CASH,
                
                // Все остальные случаи → онлайн
                default => self::ONLINE
            };
        }
    }

    // Методы enum:
    // PaymentMethod::ONLINE->value     // 'online'
    // PaymentMethod::ONLINE->label()   // 'Онлайн-оплата'