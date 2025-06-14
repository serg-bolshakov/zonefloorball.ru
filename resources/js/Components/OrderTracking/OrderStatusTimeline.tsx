// Компонент для отображения статуса заказа с timeline
import { IOrderStatus } from "@/Pages/OrderTracking";
import { dateRu } from "@/Utils/dateFormatter";

export const OrderStatusTimeline: React.FC<{ status: IOrderStatus }> = ({ status }) => {
    return (
        <div className="status-timeline">
            <div className="status-current">
                <h3>Текущий статус:</h3>
                <div className="status-badge">{status.name}</div>
            </div>
            
            <div className="timeline">
                {status.history.map((event, index) => (
                    <div key={index} className="timeline-event">
                        <div className="timeline-point"></div>
                        <div className="timeline-content">
                            <span className="event-date">{dateRu(event.date)}</span>
                            <span className="event-status">{event.status}</span>
                            {event.comment && <p className="event-comment">{event.comment}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};