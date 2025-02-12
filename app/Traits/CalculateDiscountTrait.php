<?php

namespace App\Traits;
use Illuminate\Support\Facades\DB;  // подключаем фасад DB - Построитель запросов позволяет отправлять запросы к базе, используя PHP команды
use App\Models\Discount;

trait CalculateDiscountTrait {

    public function calculateDiscount($orderTotal, $clientRankId, $items) {
        $discounts = [];
    
        // Скидка на общую стоимость заказа
        // Проверяем, есть ли скидки с типом order_total, где min_order_amount меньше или равна сумме заказа.
        // Если такие скидки есть, выбираем максимальную из них.
        $orderDiscount = Discount::where('discount_type', 'order_total')
            ->where('min_order_amount', '<=', $orderTotal)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('start_date')->orWhere('start_date', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('end_date')->orWhere('end_date', '>=', now());
            })
            ->max('value');
    
        if ($orderDiscount) {
            $discounts[] = ['type' => 'order_total', 'value' => $orderDiscount];
        }

        /* Скидка на общую стоимость заказа: sql
            SELECT MAX(value) AS discount
            FROM discounts
            WHERE discount_type = 'order_total'
            AND min_order_amount <= :order_total
            AND (start_date IS NULL OR start_date <= NOW())
            AND (end_date IS NULL OR end_date >= NOW())
            AND is_active = TRUE;

            Проверяем, есть ли скидки с типом order_total, где min_order_amount меньше или равна сумме заказа.
            Если такие скидки есть, выбираем максимальную из них.
        */
    
        // Скидка в зависимости от ранга пользователя
        // Проверяем, есть ли скидки с типом client_rank, где client_rank_id соответствует рангу пользователя.
        // Если такие скидки есть, применяем их.
        $rankDiscount = Discount::where('discount_type', 'client_rank')
            ->where('client_rank_id', $clientRankId)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('start_date')->orWhere('start_date', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('end_date')->orWhere('end_date', '>=', now());
            })
            ->first();
    
        if ($rankDiscount) {
            $discounts[] = ['type' => 'client_rank', 'value' => $rankDiscount->value];
        }

        /* Скидка в зависимости от ранга пользователя: sql
            SELECT value AS discount
            FROM discounts
            WHERE discount_type = 'client_rank'
            AND client_rank_id = :client_rank_id
            AND (start_date IS NULL OR start_date <= NOW())
            AND (end_date IS NULL OR end_date >= NOW())
            AND is_active = TRUE;

            Проверяем, есть ли скидки с типом client_rank, где client_rank_id соответствует рангу пользователя.
            Если такие скидки есть, применяем их.
        */
    
        // Скидка на категорию товаров
        // Для каждого товара в заказе проверяем, есть ли скидки с типом category, где category_id соответствует категории товара.
        // Если такие скидки есть, применяем их к каждому товару.
        $categoryDiscounts = [];
        foreach ($items as $item) {
            $categoryDiscount = Discount::where('discount_type', 'category')
                ->where('category_id', $item->category_id)
                ->where('is_active', true)
                ->where(function ($query) {
                    $query->whereNull('start_date')->orWhere('start_date', '<=', now());
                })
                ->where(function ($query) {
                    $query->whereNull('end_date')->orWhere('end_date', '>=', now());
                })
                ->first();
    
            if ($categoryDiscount) {
                $categoryDiscounts[] = ['type' => 'category', 'value' => $categoryDiscount->value, 'item_id' => $item->id];
            }
        }

        /* Скидка на категорию товаров: sql
            SELECT value AS discount
            FROM discounts
            WHERE discount_type = 'category'
            AND category_id = :category_id
            AND (start_date IS NULL OR start_date <= NOW())
            AND (end_date IS NULL OR end_date >= NOW())
            AND is_active = TRUE;
        */

        return [
            'order_discount' => $discounts,
            'category_discounts' => $categoryDiscounts,
        ];
    }

    public function getRankDiscount($clientRankId)
    {

    //     return Discount::where(function ($query) {
    //         $query->where('target_type', 'client_rank')
    //         ->where('target_id', $clientRankId);
    //     })
    //     ->where('is_active', true)
    //     ->get();
    
            return Discount::where('target_type', 'client_rank')
            ->where('client_rank_id', $clientRankId)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('start_date')->orWhere('start_date', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('end_date')->orWhere('end_date', '>=', now());
            })
            ->first();
    }
}

/*
Вот несколько дополнительных советовмыслей, которые могут помочь в процессе разработки:

Тестирование скидок:
    Напишите юнит-тесты для проверки корректности применения скидок. Это поможет избежать ошибок при изменении логики.
    Проверьте edge cases: например, что будет, если скидки на категорию и на общую сумму заказа применяются одновременно.

Админка для управления скидками:
    Создайте удобный интерфейс в админке для добавления, редактирования и удаления скидок. Это упростит управление системой скидок.
    Добавьте возможность массового применения скидок (например, на все товары определённой категории).

Логирование и аналитика:
    Добавьте логирование применённых скидок. Это поможет анализировать, какие скидки наиболее популярны и эффективны.
    Можно также добавить статистику по использованию скидок (например, сколько раз была применена каждая скидка).

Гибкость системы:
    Если в будущем потребуется добавить новые типы скидок (например, скидки на бренды или сезонные акции), структура таблицы discounts уже будет готова к расширению.
    Производительность:

    Если количество скидок станет большим, оптимизируйте запросы к базе данных. Например, можно кэшировать скидки для часто запрашиваемых категорий или рангов пользователей.
*/

/*4. Групповые скидки
    Если вы хотите делать скидки на группы товаров (например, "купи 3 товара из категории X и получи скидку 10%"), можно добавить поддержку таких условий. 
    Для этого потребуется отдельная таблица для хранения условий групповых скидок: group_discounts
*/

/*5. Кэширование скидок
    Чтобы не нагружать базу данных при каждом запросе, можно кэшировать скидки. Например:
        Кэшировать скидки для каждой категории товаров.
        Кэшировать скидки для каждого ранга пользователя.
    В Laravel это можно сделать с помощью встроенного кэширования:

    php
    $discounts = Cache::remember('category_discounts_' . $categoryId, 3600, function () use ($categoryId) {
        return Discount::where('target_type', 'category')
            ->where('target_id', $categoryId)
            ->where('is_active', true)
            ->get();
    });

*/

/*6. Логирование применённых скидок
    Чтобы отслеживать, какие скидки были применены к заказам, можно добавить таблицу applied_discounts:

    CREATE TABLE applied_discounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    discount_id INT NOT NULL,
    applied_value DECIMAL(10, 2) NOT NULL, -- значение скидки (процент или сумма)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (discount_id) REFERENCES discounts(id)
    );
    Это поможет анализировать эффективность скидок и понимать, какие из них действительно работают.
*/

/*8. Логика в Laravel
    В Laravel можно вынести всю логику применения скидок в отдельный сервисный класс, например DiscountService. Это сделает код более читаемым и удобным для тестирования.
    Пример:
    class DiscountService
    {
        public function applyDiscounts(Order $order, Client $client, array $items)
        {
            $discounts = $this->getApplicableDiscounts($order->total, $client->rank_id, $items);

            foreach ($discounts as $discount) {
                $this->applyDiscount($order, $discount);
            }
        }

        protected function getApplicableDiscounts($orderTotal, $clientRankId, $items)
        {
            // Логика получения скидок
        }

        protected function applyDiscount(Order $order, Discount $discount)
        {
            // Логика применения скидки
        }
    }
*/