// resources/js/Utils/dateFormatter.ts

import { MONTHS_GENITIVE } from "@/Constants/months";

/**
 * Конвертирует дату из формата 'DD.MM.YYYY HH:mm' в 'YYYY-MM-DDTHH:mm:SS',
 * чтобы Date.parse() смог её распознать.
 */
const convertToIsoFormat = (dateString: string): string => {
    if (!dateString) return '';
    
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('.');
    
    return `${year}-${month}-${day}T${timePart}:00`;
};



/**
 * Форматирует дату в читаемый вид ("13 июня 2025" или "Сегодня в 16:07").
 * Поддерживает форматы: ISO-8601 ('2025-06-13T16:07') и 'DD.MM.YYYY HH:mm'.
 */
export const dateRu = (dateString: string | null | undefined, showTime: boolean = false): string => {

    if (!dateString) return '-';

    console.log('dateFormatter', Date.parse(dateString));

    // Конвертируем дату, если она в формате 'DD.MM.YYYY HH:mm' - для отслеживания заказа мы принимаем строку вида: '13.06.2025 16:07'
    const isoDateString = dateString.includes('.') 
        ? convertToIsoFormat(dateString) 
        : dateString;

    
    const timestamp = Date.parse(isoDateString);
    if (isNaN(timestamp)) return 'Дата не определена';

    const date = new Date(timestamp);
    const now = new Date();

    // Проверяем, сегодня ли дата
    const isToday = 
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    if (isToday) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `Сегодня в ${hours}:${minutes}`;
    }

    // Месяцы в родительном падеже
    const months = [
        '', 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];

    const day = date.getDate();
    // const month = months[date.getMonth() + 1];       // Вынесли за пределы функции months в константы, чтобы массив не создавался при каждом вызове... проверяем...
    const month = MONTHS_GENITIVE[date.getMonth() + 1];
    const year = date.getFullYear();

    let result = `${day} ${month} ${year}`;
    if (showTime) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        result += ` в ${hours}:${minutes}`;
    }

    return result;
};


/*export const dateRu = (dateString: string, showTime: boolean = false): string => {
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const now = new Date();
    const options = { timeZone: 'Europe/Moscow' };

    const today = now.toLocaleString('ru-RU', options).split(',')[0];
    const targetDate = date.toLocaleString('ru-RU', options).split(',')[0];

    if (today === targetDate) {
    const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    return `Сегодня в ${time}`;
    } else {
        const monthNames = [
        '', 'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
        'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
        ];
        const day = date.getDate();
        const month = monthNames[date.getMonth() + 1];
        const year = date.getFullYear();
        
        let result = `${day} ${month} ${year}`;
        if (showTime) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        result += ` в ${hours}:${minutes}`;
        }
        return result;
    }
};*/

/** Это аналог моего PHP-трейта:
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
*/