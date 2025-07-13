<?php
    namespace App\Services;

    class RobokassaService {

        public function generatePaymentLink(float $amount, int $orderId, string $description, array $items = []) {

            $params = [
                'MerchantLogin'  => config('services.robokassa.merchant_login'),
                'OutSum'        => $amount,
                'InvId'         => $orderId,
                'Description'   => $description,
                'IsTest'        => config('services.robokassa.test_mode') ? 1 : 0,
                'Culture'       => 'ru',
                'Encoding'      => 'utf-8',
                'Receipt'       => $this->formatReceipt($items) // Добавляем данные чека (перечень товаров в чеке)
            ];
            
            $params['SignatureValue'] = $this->generateSignature($params);
            
            return "src='https://auth.robokassa.ru/Merchant/PaymentForm/FormMS.js?" . http_build_query($params);
        }

        // значение $crc из документации Робокассы:
        protected function generateSignature(array $params): string {
            return md5(implode(':', [
                $params['MerchantLogin'],
                $params['OutSum'],
                $params['InvId'],
                config('services.robokassa.password1')
            ]));
        }
        
        protected function formatReceipt(array $items): string {
            $receipt = [
                'sno' => 'usn_income', // Наша система налогообложения
                'items' => array_map(function($item) {
                    return [
                        'name'     => mb_substr($item['name'], 0, 64),                  // Обрезаем длинные названия - уточнить нужно ли...
                        'quantity'  => $item['quantity'],
                        'sum'       => $item['price'] * $item['quantity'],
                        'tax'       => $item['tax'], // Ставка НДС (без НДС)
                    ];
                }, $items)
            ];
            
            return json_encode($receipt, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR); // JSON_UNESCAPED_UNICODE для корректного хранения кириллицы.
        }
    }