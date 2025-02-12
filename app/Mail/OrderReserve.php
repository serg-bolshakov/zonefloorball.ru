<?php
namespace App\Mail;

use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\Seller;

use App\Traits\OrderHelperTrait;
use App\Traits\NumberToRussianTrait;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

use Illuminate\Mail\Mailables\Address;          // 28.12.2024 https://github.com/russsiq/laravel-docs-ru/blob/9.x/docs/mail.md#configuring-the-sender
use Barryvdh\DomPDF\Facade\Pdf;   

use Illuminate\Support\Facades\Crypt;           // Используем для шифрования номера счёта и использования зашифрованной строки в URL. Это сделает URL менее предсказуемым, но при этом сохранит возможность расшифровки.

class OrderReserve extends Mailable
{
    use Queueable, SerializesModels;
    use OrderHelperTrait;
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
            subject: 'Флорбол. Мой заказ № ' . $this->order->order_number,
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

        // Настройка dompdf
        $pdf = Pdf::loadHTML($content);
        $pdf->setOption('defaultFont', 'DejaVu Sans'); // Указываем шрифт
        $pdf->setOption('isHtml5ParserEnabled', true); // Включаем поддержку HTML5
        $pdf->setOption('isRemoteEnabled', true); // Разрешаем загрузку внешних ресурсов (например, изображений)

        return Pdf::loadHTML($content)->output();
    }

    public function buildPdfAndSave($relativePath)
    {
        // Подготавливаем данные
        $data = $this->prepareData();

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
        return [
            \Illuminate\Mail\Mailables\Attachment::fromData(fn () => $this->buildPdf(), 'zakaz.pdf')
                ->withMime('application/pdf'),
        ];
    }

    public function sanitizeOrderNumber($orderNumber)
    {
        // Заменяем недопустимые символы на подчёркивание
        return preg_replace('/[\/\- ]/', '_', $orderNumber);
    }

    public function encryptOrderNumber($orderNumber)
    {
        // return Crypt::encryptString($orderNumber);
        return substr(md5($orderNumber . uniqid()), 0, 8); // первые 8 символов хеша
    }

    public function decryptOrderNumber($encryptedOrderNumber)
    {
        return Crypt::decryptString($encryptedOrderNumber);
    }
    
    protected function prepareData()
    {
        $orderRecipient = $contactTelNum = $transport = $dataAboutGoodsForMailBody = $address = '';

        $orderWithTansport = Order::with(['transport'])->where('id', $this->order->id)->first();
        if(!empty($orderWithTansport['transport']->delivery_way_view)) {
            $transport = $orderWithTansport['transport']->delivery_way_view;
        }
        
        $orderDate = date('d.m.Y', $this->order->order_date);
        
        $buyerName = $this->buyer->pers_surname . ' ' . $this->buyer->name;
        $buyerTel = $this->buyer->pers_tel;

        $productsArr = $this->getProductsArrayFromQuerySrting($this->order->order_content);
        $i = 1;

        $totalAmount = $totalDiscount = $totalAmountInRegularPrices = $totalOrderAmountNotFormatted = 0;
        
        foreach($productsArr as $product) {
            $prodInfo = Product::find($product[0]);           // С помощью специального метода find можно получить запись по ее id
            $productArticle = $prodInfo->article;
            $productName = $prodInfo->title;
            $productPrice = number_format((float)$product[2], 0,",", " ");
            $productPriceRegular = number_format((float)$product[5], 0,",", " ");
            $productAmount = (float)$product[1] * (float)$product[2];
            $productAmountFormatted = number_format((float)$productAmount, 0,",", " ");
            // если цена идёт со скидкой
            if($product[2] < $product[5]) {
                $productDiscount = number_format((float)$product[4], 0,",", " ");
                $dataAboutGoodsForMailBody .= '<tr><td style="text-align: center;">' . $i . '</td><td>' . $productArticle . '</td><td>' . $productName . '</td><td style="text-align: center;">' . $product[1] . '
                &nbsp;шт.</td><td style="text-align: right;">' . $productPrice . '</sup></td><td style="text-align: right;">' . $productAmountFormatted . 
                '</td><td style="text-align: right;"><font color="red">' . $productDiscount . '&nbsp;<sup>&#8381;</sup></font></td></tr>';
                $i++;
                $totalDiscount += +$product[4];
            } else {
                $dataAboutGoodsForMailBody .= '<tr><td style="text-align: center;">' . $i . '</td><td>' . $productArticle . '</td><td>' . $productName . '</td><td style="text-align: center;">' . $product[1] . '
                &nbsp;шт.</td><td style="text-align: right;">' . $productPrice . '</td><td style="text-align: center;">' . $productAmountFormatted . '</td><td> --- </td></tr>';
                $i++;
            }

            $totalAmount += $productAmount;
            $totalAmountInRegularPrices += $product[1] * $product[5]; 
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
        // dd($pdfUrl);
        $data = [
            'orderNum'                  => $this->order->order_number           ,
            'orderDate'                 => $orderDate                           ,
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
            'totalAmountInRegularPricesFormattedNote' => $totalAmountInRegularPricesFormattedNote,
            'pathToImage' => 'storage/images/logo.png', // Путь к логотипу
            'orderAmountinRussian'      => $orderAmountinRussian                ,
            'pdfUrl' => $pdfUrl,
        ];

        return $data;
    }
}