<?php

namespace App\Traits;

use Illuminate\Support\Facades\DB;  // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды

trait ArrayTrait {
    
    /* Сортировка многомерного массива по значению одного ключа ('price_actual')
    *   - вариант первый – uasort(), сортирует массив, используя пользовательскую функцию для сравнения элементов и сохранением ключей - НЕ ПРОКАТИЛ!!!
    *   - вариант второй на основе функции array_multisort() - array_multisort — Сортирует несколько массивов или многомерные массивы:
    *   Вот так вызываем: $productsArr = array_multisort_value($productsArr, 'price_actual', SORT_ASC);
    */

    public function array_multisort_value() {
        $args = func_get_args();                        // Возвращает массив, который содержит список аргументов функции - Функция возвращает массив, в котором каждый элемент — копия соответствующего члена списка аргументов текущей пользовательской функции.
        // dump($args);                                 // 0 => array:22, 1 => 'price_actual', 2 => 4
        $data = array_shift($args);                     // array_shift — Извлекает первый элемент массива - в нашем случае - это массив товаров, который нужно отсортировать...
        foreach ($args as $n => $field) {
            if (is_string($field)) {
                $tmp = array();
                foreach ($data as $key => $row) {
                    $tmp[$key] = $row[$field];
                }
                $args[$n] = $tmp;
            }
        }
        $args[] = &$data;
        call_user_func_array('array_multisort', $args);
        return array_pop($args);
    }

}