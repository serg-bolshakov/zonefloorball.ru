// resources/js/Utils/dateFormatter.ts

export const dateRu = (dateString: string | null | undefined, showTime: boolean = false): string => {
    if (!dateString) return '-';
    
    const timestamp = Date.parse(dateString);
    if (isNaN(timestamp)) return '-';

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
    const month = months[date.getMonth() + 1];
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