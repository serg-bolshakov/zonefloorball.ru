<?php
// app/Mail/OrderReserve.php

namespace App\Mail;

use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\Seller;

use App\Traits\NumberToRussianTrait;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

use Illuminate\Mail\Mailables\Address;          // 28.12.2024 https://github.com/russsiq/laravel-docs-ru/blob/9.x/docs/mail.md#configuring-the-sender
use Barryvdh\DomPDF\Facade\Pdf;   

class OrderReserve extends Mailable
{
    use Queueable, SerializesModels;
    use NumberToRussianTrait;

    protected $order;
    protected $user;

    /**
     * Создать экземпляр нового сообщения.
     *
     * @param  \App\Models\Order  $order
     * @return void
     */
    public function __construct(Order $order, User $user)
    {
        $this->order = $order;
        $this->buyer = $user;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope        // параметром в new Envelope - нужно передать либо именованный параметр subject:, либо массив
    {
        $clientType = $this->buyer->client_type_id ?? 1; // По умолчанию физлицо
        $prefix = $clientType == 1 ? 'Мой' : 'Наш';
    
        return new Envelope(
            subject: "Флорбол. {$prefix} заказ № {$this->order->order_number}"
        );
    }
    
    /**
     * Получить определение содержимого сообщения.
     *
     * @return \Illuminate\Mail\Mailables\Content
     */
    public function content()
    { 
        // Подготавливаем данные
        $data = $this->prepareData();

        return new Content(
            view: 'emails.orders.reserve',
            with: $data,
        );
    }
    
    public function buildPdf()
    {
        $content = view('emails.orders.reserve', $this->content()->with)->render();
        // \Log::debug('OrderReserve buildPdf:', [ 'content' => $content]);
        // Настройка dompdf
        $pdf = Pdf::loadHTML($content);
        $pdf->setOption('defaultFont', 'DejaVu Sans'); // Указываем шрифт
        $pdf->setOption('isHtml5ParserEnabled', true); // Включаем поддержку HTML5
        $pdf->setOption('isRemoteEnabled', true); // Разрешаем загрузку внешних ресурсов (например, изображений)

        return Pdf::loadHTML($content)->output();
    }

    public function buildPdfAndSave($relativePath)
    {
        // \Log::debug('OrderReserve buildPdfAndSave:', [ 'start' => 'staart', '$relativePath' => $relativePath]);
              
        // Подготавливаем данные
        $data = $this->prepareData();

        // \Log::debug('OrderReserve buildPdfAndSave:', [ 'data' => $data]);

        // Рендерим шаблон
        $content = view('emails.orders.reserve', $data)->render();

        // Генерация PDF
        $pdf = Pdf::loadHTML($content);
        $pdf->setOption('defaultFont', 'DejaVu Sans'); // Указываем шрифт
        $pdf->setOption('isHtml5ParserEnabled', true); // Включаем поддержку HTML5
        $pdf->setOption('isRemoteEnabled', true); // Разрешаем загрузку внешних ресурсов (например, изображений)

        // Полный путь для сохранения файла на сервере
        $fullPath = public_path($relativePath);
        
        // Сохраняем PDF
        $pdf->save($fullPath);

        return;
    }

    public function attachments(): array
    {
        // Для физлиц не прикрепляем PDF
        if ($this->buyer->client_type_id === 1) {
            return [];
        }

        // Для юрлиц и других случаев
        return [
            \Illuminate\Mail\Mailables\Attachment::fromData(
                fn () => $this->buildPdf(), 
                'zakaz.pdf'
            )->withMime('application/pdf'),
        ];
    }

    public function sanitizeOrderNumber($orderNumber) {
        // Заменяем недопустимые символы на подчёркивание
        return preg_replace('/[\/\- ]/', '_', $orderNumber);
    }

    public function encryptOrderNumber($orderNumber) {
        return substr(md5($orderNumber . uniqid()), 0, 8); // первые 8 символов хеша
    }

    /*public function decryptOrderNumber($encryptedOrderNumber)
        {
            return Crypt::decryptString($encryptedOrderNumber);
    }*/
    
    protected function prepareData()
    {
        $orderRecipient = $contactTelNum = $transport = $dataAboutGoodsForMailBody = $address = '';

        $orderWithTansport = Order::with(['transport'])->where('id', $this->order->id)->first();
        if(!empty($orderWithTansport['transport']->name)) {
            $transport = $orderWithTansport['transport']->name;
        }
        
        $orderDate = is_numeric($this->order->order_date) 
            ? date('d.m.Y', $this->order->order_date)
            : date('d.m.Y', strtotime($this->order->order_date));

        $buyerName = $this->buyer->pers_surname . ' ' . $this->buyer->name;
        $buyerTel = $this->buyer->pers_tel;

        /** в модели Orders у нас есть: Получить все позиции заказа (с количеством, ценой)
         *   public function items() {
         *       return $this->hasMany(OrderItem::class);                // Один заказ → много позиций
         *   }  
         */
        // Получаем массив позиций заказа через отношение items()
        $itemsArr = $this->order->items()->with('product')->get();
        
        $i = 1;

        $totalAmount = $totalDiscount = $totalAmountInRegularPrices = $totalOrderAmountNotFormatted = 0;
        
        foreach($itemsArr as $item) {

            $prodInfo = Product::find($item->product_id);           // С помощью специального метода find можно получить запись по ее id
            $productArticle = $prodInfo->article;
            $productName = $prodInfo->title;
            $productPrice = number_format((float)$item->price, 0,",", " ");
            $productPriceRegular = number_format((float)$item->regular_price, 0,",", " ");
            $productAmount = (float)$item->quantity * (float)$item->price;
            $productAmountFormatted = number_format((float)$productAmount, 0,",", " ");

            // если цена идёт со скидкой
            if($item->price < $item->regular_price) {
                $oneProductUnitDiscount = $item->applied_discount ?? $item->regular_price - $item->price; // с проверкой на null applied_discount (это поле пока не заполняем пока, как раз и должно быть null) - пока значение рассчитываем
                $productDiscount = $oneProductUnitDiscount * $item->quantity;
                $productDiscountFormatted = number_format((float)$productDiscount, 0,",", " ");
                $dataAboutGoodsForMailBody .= '<tr><td style="text-align: center;">' . $i . '</td><td style="text-align: center;">' . $productArticle . '</td><td>' . $productName . '</td><td style="text-align: center;">' . $item->quantity . '
                &nbsp;шт.</td><td style="text-align: right;">' . $productPrice . '</sup></td><td style="text-align: right;">' . $productAmountFormatted . 
                '</td><td style="text-align: right;"><font color="red">' . $productDiscountFormatted . '&nbsp;<sup>&#8381;</sup></font></td></tr>';
                $i++;
                $totalDiscount += +$productDiscount;
            } else {
                $dataAboutGoodsForMailBody .= '<tr><td style="text-align: center;">' . $i . '</td><td>' . $productArticle . '</td><td>' . $productName . '</td><td style="text-align: center;">' . $item->quantity . '
                &nbsp;шт.</td><td style="text-align: right;">' . $productPrice . '</td><td style="text-align: center;">' . $productAmountFormatted . '</td><td>&nbsp;</td></tr>';
                $i++;
            }

            $totalAmount += $productAmount;
            $totalAmountInRegularPrices += $item->quantity * $item->regular_price; 
        }

        $productAmountFormatted = number_format((float)$totalAmount, 0,",", " ");
        $deliveryCost = number_format((float)($this->order->order_delivery_cost), 0,",", " ");
        if($this->order->order_delivery_cost > 0) {
            $deliveryCostLine = '<li><strong>Стоимость доставки заказа</strong>:&nbsp;' . $deliveryCost . '&nbsp;<sup>&#8381;</sup></li>';
        } elseif($this->order->order_delivery_cost == '0') {
            $deliveryCostLine = '<li><strong>Получение товаров со склада (самовывоз)</strong>:&nbsp;бесплатно</li>';
        } else {
            $deliveryCostLine = '';
        }
        
        $totalOrderAmount = number_format((float)($totalAmount + $this->order->order_delivery_cost), 0,",", " ");
        $totalOrderAmountNotFormatted = +$totalAmount + (int)($this->order->order_delivery_cost);

        $totalAmountInRegularPricesFormatted = $totalAmountInRegularPricesFormattedNote = '';
        if($totalAmountInRegularPrices > 0) { 
            $totalAmountInRegularPricesFormatted = number_format((float)$totalAmountInRegularPrices, 0,",", " ");
            $totalAmountInRegularPricesFormattedNote = '(<s>' . $totalAmountInRegularPricesFormatted . '&nbsp;<sup>&#8381;</sup></s>)';
        }

        // если была применена скидка, мы должны указать строкой, что такая скидка была применена:
        if($totalDiscount > 0) {
            $totalDiscount = number_format((float)$totalDiscount, 0,",", " ");
            $discountTotalLine = '<h5>Скидка по заказу составила:&nbsp;<font color="red">' . $totalDiscount  . '&nbsp;<sup>&#8381;</sup></font></h5>';
        } else {
            $discountTotalLine = '<br>';
        }

        // выведем общую стоимость заказа прописью:
        $orderAmountinRussian = '';
        $numberToRussian = $this->numberToRussian($totalOrderAmountNotFormatted);
        if(isset($numberToRussian) && !empty($numberToRussian)) {
            if(!function_exists('mb_ucfirst')) {
                function mb_ucfirst($str) {
                    $fc = mb_strtoupper(mb_substr($str, 0, 1));
                    return $fc . mb_substr($str, 1);
                }
            }
            // переводим в верхний регистр первый символ строки с суммой прописью:             
            $numberToRussian = (mb_ucfirst($numberToRussian));
            $orderAmountinRussian = '<p>Всего к оплате:&nbsp;<strong>' . $numberToRussian . '&nbsp;руб. 00 копеек</strong></p>';
        }
        
        // Используем обновлённый invoice_url
        $pdfUrl = asset($this->order->invoice_url);      // asset(), ДОЛЖНА автоматически добавить домен и правильный путь.
        // Функция asset() генерирует полный URL на основе относительного пути. Например: Если invoice_url содержит storage/invoices/invoice_2_25_01_207_1b27f699.pdf, то asset($this->order->invoice_url) вернёт: http://ваш-домен/storage/invoices/invoice_2_25_01_207_1b27f699.pdf
        $invoiceUrl = asset('invoice/'  . $this->order->access_hash); 
        
        
        /*$trackUrl = ($this->order->order_client_rank_id == '8')         // Не зарегистрированный ("Гость")
            ? asset('order/track/'. $this->order->access_hash)
            : asset('profile/order/track/'. $this->order->access_hash);*/

        // $trackUrl = asset('order/track/'. $this->order->access_hash); 

        $trackUrl = ($this->order->order_client_rank_id == '8')
            ? route('order.track', $this->order->access_hash)           // Используем именованный маршрут
            : route('privateorder.track', $this->order->access_hash);

        $data = [
            'orderNum'                                  => $this->order->order_number               ,
            'orderDate'                                 => $orderDate                               ,
            'buyerName'                                 => $buyerName                               ,
            'buyerTel'                                  => $buyerTel                                ,
            'transport'                                 => $transport                               ,
            'deliveryAddress'                           => $this->order->order_delivery_address     ,
            'dataAboutGoodsForMailBody'                 => $dataAboutGoodsForMailBody               ,
            'productAmount'                             => $productAmountFormatted                  ,
            'totalDiscount'                             => $totalDiscount                           ,
            'discountTotalLine'                         => $discountTotalLine                       ,
            'deliveryCostLine'                          => $deliveryCostLine                        ,
            'deliveryCost'                              => $deliveryCost                            ,
            'totalOrderAmount'                          => $totalOrderAmount                        ,
            'totalAmountInRegularPricesFormattedNote'   => $totalAmountInRegularPricesFormattedNote ,
            'pathToImage'                               => 'storage/images/logo.png'                ,   // Путь к логотипу
            'orderAmountinRussian'                      => $orderAmountinRussian                    ,
            'pdfUrl'                                    => $pdfUrl                                  ,
            'invoiceUrl'                                => $invoiceUrl                              ,
            'trackUrl'                                  => $trackUrl
        ];

        return $data;
    }
}