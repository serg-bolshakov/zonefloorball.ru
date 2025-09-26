// Components/Admin/Sections/Orders/OrdersTable/OrdersTableRow.tsx

import { useState } from 'react';
import { OrderStatusChanger } from '../OrderStatusChanger/OrderStatusChanger';
import { IOrder, EnumOrderStatus, OrderStatusLabels } from "@/Types/orders";
import { EnumPaymentStatuses, PaymentStatusLabels } from "@/Types/payments";
import { getStatusColor } from "@/Utils/getStatusColor";

interface OrdersTableRowProps {
    order: IOrder;
    onStatusChange: (orderId: number, newStatus: EnumOrderStatus, comment: string) => void;
    onRowClick: (orderId: number) => void;
}

export const OrdersTableRow: React.FC<OrdersTableRowProps> = ({ 
    order, 
    onStatusChange, 
    onRowClick 
}) => {

    const [selectedAction, setSelectedAction] = useState<string>('');
    const [showStatusModal, setShowStatusModal] = useState(false);

    const handleActionChange = (action: string) => {
        setSelectedAction(action);
        
        switch (action) {
            case 'order_status':
                setShowStatusModal(true);
                break;
            case 'payment_status':
                // Открываем модалку для оплаты
                break;
            case 'track_num':
                // Открываем модалку для трек-номера
                break;
        }
        
        // Сбрасываем селект после выбора
        setTimeout(() => setSelectedAction(''), 100);
    };

    const handleStatusChange = (orderId: number, newStatus: EnumOrderStatus, comment?: string) => {
        onStatusChange(orderId, newStatus, comment || '');
        setShowStatusModal(false);
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
            <td  className="td-center" onClick={(e) => e.stopPropagation()}>
                <select 
                    value={selectedAction}
                    onChange={(e) => handleActionChange(e.target.value)}
                    className="admin-action-select"
                    >
                    <option value="">+</option>
                    <option value="order_status">Изменить статус</option>
                    <option value="payment_status">Провести оплату</option>
                    <option value="track_num">Добавить трек</option>
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
            </td>
        </tr>
    );
};