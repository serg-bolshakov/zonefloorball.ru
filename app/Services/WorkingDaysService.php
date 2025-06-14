<?php
    // app/Services/WorkingDaysService.php - Сервис для расчёта рабочих дней
    namespace App\Services;

    use Carbon\Carbon;
    use Carbon\CarbonInterface;

    class WorkingDaysService
    {
        public static function addWorkingDays(Carbon $date, int $days): Carbon
        {
            return $date->addWeekdays($days);
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
    }