<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ru" lang="ru">
<head>
<title>{{ config('app.name') }}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

<style>
body  { margin: 0 0 0 0; padding: 10px 10px 10px 10px; background: #ffffff; color: #000000; font-size: 14px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 18px; } 
a     { color: #003399; text-decoration: underline; font-size: 14px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 18px; } 
p     { margin: 0 0 20px 0; padding: 0 0 0 0; color: #000000; font-size: 14px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 18px; } 
ul    { margin: 0 0 20px 20px; padding: 0 0 0 0; color: #000000; font-size: 14px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 18px; } 
ol    { margin: 0 0 20px 20px; padding: 0 0 0 0; color: #000000; font-size: 14px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 18px; } 
table { width: 100%; margin: 0 auto 20px auto; border: none; border-collapse: collapse; }
th    { padding: 10px; border: 1px solid #dddddd; vertical-align: middle; background-color: #eeeeee; color: #000000; font-size: 14px; font-family: DejaVu Sans, Arial, DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 18px; }
td    { word-wrap: break-word; white-space: normal; padding: 5px; border: 1px solid #dddddd; vertical-align: middle; background-color: #ffffff; color: #000000; font-size: 14px; font-family: DejaVu Sans, Arial, DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 18px; } 
h1    { margin: 0 0 20px 0; padding: 0 0 0 0; color: #000000; font-size: 22px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 26px; font-weight: bold; } 
h2    { margin: 0 0 20px 0; padding: 0 0 0 0; color: #000000; font-size: 20px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 24px; font-weight: bold; } 
h3    { margin: 0 0 20px 0; padding: 0 0 0 0; color: #000000; font-size: 18px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 22px; font-weight: bold; } 
h4    { margin: 0 0 20px 0; padding: 0 0 0 0; color: #000000; font-size: 16px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 20px; font-weight: bold; } 
h5    { margin: 0 0 20px 0; padding: 0 0 0 0; color: #000000; font-size: 14px; font-family: DejaVu Sans, Arial, Helvetica, sans-serif; line-height: 20px; font-weight: bold; }
hr    { height: 1px; border: none; color: #dddddd; background: #dddddd; margin: 0 0 20px 0; }
</style>
</head>

<body>                    
{{-- <img src="{{ $message->embed('storage/images/logo.png') }}" alt="Логотип компании" style="max-width: 56px; float: right;"> 
<img src="data:image/png;base64,{{ base64_encode(file_get_contents('storage/images/logo.png')) }}" alt="Логотип компании" style="max-width: 56px; float: right;">--}}
@if(isset($message))
<!-- Для писем -->
<img src="{{ $message->embed('storage/images/logo.png') }}" alt="Логотип компании" style="max-width: 56px; float: right;">
@else
<!-- Для PDF -->
<img src="{{ $pathToImage }}" alt="Логотип компании" style="max-width: 56px; float: right;">
@endif
<p>Счёт действителен для оплаты в течение 3-х банковских дней.</p>
<p><strong>Образец заполнения платежного поручения</strong></p>
<ul>
<li><strong>Банк получателя: </strong>{{ $recepientBankName }}</li>
<li><strong>БИК: </strong>{{ $recepientBankBIC }}</li>
<li><strong>Сч. No: </strong>{{ $sellerBankAccount }}</li>
</ul>
<ul>
<p><strong>Получатель</strong>
<li><strong>ИНН: </strong>{{ $sellerINN }}</li>
<li><strong>КПП: </strong>{{ $sellerKPP }}</li>
<li><strong>Получатель: </strong>{{ $sellerName }}</li>
<li><strong>Сч. No: </strong>{{ $sellerBankAccount }}</li>
</ul>
</p>
<h1>Счёт на оплату предварительного заказа № P{{ $orderNum }} от {{ $orderDate }}</h1>
<hr>
<h4>Поставщик:</h4>
<p>ИНН {{ $sellerINN }} КПП {{ $sellerKPP }} {{ $sellerName }}, {{ $sellerAddress }}, тел. {{ $sellerTel }}</p>
<h4>Покупатель:</h4>
<p>ИНН {{ $buyerINN }} КПП {{ $buyerKPP }} {{ $buyerName }}, тел. {{ $buyerTel }}</p>
<table>
<thead>
<tr>
<th>№</th>
<th>Арт.</th>
<th>Товара</th>
<th>Кол-во</th>
<th>Цена</th>
<th>Сумма</th>
<th>Скидка</th>
</tr>
</thead>
<tbody>{!! $dataAboutGoodsForMailBody !!}
<tr><td colspan="5" style="text-align: right; border: none !important;"><strong>Стоимость доставки/получения заказа:</strong></td><td style="text-align: right;">{!! $deliveryCost !!}</td><td></td></tr> 
<tr><td colspan="5" style="text-align: right; border: none !important;"><strong>Итого:</strong></td><td style="text-align: right;">{!! $totalOrderAmount !!}</td>
<td style="text-align: right;">
    @if($totalDiscount != 0)
        <font color="red">{!! $totalDiscount !!}&nbsp;<sup>&#8381;</sup></font>
    @else
        &nbsp;<!-- Неразрывный пробел, если нужно сохранить ячейку непустой -->
    @endif
</td></tr>
<tr><td colspan="5" style="text-align: right; border: none !important;"><strong>{!! $isSellerPayVATNote !!}</strong></td><td style="text-align: right; border: none !important;"></td><td style="text-align: right; border: none !important;"></td></tr>
{{-- <tr><td colspan="5" style="text-align: right; border: none !important;"><strong>Всего к оплате</strong></td><td style="text-align: right;">{!! $totalOrderAmount !!}</td><td></td></tr> --}}
</tbody>
</table>
{!! $orderAmountinRussian !!}
{!! $discountTotalLine !!}
{{-- закомментировал пока <h4>Всего товаров на сумму: {{ $productAmount }}&nbsp;<sup>&#8381;</sup> {!! $totalAmountInRegularPricesFormattedNote !!}</h4>
{!! $discountTotalLine !!} --}}
<uL>
<li><strong>Выбранный способ доставки</strong>: {{ $transport }}</li>
{!! $deliveryCostLine !!}
<li><strong>Адрес доставки/получения заказа</strong>:&nbsp;{{ $deliveryAddress }}</li>
</ul>
<hr>
{{-- закомментировал пока <h3>ИТОГО стоимость заказа: {{ $totalOrderAmount }}&nbsp;<sup>&#8381;</sup></h3>
{!! $isSellerPayVATNote !!}
{!! $orderAmountinRussian !!}
<hr> --}}
@if($trackUrl)
<p>Товары, указанные в счёте, зарезервированы для вас на складе по указанным в счёте ценам. Благодарим за обращение в нашу компанию. Надеемся на взаимовыгодное сотрудничество.</p>
<p>Отслеживание заказа: <a href="{{ $trackUrl }}">Статус заказа</a></p>
<hr>
@endif
<p>С уважением, интернет-магазин флорбольной экипировки<br><a href="https://zonefloorball.ru">ZoneFloorball.RU</a></p>
</body>
</html>
