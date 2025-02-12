<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ru" lang="ru">
<head>
<title>{{ config('app.name') }}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

<style>
body  { margin: 0 0 0 0; padding: 10px 10px 10px 10px; background: #ffffff; color: #000000; font-size: 14px; font-family: Arial, Helvetica, sans-serif; line-height: 18px; } 
a     { color: #003399; text-decoration: underline; font-size: 14px; font-family: Arial, Helvetica, sans-serif; line-height: 18px; } 
p     { margin: 0 0 20px 0; padding: 0 0 0 0; color: #000000; font-size: 14px; font-family: Arial, Helvetica, sans-serif; line-height: 18px; } 
ul    { margin: 0 0 20px 20px; padding: 0 0 0 0; color: #000000; font-size: 14px; font-family: Arial, Helvetica, sans-serif; line-height: 18px; } 
ol    { margin: 0 0 20px 20px; padding: 0 0 0 0; color: #000000; font-size: 14px; font-family: Arial, Helvetica, sans-serif; line-height: 18px; } 
table { margin: 0 0 20px 0; border: 1px solid #dddddd; border-collapse: collapse; }
th    { padding: 10px; border: 1px solid #dddddd; vertical-align: middle; background-color: #eeeeee; color: #000000; font-size: 14px; font-family: Arial, Helvetica, sans-serif; line-height: 18px; }
td    { padding: 10px; border: 1px solid #dddddd; vertical-align: middle; background-color: #ffffff; color: #000000; font-size: 14px; font-family: Arial, Helvetica, sans-serif; line-height: 18px; white-space: nowrap;} 
h1    { margin: 0 0 20px 0; padding: 0 0 0 0; color: #000000; font-size: 22px; font-family: Arial, Helvetica, sans-serif; line-height: 26px; font-weight: bold; } 
h2    { margin: 0 0 20px 0; padding: 0 0 0 0; color: #000000; font-size: 20px; font-family: Arial, Helvetica, sans-serif; line-height: 24px; font-weight: bold; } 
h3    { margin: 0 0 20px 0; padding: 0 0 0 0; color: #000000; font-size: 18px; font-family: Arial, Helvetica, sans-serif; line-height: 22px; font-weight: bold; } 
h4    { margin: 0 0 20px 0; padding: 0 0 0 0; color: #000000; font-size: 16px; font-family: Arial, Helvetica, sans-serif; line-height: 20px; font-weight: bold; } 
hr    { height: 1px; border: none; color: #dddddd; background: #dddddd; margin: 0 0 20px 0; }
</style>
</head>

<body>
<h1>Здравствуйте, получен новый заказ!</h1>
<p>ему присвоен номер <strong>{{ $orderNum }}</strong>.</p>
<ul>
<li><strong>Контактное лицо: </strong>{{ $orderRecipient }}</li>
<li><strong>Телефон: </strong>{{ $contactTelNum }}</li>
<li><strong>Способ доставки: </strong>{{ $transport }}</li>
<li><strong>Адрес доставки: </strong>{{ $address }}</li>
</ul>
<h2>Данные о товарах:</h2>
<table>
<thead>
<tr>
<th>№</th>
<th>Арт.</th>
<th>Наименование товара</th>
<th>Кол-во</th>
<th>Цена</th>
<th>Сумма</th>
</tr>
</thead>
<tbody>{!! $dataAboutGoodsForMailBody !!}</tbody>
</table>
<h4>Всего товаров на сумму: {{ $productAmount }}&nbsp;<sup>&#8381;</sup></h4>
<h4>Стоимость доставки заказа: {{ $deliveryCost }}&nbsp;<sup>&#8381;</sup></h4>
<hr>
<h3>ИТОГО стоимость заказа: {{ $totalOrderAmount }}&nbsp;<sup>&#8381;</sup></h3>
<hr>
<p>
С уважением, интернет-магазин флорбольной экипировки
<br><a href="https://unihoczone.ru">UnihocZoneRussia</a>
</p>

</body>
</html>
