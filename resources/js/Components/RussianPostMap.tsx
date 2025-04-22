// resources/js/Components/RussianPostMap.tsx - Компонент для виджета Почты России
import { useEffect } from 'react';
import { useExternalScript } from '@/Hooks/useExternalScript';
import { toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
// import { Helmet } from "react-helmet";

declare global {                        // Объявление глобального интерфейса
  interface Window {                    // Что делает: Расширяет стандартный интерфейс Window
    ecomStartWidget?: (config: {        // добавляя в него опциональную (?) функцию ecomStartWidget.
      id: number;                       // Зачем: TypeScript будет "знать" об этой функции, 
      callbackFunction: Function;       // когда она появится в глобальной области видимости после загрузки скрипта.
      containerId: string;
    }) => void;
  }
}

interface RussianPostMapProps {
  onSelect: (data: any) => void;
}

const RussianPostMap = ({ onSelect }: RussianPostMapProps) => {

    const toastConfig = {
        position: "top-right" as const,
        autoClose: 1500, // Уведомление закроется через секунду-другую...
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        transition: Slide, // Используем Slide, Zoom, Flip, Bounce для этого тоста
    }

  // Загружаем скрипт виджета
  useExternalScript('https://widget.pochta.ru/map/widget/widget.js');
  // 1. Хук useExternalScript - динамически создаёт <script> тег и добавляет его в <body>.

  // 2. Добавляем Helmet для метаданных и fallback-загрузки - не заработало на хостинге - комментируем на память:
  /*  <Helmet>
    <script 
        src="https://widget.pochta.ru/map/widget/widget.js" 
        async 
        onError={() => console.error('Ошибка загрузки скрипта Почты России')}
    />
    </Helmet> */

  useEffect(() => {
    // Инициализируем виджет после загрузки скрипта
    const initWidget = () => {
      if (window.ecomStartWidget) {             // Проверяем, что функция действительно доступна.
        window.ecomStartWidget({                // Вызываем её с параметрами:
          id: 50063,                            // Идентификатор виджета (50063).
          callbackFunction: onSelect,           // Функция, которая получит данные выбранного отделения.
          containerId: 'ecom-widget'            // ID DOM-элемента, куда встроится виджет.
        });
      }
    };

    /*// Быстрая проверка (если скрипт уже загружен через Helmet)
    if (window.ecomStartWidget) {
        initWidget();
        return;
    }*/

    // Интервал как fallback - Проверяем доступность функции каждые 100мс
    const interval = setInterval(() => {
      if (window.ecomStartWidget) {             // 
        clearInterval(interval);
        initWidget();
      }
    }, 100);
    
    /** Проблема: После выполнения useExternalScript скрипт начинает загружаться, но: 
     *      - Мы не знаем, сколько это займёт времени (зависит от сети пользователя)... 
     *      - Не можем использовать onload для скрипта, так как он управляется через хук...
     *  Решение: Периодически проверяем (каждые 100 мс), появилась ли нужная функция в window.
     *  Почему 100 мс? Это оптимальный баланс:
     *      - Слишком часто (1-10 мс): Бесполезная нагрузка на браузер.
     *      - Слишком редко (5 мин): Пользователь будет ждать инициализации виджета.
     *      - 100 мс: Среднее время загрузки скрипта + комфортная задержка для UX.
     *  Технические причины:
     *      - Скрипт обычно загружается за 100-500 мс.
     *      - Если он не загрузился за 1-2 секунды — вероятно, произошла ошибка.
     *      - Логичнее показать сообщение "Не удалось загрузить карту" через 2-3 секунды.  
     */

    // После рассуждений, изложенных выше, добавляем ещё и таймаут для обработки возможных ошибок с загрузкой виджета:
    useEffect(() => {
        const timeout = setTimeout(() => {
        if (!window.ecomStartWidget) {
            toast.error('Не удалось загрузить карту. Что-то пошло не так...', toastConfig);
            clearInterval(interval);
        }
        }, 2000); // Ждём максимум 2 секунды
    
        return () => {
        clearInterval(interval);
        clearTimeout(timeout);
        };
    }, []);

    return () => clearInterval(interval);       // Очистка при размонтировании
    // Зачем: Если пользователь уйдёт со страницы до загрузки скрипта, интервал будет отменён, чтобы избежать утечек памяти.
  }, [onSelect]);

  return (
    <div className="russianpost-map__content">
      <p className="russianpost-map__content-text">
        Для просмотра сроков и стоимости доставки заказа, введите адрес и выберите отделение связи:
      </p>
      <div id="ecom-widget" className="russianpost-map" />
      <div className="map__params"></div>
    </div>
  );
};

export default RussianPostMap;

/** 🛠 Как работает весь поток
        - Пользователь выбирает "Почта России" → Рендерится <RussianPostMap>.
        - Хук useExternalScript начинает загружать widget.js.
        - Пока скрипт грузится, useEffect запускает интервал:
        - Каждые 100 мс проверяет window.ecomStartWidget.
        - Как только функция становится доступной:
        - Интервал очищается.
        - Вызывается initWidget().
        - Виджет встраивается в div#ecom-widget.
    При выборе отделения срабатывает onSelect(data).
*/