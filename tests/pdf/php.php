<?php
require_once('tcpdf/tcpdf.php');

// Получаем данные из POST-запроса
$data = json_decode(file_get_contents('php://input'), true);

// Создаем новый PDF документ
$pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
$pdf->SetCreator(PDF_CREATOR);
$pdf->SetAuthor('Ваше имя');
$pdf->SetTitle('Документ');
$pdf->SetMargins(15, 15, 15);
$pdf->AddPage();

// Добавляем информацию о пользователе
$html = "<h1>Информация о пользователе</h1>";
$html .= "Имя: " . $data['username'] . "<br>";
$html .= "Адрес: " . $data['address'] . "<br>";
$html .= "Телефон: " . $data['phone'] . "<br>";
$html .= "Email: " . $data['email'] . "<br><br>";

// Добавляем таблицу товаров
$html .= "<h2>Товары</h2>";
$html .= "<table border=\"1\" cellpadding=\"5\"><tr><th>Наименование</th><th>Ед. изм.</th><th>Количество</th><th>Цена</th><th>Стоимость</th></tr>";

$totalQuantity = 0;
$totalCost = 0;

foreach ($data['products'] as $product) {
    $html .= "<tr>
                <td>{$product['name']}</td>
                <td>{$product['unit']}</td>
                <td>{$product['quantity']}</td>
                <td>{$product['price']}</td>
                <td>{$product['cost']}</td>
              </tr>";
    $totalQuantity += $product['quantity'];
    $totalCost += $product['cost'];
}

$html .= "</table>";
$html .= "<h3>Итого: Количество - {$totalQuantity}, Сумма - {$totalCost}</h3>";

// Выводим HTML
$pdf->writeHTML($html, true, false, true, false, '');

// Закрываем и выводим документ
$pdf->Output('document.pdf', 'D');
?>