<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

use Illuminate\Mail\Mailables\Address;          // 28.12.2024 https://github.com/russsiq/laravel-docs-ru/blob/9.x/docs/mail.md#configuring-the-sender

class NewOrder1 extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Экземпляр заказа.
     *
     * @var \App\Models\Order
     */
    protected $order;

    /**
     * Создать экземпляр нового сообщения.
     *
     * @param  \App\Models\Order  $order
     * @return void
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Новый заказ!',
        );
    }

    
    /**
     * Получить определение содержимого сообщения.
     *
     * @return \Illuminate\Mail\Mailables\Content
     */
    public function content()
    {
        $orderRecipient = $contactTelNum = $transport = $dataAboutGoodsForMailBody = $address = '';

        $orderWithTansport = Order::with(['transport'])->where('id', $this->order->id)->first();
        if(!empty($orderWithTansport['transport']->delivery_way_view)) {
            $transport = $orderWithTansport['transport']->delivery_way_view;
        }

        parse_str($this->order->order_content, $orderContentArr);       // Функция parse_str разбивает строку с GET параметрами в массив
        $productsArr = array_chunk($orderContentArr, 3);                // Функция array_chunk разбивает одномерный массив в двухмерный. true - здесь лишнее, нам ключи не нужны - мы их знаем! (id, quantity, price)...
        $i = 1;

        $totalAmount = 0;
        
        foreach($productsArr as $product) {
            $prodInfo = Product::find($product[0]);           // С помощью специального метода find можно получить запись по ее id
            $productArticle = $prodInfo->article;
            $productName = $prodInfo->title;
            $productPrice = number_format((float)$product[2], 0,",", " ");
            $productAmount = (float)$product[1] * (float)$product[2];
            $productAmountFormatted = number_format((float)$productAmount, 0,",", " ");

            $dataAboutGoodsForMailBody .= '<tr><td style="text-align: center;">' . $i . '</td><td>' . $productArticle . '</td><td>' . $productName . '</td><td style="text-align: center;">' . $product[1] . '
            &nbsp;шт.</td><td style="text-align: right;">' . $productPrice . '&nbsp;<sup>&#8381;</sup></td><td style="text-align: right;">' . $productAmountFormatted . '&nbsp;<sup>&#8381;</sup></td></tr>';
            $i++;

            $totalAmount += $productAmount;
        }

        $productAmountFormatted = number_format((float)$totalAmount, 0,",", " ");
        $deliveryCost = number_format((float)($this->order->order_delivery_cost), 0,",", " ");
        $totalOrderAmount = number_format((float)($totalAmount + $this->order->order_delivery_cost), 0,",", " ");

        // если заказ оформлен от физического лица, то в почту для нотификации нового заказа должны вывести его имя и фамилию:
        if($this->order->order_client_type_id == '1')        {
            $orderRecipient = $this->order->order_recipient_names   ;
            $contactTelNum  = $this->order->order_recipient_tel     ;
        } elseif ($this->order->order_client_type_id == '2') {
            //
        }

        return new Content(
            view: 'emails.orders.new',
            with: [
                'orderNum'                  => $this->order->order_number          ,
                'orderRecipient'            => $orderRecipient                     ,
                'contactTelNum'             => $contactTelNum                      ,
                'transport'                 => $transport                          ,
                'address'                   => $this->order->order_delivery_address,
                'dataAboutGoodsForMailBody' => $dataAboutGoodsForMailBody          ,
                'productAmount'             => $productAmountFormatted             ,
                'deliveryCost'              => $deliveryCost                       ,
                'totalOrderAmount'          => $totalOrderAmount                   ,
            ],
        );
    }
    

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
