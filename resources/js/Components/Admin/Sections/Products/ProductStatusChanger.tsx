// resources/js/Components/Admin/Section/Products/ProductStatusChanger.tsx

import React, { useState } from 'react';
import { PRODUCT_STATUSES } from '@/Constants/productStatuses';
import { IOrder, EnumOrderStatus, OrderStatusLabels } from '@/Types/orders';

interface OrderStatusChangerProps {
    order: IOrder;
    currentStatus: EnumOrderStatus;
    onStatusChange: (orderId: number, newStatus: EnumOrderStatus, comment?: string) => void;
    onClose: () => void;
}

export const ProductStatusChanger: React.FC<OrderStatusChangerProps> = ({
    order,
    currentStatus,
    onStatusChange,
    onClose
}) => {
    // const [showModal, setShowModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<EnumOrderStatus>(currentStatus);
    const [comment, setComment] = useState('');

    const getAvailableStatuses = (): EnumOrderStatus[] => {
        // Расширенная логика переходов
        console.log('currentStatus', currentStatus);
        switch (currentStatus) {
            /*case EnumOrderStatus.PENDING:
                return [EnumOrderStatus.CONFIRMED, EnumOrderStatus.CANCELLED];
            
            case EnumOrderStatus.IN_PROCESSING:
                return [EnumOrderStatus.READY_TO_BE_DISPATCHED, EnumOrderStatus.CANCELLED];
            
            case EnumOrderStatus.READY_TO_BE_DISPATCHED:
                return [EnumOrderStatus.SHIPPED, EnumOrderStatus.CANCELLED];
            
            case EnumOrderStatus.SHIPPED:
                return [EnumOrderStatus.DELIVERED, EnumOrderStatus.RECEIVED];*/
                
            default:
            // Правильное получение значений enum
            return Object.values(EnumOrderStatus)
                .filter((s): s is EnumOrderStatus => 
                    typeof s === 'number' && s !== currentStatus
                );

            // Или просто возвращаем все статусы кроме текущего
            /* const allStatuses: EnumOrderStatus[] = [
                EnumOrderStatus.PENDING,
                EnumOrderStatus.CREATED,
                EnumOrderStatus.RESERVED,
                EnumOrderStatus.CONFIRMED,
                EnumOrderStatus.CANCELLED,
                EnumOrderStatus.FAILED,
                EnumOrderStatus.IN_PROCESSING,
                EnumOrderStatus.READY_TO_BE_DISPATCHED,
                EnumOrderStatus.SHIPPED,
                EnumOrderStatus.DELIVERED,
                EnumOrderStatus.RECEIVED,
                EnumOrderStatus.COMPLETED,
                EnumOrderStatus.RETURNED,
                EnumOrderStatus.NULLIFY,
                EnumOrderStatus.PREORDER
            ];
            
            return allStatuses.filter(s => s !== currentStatus);*/
        }
    };

    const handleSubmit = () => {
        if (selectedStatus !== currentStatus) {
            onStatusChange(order.id, selectedStatus, comment);
        }
        onClose();
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Изменение статуса заказа #{order.id}</h3>
                
                <div className="admin-form-group">
                    <label>Текущий статус:</label>
                    <span className="current-status">
                        {OrderStatusLabels[currentStatus]}
                    </span>
                </div>

                <div className="admin-form-group">
                    <label>Новый статус:</label>
                    <select 
                        value={selectedStatus} 
                        onChange={(e) => setSelectedStatus(Number(e.target.value))}
                    >
                        {getAvailableStatuses().map(status => (
                            <option key={status} value={status}>
                                {OrderStatusLabels[status]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="admin-form-group">
                    <label>Комментарий (обязательно):</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Опишите причину изменения статуса..."
                        rows={3}
                        required
                    />
                </div>

                <div className="admin-modal-actions">
                    <button type="button" onClick={onClose}>Отмена</button>
                    <button 
                        type="button" 
                        onClick={handleSubmit}
                        disabled={!comment.trim() || selectedStatus === currentStatus}
                        className="admin-btn-primary"
                    >
                        Сохранить изменения
                    </button>
                </div>
            </div>
        </div>
    );
};