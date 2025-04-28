//resources/js/Components/Cart/DeliverySelector.tsx

import { useState } from 'react';
import RussianPostMap from '../RussianPostMap';
import type { ITransport } from '@/Types/delivery';

interface DeliverySelectorProps {
  transports: ITransport[];
  onSelect: (data: {
    transportId: number;
    address: string;
    price: number;
    time: string;
  }) => void;
}

const DeliverySelector = ({ transports, onSelect }: DeliverySelectorProps) => {
  const [selectedTransportId, setSelectedTransportId] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const selectedTransport = transports.find(t => t.id === selectedTransportId);

  return (
    <>      
        {/* Основное поле выбора */}
        <div className='d-flex'>
            <div 
                className={`basketSelectTransportVisibleBlock ${isDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                {selectedTransportId 
                ? transports.find(o => o.id === selectedTransportId)?.name 
                : 'Выберите способ доставки/получения'}
            </div>
        </div>
      
        <div className="basket-res__delivery">
            <h3 className="basketPriceYesDeliveryBlockH3elemDelivery">
            {selectedTransportId === 0 ? (
              <i>Сейчас стоимость заказа без учёта доставки.</i>
            ) : ( 
              selectedTransportId !== 3 && (
              <>
                  Стоимость доставки: {transports.find(o => o.id === selectedTransportId)?.base_price}
                  &nbsp;<sup>₽</sup>
              </>
            ))}
            </h3>
        </div>

        {/* Выпадающий список */}
        {isDropdownOpen && (
            <ul className="basket-select__transport-drop">
            {transports.map(transport => (
                <li 
                  key={transport.id}
                  onClick={() => {
                    setSelectedTransportId(transport.id);
                    setIsDropdownOpen(false);
                  }}
                >
                
                  <a data-transport={transport.id}>
                  {transport.id === 3 ? (
                      <> {transport.name} 
                      {`от 490 ₽`}
                      </>
                    ) : (
                      <>{transport.name} 
                      {transport.base_price > 0 && `${transport.base_price} ₽`}
                      {transport.base_price === 0 && 'бесплатно'} </>
                  )}
                  </a>

                </li>
            ))}
            </ul>
        )}

        {/* Скрытое поле для формы */}
        <input 
            type="hidden" 
            name="choosedTransportCompanyForOrderDelivery" 
            value={selectedTransportId} 
        />

        {/* Блок для отображения карты Почты России */}
        {selectedTransportId === 3 && (
          <>
            <div className="russianpost-map__content">
                {/* {postDeliveryPrice === 0 && (
                  <p className="russianpost-map__content-text">
                    Для просмотра сроков и стоимости доставки заказа, введите адрес и выберите отделение связи:
                </p>
                )} */}
                
                <RussianPostMap 
                  onSelect={(data) => onSelect({
                    transportId: 3,
                    address: data.address,
                    price: data.cost,
                    time: data.deliveryTime
                  })}
                />
            </div>
            {/* {postDeliveryPrice > 0 && (
              <>
                <div className="basket-res__delivery">
                  <h3 className="basketPriceYesDeliveryBlockH3elemDelivery">
                  Стоимость доставки: {Math.round(postDeliveryPrice)}
                  &nbsp;<sup>₽</sup>
                  </h3>
              </div>
              </>
            )} */}
          </>
        )}       
    </>
  );
};

export default DeliverySelector;