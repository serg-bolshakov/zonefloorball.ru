<?php
    // app/Services/WorkingDaysService.php - Сервис для расчёта рабочих дней
    namespace App\Services;

    use Carbon\Carbon;
    use Carbon\CarbonInterface;

    class WorkingDaysService
    {

        private static array $holidays = [
            '01-01', // Новый год
            '08-03', // 8 марта
            // ... другие праздники
        ];

        public static function addWorkingDays(Carbon $date, int $days): Carbon
        {
            $count = 0;
            while ($count < $days) {
                $date = $date->addDay();
                if ($date->isWeekday() && !self::isHoliday($date)) {
                    $count++;
                }
            }
            return $date;
        }

        public static function getExpirationDate(int $days = 3): Carbon
        {
            $now = now();
            
            // Если сегодня пятница, добавляем выходные
            if ($now->isFriday()) {
                $now->addDays(2);
            }
            // Если суббота/воскресенье - стартуем с понедельника
            elseif ($now->isWeekend()) {
                $now->next(CarbonInterface::MONDAY);
            }

            return self::addWorkingDays($now, $days);
        }

        private static function isHoliday(Carbon $date): bool {
            return in_array($date->format('d-m'), self::$holidays);
        }

        // НОВЫЙ метод для ВЫЧИТАНИЯ рабочих дней
        public static function subtractWorkingDays(Carbon $date, int $days): Carbon {
            $count = 0;
            while ($count < $days) {
                $date = $date->subDay();  // subDay() вместо addDay()
                if ($date->isWeekday() && !self::isHoliday($date)) {
                    $count++;
                }
            }
            return $date;
        }

        // НОВЫЙ метод для даты отсечки
        public static function getCutoffDate(int $daysBack = 3): Carbon {
            return self::subtractWorkingDays(now(), $daysBack);
        }
    }