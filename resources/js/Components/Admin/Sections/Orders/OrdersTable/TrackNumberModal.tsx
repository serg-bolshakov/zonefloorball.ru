// resources/js/Components/Admin/Sections/Orders/OrdersTable/TrackNumberModal.tsx

import React, { useState, useEffect } from 'react';
import { IOrder } from '@/Types/orders';
import { generateTrackingComment } from '@/Utils/orderComments';

interface TrackNumberModalProps {
  order: IOrder;
  onSave: (orderId: number, trackNumber: string, comment: string) => void;
  onClose: () => void;
}

export const TrackNumberModal: React.FC<TrackNumberModalProps> = ({
  order,
  onSave,
  onClose
}) => {

  const [showModal, setShowModal] = useState(true); // модалка сразу открыта  

  const [trackNumber, setTrackNumber] = useState(order.order_track_num || '');
  const [driverName, setDriverName] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [driverPhone, setDriverPhone] = useState('');

  const handleSubmit = () => {
    if (trackNumber.trim()) {
      const driverInfo = driverName && carNumber && driverPhone 
        ? { name: driverName, carNumber, phone: driverPhone }
        : undefined;
      
      const comment = generateTrackingComment(trackNumber, driverInfo);
      onSave(order.id, trackNumber, comment);
    }
    onClose();
  };

    // Для закрытия модалки при клике вне ее
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);
  
    if (!showModal) return null;
  
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Добавление трек-номера для заказа #{order.id}</h3>
        
        <div className="admin-form-group">
          <label>Трек-номер:</label>
          <input
            type="text"
            value={trackNumber}
            onChange={(e) => setTrackNumber(e.target.value)}
            placeholder="Введите трек-номер..."
            className="admin-input"
          />
        </div>

        <div className="admin-form-section">
          <h4 className='margin-bottom12px'>Информация о доставке (опционально):</h4>
          
          <div className="admin-form-group">
            <label>ФИО водителя:</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="Иванов Василий Иванович"
              className="admin-input"
            />
          </div>

          <div className="admin-form-group">
            <label>Номер автомобиля:</label>
            <input
              type="text"
              value={carNumber}
              onChange={(e) => setCarNumber(e.target.value)}
              placeholder="a299oy52"
              className="admin-input"
            />
          </div>

          <div className="admin-form-group">
            <label>Телефон водителя:</label>
            <input
              type="tel"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
              placeholder="+7(910)795-55-55"
              className="admin-input"
            />
          </div>
        </div>

        <div className="admin-modal-actions">
          <button type="button" onClick={onClose}>Отмена</button>
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={!trackNumber.trim()}
            className="admin-btn-primary"
          >
            Сохранить трек-номер
          </button>
        </div>
      </div>
    </div>
  );
};