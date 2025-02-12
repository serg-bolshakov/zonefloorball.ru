<?php

namespace App\Traits;

use Illuminate\Support\Facades\DB;  // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды

trait DateTrait {
    
    public function date_ru($data, $show_time = false) {
        
        $timestamp = strtotime($data);

        // На некоторых хостингах может быть не установлен часовой пояс, поэтому функция date() может работать некорректно. Задаём его (часовой пояс) следующим образом:
        date_default_timezone_set('Europe/Moscow');
        
        if (empty($timestamp)) {
            return '-';
        } else {
            $now   = explode(' ', date('Y n j H i'));
            $value = explode(' ', date('Y n j H i', $timestamp));
    
            if ($now[0] == $value[0] && $now[1] == $value[1] && $now[2] == $value[2]) {
                return 'Сегодня в ' . $value[3] . ':' . $value[4];
            } else {
                $month = array(
                    '', 'янв', 'фев', 'мар', 'апр', 'мая', 'июн', 
                    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
                );
                $out = $value[2] . ' ' . $month[$value[1]] . ' ' . $value[0];
                if ($show_time) {
                    $out .= ' в ' . $value[3] . ':' . $value[4];
                }
                return $out;
            }
        }
    }

}