//resources/js/Components/Cart/DeliverySelector.tsx

import { useState } from 'react';
import RussianPostMap from '../RussianPostMap';
import { ITransport } from '@/Types/delivery';
import { DEFAULT_WAREHOUSE } from '@/Config/constants';

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
  console.log('transports: ', transports);
  const [selectedTransportId, setSelectedTransportId] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [postDeliveryPrice, setPostDeliveryPrice] = useState<number>(0);

  return (
    <>      
        {/* Основное поле выбора */}
        <div className='d-flex'>
            <div 
                className={`basketSelectTransportVisibleBlock ${isDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                {selectedTransportId > 0 
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
                    onSelect({
                      transportId: transport.id,
                      address: transport.code === 'pickup' ?  'Самовывоз: ' + DEFAULT_WAREHOUSE.title : '',
                      price: transport.base_price,
                      time: '1-2 дня'
                      }
                    )
                  }}>
                
                  <a data-transport={transport.id}>
                  {transport.name}
                  {transport.price_calculation === 'external'
                    ? ': (расчёт при выборе)'
                    : transport.base_price > 0
                      ? `: (${transport.base_price} ₽)`
                      : ': (бесплатно)'}
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
                {postDeliveryPrice === 0 && (
                  <p className="russianpost-map__content-text">
                    Для просмотра сроков и стоимости доставки заказа, введите адрес и выберите отделение связи:
                </p>
                )}
                <RussianPostMap 
                  onSelect={(data) => onSelect({
                    transportId: 3,
                    address: data.address,
                    price: data.cost,
                    time: data.deliveryTime
                    }
                  )}
                />
            </div>
            {postDeliveryPrice > 0 && (
              <>
                <div className="basket-res__delivery">
                  <h3 className="basketPriceYesDeliveryBlockH3elemDelivery">
                  Стоимость доставки: {Math.round(postDeliveryPrice)}
                  &nbsp;<sup>₽</sup>
                  </h3>
              </div>
              </>
            )}
          </>
        )}       
    </>
  );
};

export default DeliverySelector;