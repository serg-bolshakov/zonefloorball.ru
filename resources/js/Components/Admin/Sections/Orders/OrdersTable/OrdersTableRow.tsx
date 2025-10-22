// Components/Admin/Sections/Orders/OrdersTable/OrdersTableRow.tsx

import { useState } from 'react';
import { OrderStatusChanger } from '../OrderStatusChanger/OrderStatusChanger';
import { IOrder, EnumOrderStatus, OrderStatusLabels } from "@/Types/orders";
import { EnumPaymentStatuses, PaymentStatusLabels } from "@/Types/payments";
import { getStatusColor } from "@/Utils/getStatusColor";
import { ITransport } from "@/Types/delivery";
import { generateStatusComment } from '@/Utils/orderComments';
import { TrackNumberModal } from './TrackNumberModal';

interface OrdersTableRowProps {
    order: IOrder & {
        transport?: ITransport; // Теперь транспорт доступен
    };
    onStatusChange: (orderId: number, newStatus: EnumOrderStatus, comment: string) => void;
    onTrackNumberUpdate: (orderId: number, trackNumber: string, comment: string) => void;
    onRowClick: (orderId: number) => void;
}

export const OrdersTableRow: React.FC<OrdersTableRowProps> = ({ 
    order, 
    onStatusChange,
    onTrackNumberUpdate, 
    onRowClick 
}) => {

    const [selectedAction, setSelectedAction] = useState<string>('');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showTrackModal, setShowTrackModal] = useState(false);

    console.log('OrdersTableRow order', order);

    const handleActionChange = (action: string) => {
        setSelectedAction(action);
        
        switch (action) {
            case 'order_status':
                // Для отладки - посмотрим что приходит
                console.log('📦 Order transport ID:', order.order_transport_id);
                setShowStatusModal(true);
                break;
            case 'payment_status':
                // Открываем модалку для оплаты
                break;
            case 'track_num':
                setShowTrackModal(true);
                break;
                
            case 'order_details':
                window.open(`/order/track/${order.access_hash}`, '_blank');
                break;
        }
        
        // Сбрасываем селект после выбора
        setTimeout(() => setSelectedAction(''), 100);
    };

    const handleStatusChange = (orderId: number, newStatus: EnumOrderStatus, comment?: string) => {
        // Автогенерация комментария если не указан вручную
        const finalComment = comment?.trim() 
        ? comment 
        : generateStatusComment(newStatus, order);

        console.log('💬 Final comment:', finalComment);
        
        if (finalComment) {
            onStatusChange(orderId, newStatus, finalComment);
        }
        setShowStatusModal(false);
    };

    const handleTrackNumberSave = (orderId: number, trackNumber: string, comment: string) => {
        onTrackNumberUpdate(orderId, trackNumber, comment);
        setShowTrackModal(false);
    };

    return (
        <tr 
            // onClick={() => onRowClick(order.id)}
            className="cursor-pointer hover:bg-gray-50"
        >
            <td className="td-right"># {order.id}</td>
            <td className="td-right">{order.order_number}</td>
            <td className="td-center">{new Date(order.created_at).toLocaleDateString()}</td>
            <td>{order.order_recipient_names || '—'}</td>
            <td className="td-center">
                <span className={`payment-status ${order.payment_status}`}>
                    {PaymentStatusLabels[order.payment_status as EnumPaymentStatuses]}
                </span>
            </td>
            <td className="td-right">{order.total_product_amount} ₽</td>
            <td className="td-center">
                <span className={`status-badge status-${order.status_id}`}
                    style={{ color: getStatusColor(OrderStatusLabels[order.status_id as EnumOrderStatus]) }}
                >
                    {OrderStatusLabels[order.status_id as EnumOrderStatus]}
                </span>
            </td>
            <td className="td-center">{order.order_track_num || '—'}</td>
            <td className="td-center" onClick={(e) => e.stopPropagation()}>
                <select 
                    value={selectedAction}
                    onChange={(e) => handleActionChange(e.target.value)}
                    className="admin-action-select"
                    >
                    <option value="">+</option>
                    <option className="td-left" value="order_details">👁️ Посмотреть заказ</option>
                    <option className="td-left" value="order_status">🔄 Изменить статус</option>
                    <option className="td-left" value="payment_status">💳 Провести оплату</option>
                    <option className="td-left" value="track_num">📦 Добавить трек</option>
                </select>
                {/* Модальное окно изменения статуса */}
                {showStatusModal && (
                    <OrderStatusChanger
                        order={order}
                        currentStatus={order.status_id as EnumOrderStatus}
                        onStatusChange={handleStatusChange}
                        onClose={() => setShowStatusModal(false)}
                    />
                )}

                {/* Модальное окно трек-номера */}
                {showTrackModal && (
                <TrackNumberModal
                    order={order}
                    onSave={handleTrackNumberSave}
                    onClose={() => setShowTrackModal(false)}
                />
                )}
            </td>
        </tr>
    );
};