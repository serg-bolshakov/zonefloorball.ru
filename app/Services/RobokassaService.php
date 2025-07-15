<?php
    namespace App\Services;
    use Illuminate\Support\Facades\Log; 

    class RobokassaService {

        public function generatePaymentLink(float $amount, int $orderId, string $description, array $items = []) {
            if ($amount <= 0) {
                throw new \Exception("Сумма оплаты должна быть больше 0");
            }
            
            if (empty($items)) {
                throw new \Exception("Нет товаров для оплаты");
            }

            $receiptJson = $this->formatReceipt($items); // Готовый JSON, например: {"sno":"usn_income",...}
            // \Log::debug('Generated Robokassa receiptJson', ['receiptJson' => $receiptJson]);

            // Для подписи - один раз URL-кодируем
            $receiptEncoded = urlencode($receiptJson);   // Первое кодирование: %7B%22sno%22%3A%22usn_income%22...
            // \Log::debug('Generated Robokassa receiptEncoded', ['receiptEncoded' => $receiptEncoded]);

            // Для URL - дважды URL-кодируем
            $receiptDoubleEncoded = urlencode($receiptEncoded); // Второе кодирование: %257B%2522sno%2522%253A%2522usn_income%2522...
            // \Log::debug('Generated Robokassa receiptDoubleEncoded', ['receiptDoubleEncoded' => $receiptDoubleEncoded]);

            // Формируем подпись с учётом Receipt
            $signatureString = implode(':', [
                config('services.robokassa.merchant_login'),
                $amount,
                $orderId,
                $receiptEncoded,                                // Важно: используем одинарно кодированный!
                config('services.robokassa.password1')
            ]);

            $params = [
                'MerchantLogin'     => config('services.robokassa.merchant_login'),
                'OutSum'            => $amount,
                'InvId'             => $orderId,
                'Description'       => $description,            // Не кодируем здесь (http_build_query сделает это автоматически)
                'IsTest'            => config('services.robokassa.test_mode') ? 1 : 0,
                'Culture'           => 'ru',
                'Encoding'          => 'utf-8',
                'Receipt'           => $receiptDoubleEncoded,   // Уже дважды закодировано // Двойное кодирование! // Добавляем данные чека (перечень товаров в чеке)
                'SignatureValue'    => md5($signatureString)
            ];
            
            // $params['SignatureValue'] = $this->generateSignature($params);

            $link = "https://auth.robokassa.ru/Merchant/Index.aspx?" . http_build_query($params);
            \Log::debug('Generated Robokassa Link', ['url' => $link]);

            $receiptFromUrl = $params['Receipt']; // '%257B%2522sno%2522%253A...'; // Значение из ссылки
            // \Log::debug('Receipt in URL', ['decoded' => $receiptFromUrl]);
            $onceDecoded = urldecode($receiptFromUrl); // -> %7B%22sno%22%3A...
            // \Log::debug('Receipt in URL', ['oncedecoded' => $onceDecoded]);
            $twiceDecoded = urldecode($onceDecoded);   // -> {"sno":"usn_income",...}
            // \Log::debug('Receipt in URL', ['twicedecoded' => $twiceDecoded]);
            $threetimesDecoded = urldecode($twiceDecoded);   
            // \Log::debug('Receipt in URL', ['threetimesdecoded' => $threetimesDecoded]);
            
            return "https://auth.robokassa.ru/Merchant/Index.aspx?" . http_build_query($params);
        }
       
        protected function formatReceipt(array $items): string {
            $receipt = [
                'sno' => 'usn_income', // Наша система налогообложения
                'items' => array_map(function($item) {
                    return [
                        'name'      => mb_substr($item['name'], 0, 128),                    // Обрезаем длинные названия - если таковые есть...
                        'quantity'  => $item['quantity'],
                        'sum'       => $item['price'] * $item['quantity'],
                        'tax'       => $item['tax'], // Ставка НДС (без НДС)
                    ];
                }, $items)
            ];
            
            return json_encode($receipt, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);     // JSON_UNESCAPED_UNICODE для корректного хранения кириллицы.
        }
    }