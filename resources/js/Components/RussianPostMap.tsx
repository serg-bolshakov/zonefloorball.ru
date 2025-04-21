// resources/js/Components/RussianPostMap.tsx - Компонент для виджета Почты России
import { useEffect } from 'react';
import { useExternalScript } from '@/Hooks/useExternalScript';

declare global {
  interface Window {
    ecomStartWidget?: (config: {
      id: number;
      callbackFunction: Function;
      containerId: string;
    }) => void;
  }
}

interface RussianPostMapProps {
  onSelect: (data: any) => void;
}

const RussianPostMap = ({ onSelect }: RussianPostMapProps) => {
  // Загружаем скрипт виджета
  useExternalScript('https://widget.pochta.ru/map/widget/widget.js');

  useEffect(() => {
    // Инициализируем виджет после загрузки скрипта
    const initWidget = () => {
      if (window.ecomStartWidget) {
        window.ecomStartWidget({
          id: 50063,
          callbackFunction: onSelect,
          containerId: 'ecom-widget'
        });
      }
    };

    // Проверяем доступность функции каждые 100мс
    const interval = setInterval(() => {
      if (window.ecomStartWidget) {
        clearInterval(interval);
        initWidget();
      }
    }, 100);

    return () => clearInterval(interval);
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