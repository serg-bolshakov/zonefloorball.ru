// resources/js/Components/Admin/Section/Products/ProductStatusChanger.tsx

import React, { useState } from 'react';
import { PRODUCT_STATUSES } from '@/Constants/productStatuses';
import { IProduct } from '@/Types/types';

interface ProductStatusChangerProps {
    product: IProduct;
    currentStatus: number;
    onStatusChange: (orderId: number, newStatus: number) => void;
    onClose: () => void;
}

/* export const ProductStatusChanger: React.FC<ProductStatusChangerProps> = ({
    product,
    currentStatus,
    onStatusChange,
    onClose
}) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<number>(currentStatus);

    const getAvailableStatuses = (): number[] => {
        // Просто возвращаем все статусы кроме текущего
            const allStatuses: number[] = [
                PRODUCT_STATUSES.ACTIVE,
                PRODUCT_STATUSES.ARCHIEVED
            ];
            
            return allStatuses.filter(s => s !== currentStatus);
        }
    };

    // const handleSubmit = () => {
    //     if (selectedStatus !== currentStatus) {
    //         onStatusChange(product.id, selectedStatus);
    //     }
    //     onClose();
    // };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Изменение статуса товара #{product.id}</h3>
                
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
};*/