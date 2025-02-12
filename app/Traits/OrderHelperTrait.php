<?php

namespace App\Traits;

trait OrderHelperTrait {
    
    /* 
        Функция "очищает" строку контента заказа, превращая её в двухмерный массив, который потом мы использем в разных целях (отрпавка почты, логирование применённых ссылок)
    */

    public function getProductsArrayFromQuerySrting($items) {
        // Убираем первый символ '&' и разбиваем строку на отдельные параметры
        $params = explode('&', substr($items, 1));

        // Создаем массив для хранения результатов
        $productsArr = [];

        // Группируем параметры по 6 элементов - этот вариант, если бы нам ключи нужны были
        /*
            foreach (array_chunk($params, 6) as $chunk) {
                $product = [];
                foreach ($chunk as $param) {
                    list($key, $value) = explode('=', $param);
                    $product[$key] = $value;
                }
                $productsArr[] = $product;
            }
        */
        
        // Ключи нам не нужны - мы их знаем, проэтому просто: Группируем параметры по 6 элементов
        foreach (array_chunk($params, 6) as $chunk) {
            $product = [];
            foreach ($chunk as $param) {
                // Разделяем параметр на ключ и значение, берем только значение
                list(, $value) = explode('=', $param);
                $product[] = $value;
            }
            $productsArr[] = $product;
        }

        return $productsArr;
    }
}