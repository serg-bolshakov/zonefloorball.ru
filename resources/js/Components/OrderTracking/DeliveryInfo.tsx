// Компонент для информации о доставке
import { IOrderDelivery } from "@/Pages/OrderTracking";
import { formatPrice } from "@/Utils/priceFormatter";
import { dateRu } from "@/Utils/dateFormatter";

export const DeliveryInfo: React.FC<{ delivery: IOrderDelivery }> = ({ delivery }) => {
    return (
        <div className="delivery-info">
            <div className="info-row">
                <span>Способ доставки:</span>
                <span>{delivery.type}</span>
            </div>
            <div className="info-row">
                <span>Адрес:</span>
                <span>{delivery.address}</span>
            </div>
            {delivery.tracking_number && (
                <div className="info-row">
                    <span>Трек-номер:</span>
                    <span>{delivery.tracking_number}</span>
                </div>
            )}
            {delivery.estimated_date && (
                <div className="info-row">
                    <span>Примерная дата доставки:</span>
                    <span>{dateRu(delivery.estimated_date)}</span>
                </div>
            )}
            <div className="info-row">
                <span>Стоимость доставки:</span>
                <span>{formatPrice(delivery.cost)}</span>
            </div>
        </div>
    );
};
