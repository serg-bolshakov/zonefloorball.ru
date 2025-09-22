// Компонент для отображения статуса заказа с timeline
// OrderStatusTimeline.tsx 

import { IOrderStatus } from "@/Pages/OrderTracking";
import { dateRu } from "@/Utils/dateFormatter";

// Функция для "санитизации" HTML (базовая проверка)
const sanitizeHtml = (html: string): string => {
  // Разрешаем только теги <a> с атрибутами href, target, rel
  return html.replace(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*>(.*?)<\/a>/g, 
    (match, quote, href, text) => {
      // Проверяем, что ссылка ведет на доверенный домен
      if (href.includes('pochta.ru') || href.includes('www.pochta.ru')) {
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
      // Если ссылка на другой домен, делаем ее неактивной
      return text;
    }
  );
};

// Функция для определения цвета точки по статусу
const getStatusColor = (status: string, isCurrent: boolean) => {
    if (isCurrent) return '#4CAF50'; // Зеленый для текущего
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('доставк') || statusLower.includes('в пути') || statusLower.includes('отправлен')) {
        return '#2196F3'; // Синий
    }
    if (statusLower.includes('обработк') || statusLower.includes('подтвержден') || statusLower.includes('упакован')) {
        return '#FF9800'; // Оранжевый
    }
    if (statusLower.includes('создан') || statusLower.includes('зарезервирован')) {
        return '#9C27B0'; // Фиолетовый
    }
    if (statusLower.includes('готов')) {
        return '#f8fc08ff'; // Жёлтый
    }
    
    return '#9E9E9E'; // Серый по умолчанию
};

export const OrderStatusTimeline: React.FC<{ status: IOrderStatus }> = ({ status }) => {
    return (
        <div className="status-timeline">
            <div className="status-current">
                <h3>Текущий статус:</h3>
                <div className="status-badge">{status.name}</div>
            </div>
            
            <div className="timeline">
                {status.history && status.history.map((event, index) => {
                    const isCurrent = index === 0; // Первый элемент - текущий статус
                    const pointColor = getStatusColor(event.status, isCurrent);
                    
                    return (
                        <div key={index} className="timeline-event">
                            <div 
                                className="timeline-point"
                                style={{ 
                                    backgroundColor: pointColor,
                                    boxShadow: isCurrent ? `0 0 0 2px ${pointColor}33` : 'none'
                                }}
                            />
                            <div className="timeline-content">
                                <span className="event-date">{dateRu(event.date)}</span>
                                <span className="event-status">{event.status}</span>
                                {event.comment && (
                                    <p className="event-comment" dangerouslySetInnerHTML={{ __html: event.comment }} />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};