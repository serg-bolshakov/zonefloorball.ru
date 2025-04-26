// resources/js/Components/RussianPostMap.tsx - Компонент для виджета Почты России
import { useEffect, useState } from 'react';
import { useExternalScript } from '@/Hooks/useExternalScript';
import { toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
import { Helmet } from "react-helmet";
import { RussianPostWidgetResponse } from '@/Types/delivery';

declare global {                                                        // Объявление глобального интерфейса
  interface Window {                                                    // Что делает: Расширяет стандартный интерфейс Window
    ecomStartWidget?: (config: {                                        // добавляя в него опциональную (?) функцию ecomStartWidget.
      id: number;                                                       // Зачем: TypeScript будет "знать" об этой функции, 
      callbackFunction: (data: RussianPostWidgetResponse) => void;      // когда она появится в глобальной области видимости после загрузки скрипта.
      containerId: string;
    }) => void;
    handlePostOfficeSelection: ((data: RussianPostWidgetResponse) => void) | null;
  }
}

interface RussianPostMapProps {
    onSelect: (data: {
      address: string;
      cost: number;
      deliveryTime: string;
      postOfficeId: number;
    }) => void;
}

const RussianPostMap = ({ onSelect }: RussianPostMapProps) => {
// const RussianPostMap = () => {

    // 1. Сначала гарантированно создаём глобальную функцию - инициализация глобальной функции
    useEffect(() => {
        window.handlePostOfficeSelection = (response: RussianPostWidgetResponse) => {
            
            if (!response) return;
            // console.log('Данные от Почты России:', response);
            
            const isInvalidValue = (value: any) => 
                value == null || 
                value === 'null' || 
                value === 'undefined' || 
                (typeof value === 'string' && value.trim() === '');

            const addressParts = [
                response.areaTo,
                response.cityTo,
                response.addressTo
            ].filter(part => !isInvalidValue(part));
            
            onSelect({
                address: addressParts.join(', '),
                cost: response.cashOfDelivery / 100,
                deliveryTime: response.deliveryDescription.description,
                postOfficeId: response.id
            });       
        };

        return () => {
            // Очищаем при размонтировании
            window.handlePostOfficeSelection = null;
        };
    }, [onSelect]);
    // }, []);

    
    const toastConfig = {
        position: "top-right" as const,
        autoClose: 1500, // Уведомление закроется через секунду-другую...
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        transition: Slide, // Используем Slide, Zoom, Flip, Bounce для этого тоста
    }

    // Загружаем скрипт только через хук - useExternalScript - динамически создаёт <script> тег и добавляет его в <body>.
    const scriptStatus = useExternalScript('https://widget.pochta.ru/map/widget/widget.js');

    // 2. Затем инициализируем виджет
    useEffect(() => {
        if (scriptStatus === 'error') {
            toast.error('Не удалось загрузить карту. Попробуйте позже.');
            return;
        }
        
        // Пропускаем если скрипт еще не готов
        if (scriptStatus !== 'ready') return;

        let widgetInitialized = false;
        let interval: NodeJS.Timeout;
        let timeout: NodeJS.Timeout;

        // Инициализируем виджет после загрузки скрипта
        const initWidget = (): boolean => {
            if (!window.handlePostOfficeSelection || !window.ecomStartWidget) {
                console.error('Функция обратного вызова не инициализирована');
                return false;
            }
            
            if (widgetInitialized || typeof window.ecomStartWidget !== 'function') {    // Проверяем, что функция действительно доступна.
                console.error('widgetInitialized не инициализирована или typeof window.ecomStartWidget !== function');
                return false;
            }

            window.ecomStartWidget({                                        // Вызываем её с параметрами:
            id: 50063,                                                      // Идентификатор виджета (50063).
            callbackFunction: window.handlePostOfficeSelection,             // Теперь функция гарантированно существует
            containerId: 'ecom-widget'                                      // ID DOM-элемента, куда встроится виджет.
            });

            widgetInitialized = true;
            return true;
        };

        // Первая попытка инициализации
        if (!initWidget()) {
            interval = setInterval(() => {
            if (initWidget()) {
                clearTimeout(timeout);
                clearInterval(interval);
            }
            }, 100);

            // Фолбек-таймаут
            timeout = setTimeout(() => {
            if (!widgetInitialized) {
                clearInterval(interval);
                toast.error('Виджет не загрузился. Обновите страницу.');
            }
            }, 5000);
        }
    
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

        // Очистка при размонтировании
        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
        // Зачем: Если пользователь уйдёт со страницы до загрузки скрипта, интервал будет отменён, чтобы избежать утечек памяти.
        
    }, [scriptStatus]);

    return (
        <>
            <Helmet>
                {/* Для тестирования можно временно разрешить всем */}
                <meta 
                http-equiv="Permissions-Policy" 
                content="geolocation=*" 
                />
                <script 
                    src="https://widget.pochta.ru/map/widget/widget.js" 
                    async 
                    defer
                />
            </Helmet>
            
            <div id="ecom-widget" className="russianpost-map" />
            <div className="map__params"></div>
        </>
    );
};

export default RussianPostMap;

/** 🛠 Как работает весь поток (Переписал немного, но суть прежняя...)
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