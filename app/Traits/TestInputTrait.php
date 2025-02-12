<?php

namespace App\Traits;
use Illuminate\Support\Facades\DB;  // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды

trait TestInputTrait {

    // создаём функцию, которая будет убирать пробелы, символы табуляции... с помощью функции PHP trim()... 
    // удаление косой черты (\) из входных данных stripcslashes
    // htmlspecialchars - преобразует специальные символы в сущности html, заменит такие как < и > на &lt; и &gt; - предотвращает использование вредоносного кода, путём введения кода ХТМЛ или ЯваСкрипт в формах 
    // $name = mysqli_real_escape_string($connect, test_input($_POST['name']));  
      
    public function test_input($data) {
        $data = trim($data);
        $data = strip_tags($data);
        $data = htmlspecialchars($data);
        return $data;
      }

}