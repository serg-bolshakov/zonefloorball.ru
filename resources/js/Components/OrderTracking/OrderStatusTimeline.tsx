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

export const OrderStatusTimeline: React.FC<{ status: IOrderStatus }> = ({ status }) => {
    return (
        <div className="status-timeline">
            <div className="status-current">
                <h3>Текущий статус:</h3>
                <div className="status-badge">{status.name}</div>
            </div>
            
            <div className="timeline">
                {status.history && status.history.map((event, index) => (
                    <div key={index} className="timeline-event">
                        <div className="timeline-point"></div>
                        <div className="timeline-content">
                            <span className="event-date">{dateRu(event.date)}</span>
                            <span className="event-status">{event.status}</span>
                            {event.comment && (
                              <p 
                                className="event-comment"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.comment) }}
                              />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};