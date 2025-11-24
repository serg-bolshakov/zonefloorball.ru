<?php
// app/Mail/OrderInvoice.php

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

class OrderInvoice extends Mailable
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
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Флорбол. Счёт на оплату № ' . $this->order->order_number,
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
            view: 'emails.orders.invoice',
            with: $data,
        );
    }
    
    public function buildPdf()
    {
        $content = view('emails.orders.invoice', $this->content()->with)->render();

        // Настройка dompdf
        $pdf = Pdf::loadHTML($content);
        $pdf->setOption('defaultFont', 'DejaVu Sans'); // Указываем шрифт
        $pdf->setOption('isHtml5ParserEnabled', true); // Включаем поддержку HTML5
        $pdf->setOption('isRemoteEnabled', true); // Разрешаем загрузку внешних ресурсов (например, изображений)

        return Pdf::loadHTML($content)->output();
    }

    public function buildPdfAndSave($relativePath)
    {
        // \Log::info('Starting PDF generation...');

        // Подготавливаем данные
        $data = $this->prepareData();
        // \Log::info('Data prepared:', $data);

        // Рендерим шаблон
        // \Log::info('Rendering template...');
        $content = view('emails.orders.invoice', $data)->render();
        // \Log::info('Template rendered.');

        // Генерация PDF
        // \Log::info('Loading HTML into PDF...');
        $pdf = Pdf::loadHTML($content);
        $pdf->setOption('defaultFont', 'DejaVu Sans'); // Указываем шрифт
        $pdf->setOption('isHtml5ParserEnabled', true); // Включаем поддержку HTML5
        $pdf->setOption('isRemoteEnabled', true); // Разрешаем загрузку внешних ресурсов (например, изображений)
        // \Log::info('PDF loaded.');

        // Полный путь для сохранения файла на сервере
        $fullPath = public_path($relativePath);
        
        // Сохраняем PDF
        // \Log::info('Saving PDF...');
        $pdf->save($fullPath);
        // \Log::info('PDF saved.');

        return;
    }

    public function attachments(): array
    {
        return [
            \Illuminate\Mail\Mailables\Attachment::fromData(fn () => $this->buildPdf(), 'invoice.pdf')
                ->withMime('application/pdf'),
        ];
    }

    public function sanitizeOrderNumber($orderNumber)
    {
        // Заменяем недопустимые символы на подчёркивание
        return preg_replace('/[\/\- ]/', '_', $orderNumber);
    }

    
    public function encryptOrderNumber($orderNumber) {
        return substr(md5($orderNumber . uniqid()), 0, 8); // первые 8 символов хеша
    }
    
    protected function prepareData()
    {
        $orderRecipient = $contactTelNum = $transport = $dataAboutGoodsForMailBody = $address = '';

        $orderWithTansport = Order::with(['transport'])->where('id', $this->order->id)->first();
        if(!empty($orderWithTansport['transport']->delivery_way_view)) {
            $transport = $orderWithTansport['transport']->delivery_way_view;
        }
        // dd($orderWithTansport);
        $seller = Seller::find($this->order->seller_id);
        $sellerName = $seller->name;
        $sellerINN = $seller->inn;
        $sellerKPP = $seller->kpp ?? '';
        $isSellerPayVAT = $seller->isPayVAT;
        $sellerBankAccount = $seller->current_account;
        $recepientBankName = $seller->bank_name;
        $recepientBankBIC = $seller->bank_bic;
        $recepientBankCorrAccount = $seller->banc_corr_num;
        $orderDate = is_numeric($this->order->order_date) 
            ? date('d.m.Y', $this->order->order_date)
            : date('d.m.Y', strtotime($this->order->order_date));
        $sellerAddress = $seller->address;
        $sellerTel = $seller->tel_nums;
        $buyerINN = $this->buyer->org_inn;
        $buyerKPP = $this->buyer->org_kpp ?? '';
        $buyerName = $this->buyer->name;
        $buyerTel = $this->buyer->org_tel;
        $isBuyerPayVAT = $this->buyer->is_taxes_pay;

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
            
            // если цена идёт со скидкой, нужно сделать две цены в графе "Цена" - сверху актуальная, снизу - перечёркнутую
            if($item->price < $item->regular_price) {
                $productDiscount = ($item->applied_discount ?? $item->regular_price - $item->price) * $item->quantity; // с проверкой на null applied_discount (это поле пока не заполняем пока, как раз и должно быть null) - пока значение рассчитываем
                $productDiscountFormatted = number_format((float)$productDiscount, 0,",", " ");
                $dataAboutGoodsForMailBody .= '<tr><td style="text-align: center;">' . $i . '</td><td style="text-align: center;">' . $productArticle . '</td><td>' . $productName . '</td><td style="text-align: center;">' . $item->quantity . '
                &nbsp;шт.</td><td style="text-align: right;">' . $productPrice . '</sup></td><td style="text-align: right;">' . $productAmountFormatted . 
                '</td><td style="text-align: right;"><font color="red">' . $productDiscountFormatted . '&nbsp;<sup>&#8381;</sup></font></td></tr>';
                $i++;
                $totalDiscount += +$productDiscount;
            } else {
                $dataAboutGoodsForMailBody .= '<tr><td style="text-align: center;">' . $i . '</td><td>' . $productArticle . '</td><td>' . $productName . '</td><td style="text-align: center;">' . $item->quantity . '
                &nbsp;шт.</td><td style="text-align: right;">' . $productPrice . '</td><td style="text-align: center;">' . $productAmountFormatted . '</td><td> --- </td></tr>';
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
            $discountTotalLine = '';
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

        if($isSellerPayVAT) {
            $isSellerPayVATNote = '<p>в том числе НДС (20%)</p>';
        } else {
            $isSellerPayVATNote = '<p>без налога (НДС)</p>';
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
        
        // Используем обновлённый order_url_semantic
        $pdfUrl = asset($this->order->order_url_semantic);      // asset(), ДОЛЖНА автоматически добавить домен и правильный путь.
        // Функция asset() генерирует полный URL на основе относительного пути. Например: Если order_url_semantic содержит storage/invoices/invoice_2_25_01_207_1b27f699.pdf, то asset($this->order->order_url_semantic) вернёт: http://ваш-домен/storage/invoices/invoice_2_25_01_207_1b27f699.pdf
        $invoiceUrl = asset('invoice/'  . $this->order->access_hash); 
        $trackUrl = asset('order/track/'. $this->order->access_hash); 

        $data = [
            'sellerName'                => $sellerName                          ,
            'sellerINN'                 => $sellerINN                           ,
            'sellerKPP'                 => $sellerKPP                           ,
            'sellerBankAccount'         => $sellerBankAccount                   ,
            'recepientBankName'         => $recepientBankName                   ,
            'recepientBankBIC'          => $recepientBankBIC                    ,
            'recepientBankCorrAccount'  => $recepientBankCorrAccount            ,
            'orderNum'                  => $this->order->order_number           ,
            'orderDate'                 => $orderDate                           ,
            'sellerAddress'             => $sellerAddress                       ,
            'sellerTel'                 => $sellerTel                           ,
            'buyerINN'                  => $buyerINN                            ,
            'buyerKPP'                  => $buyerKPP                            ,
            'buyerName'                 => $buyerName                           ,
            'buyerTel'                  => $buyerTel                            ,
            'transport'                 => $transport                           ,
            'deliveryAddress'           => $this->order->order_delivery_address ,
            'dataAboutGoodsForMailBody' => $dataAboutGoodsForMailBody           ,
            'productAmount'             => $productAmountFormatted              ,
            'totalDiscount'             => $totalDiscount                       ,
            'discountTotalLine'         => $discountTotalLine                   ,
            'deliveryCostLine'          => $deliveryCostLine                    ,
            'deliveryCost'              => $deliveryCost                        ,
            'totalOrderAmount'          => $totalOrderAmount                    ,
            'isSellerPayVATNote'        => $isSellerPayVATNote                  ,
            'totalAmountInRegularPricesFormattedNote' => $totalAmountInRegularPricesFormattedNote,
            'pathToImage'               => 'storage/images/logo.png'            ,                       // Путь к логотипу
            'orderAmountinRussian'      => $orderAmountinRussian                ,
            'pdfUrl'                    => $pdfUrl,
            'invoiceUrl'                => $invoiceUrl,
            'trackUrl'                  => $trackUrl
        ];
        // \Log::info('Data for template:', $data);

        return $data;
    }
}