<!DOCTYPE html>
<html lang="ru">
<head>
    <title>Политика конфиденциальности | {{ config('app.name') }}</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <link type="image/png" sizes="16x16" 	rel="icon" href="{{ asset('favicons/favicon-16x16.png')   }}">
    <link type="image/png" sizes="32x32" 	rel="icon" href="{{ asset('favicons/favicon-32x32.png')   }}">
    <link type="image/png" sizes="96x96" 	rel="icon" href="{{ asset('favicons/favicon--96x96.png')  }}">
    <link type="image/png" sizes="120x120" 	rel="icon" href="{{ asset('favicons/favicon-120x120.png') }}">
    <link type="image/png" sizes="256x256" 	rel="icon" href="{{ asset('favicons/favicon-256x256.png') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: 'Noto Sans', sans-serif; /* sans serif, от фр. sans — «без» и англ. serif — «засечка» - без засечек */
            font-size: 14px; 
            line-height: 1.5; 
            color: #000000; 
            max-width: 800px;
            margin: 0 auto;
        }
        h1 { 
            font-size: 22px; 
            line-height: 1.3; 
            margin-bottom: 20px;
            color: #003399;
            text-align: center;
        }
        h2 {
            font-size: 18px;
            margin: 25px 0 15px;
            color: #003399;
        }
        p, ul, ol {
            margin: 0 0 15px 0;
        }
        ul, ol {
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        a {
            color: #003399;
            text-decoration: underline;
        }
        hr {
            height: 1px;
            background: #dddddd;
            border: none;
            margin: 20px 0;
        }
        .last-update {
            font-style: italic;
            color: #666;
            text-align: right;
        }
    </style>
</head>
<body>
    <h1>Политика конфиденциальности интернет-магазина {{ config('app.name') }}</h1>
    
    <p class="last-update">Дата последнего обновления: 31.07.2025</p>

    <h2>1. Общие положения</h2>
    <p>1.1. Настоящая Политика конфиденциальности регулирует порядок обработки персональных данных пользователей сайта {{ config('app.url') }} (далее — «Сайт»).</p>
    <p>1.2. Используя Сайт, вы соглашаетесь с условиями данной Политики.</p>

    <h2>2. Какие данные мы собираем</h2>
    <p>2.1. Для физических лиц:</p>
    <ul>
        <li>Фамилию, Имя, контактный телефон, email;</li>
        <li>Адрес доставки;</li>
    </ul>

    <p>2.2. Для юридических лиц:</p>
    <ul>
        <li>Название организации, ИНН, КПП, юридический адрес;</li>
        <li>Банковские реквизиты;</li>
        <li>Контактные данные представителя.</li>
    </ul>

    <h2>3. Как мы используем данные</h2>
    <p>3.1. Данные используются исключительно для:</p>
    <ul>
        <li>Оформления и выполнения заказов;</li>
        <li>Связи с клиентом;</li>
        <li>Улучшения качества услуг.</li>
    </ul>

    <h2>4. Защита данных</h2>
    <p>4.1. Мы применяем меры защиты, включая:</p>
    <ul>
        <li>SSL-шифрование;</li>
        <li>Ограниченный доступ к данным;</li>
        <li>Регулярные проверки системы.</li>
    </ul>

    <h2>5. Передача данных третьим лицам</h2>
    <p>5.1. Данные могут передаваться только:</p>
    <ul>
        <li>Платёжным системам (Robokassa);</li>
        <li>Службам доставки;</li>
        <li>По требованию закона.</li>
    </ul>

    <h2>6. Права пользователей</h2>
    <p>6.1. Вы можете:</p>
    <ul>
        <li>Запросить доступ к своим данным;</li>
        <li>Потребовать исправления или удаления данных;</li>
        <li>Отозвать согласие на обработку.</li>
    </ul>

    <h2>7. Контакты</h2>
    <p>По вопросам персональных данных обращайтесь:</p>
    <ul>
        <li>Email: admin@zonefloorball.ru</li>
        <!-- <li>Телефон: +7 (XXX) XXX-XX-XX</li> -->
    </ul>

    <hr>
    <p><strong>Примечание:</strong> Данный документ является образцом. Для соответствия законодательству РФ рекомендуется консультация с юристом.</p>
</body>
</html>