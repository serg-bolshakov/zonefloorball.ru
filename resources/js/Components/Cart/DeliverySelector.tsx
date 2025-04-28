//resources/js/Components/Cart/DeliverySelector.tsx

import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import RussianPostMap from '../RussianPostMap';
import { ITransport } from '@/Types/delivery';

interface DeliverySelectorProps {
  transports: ITransport[];
  onSelect: (data: {
    transportId: number;
    address: string;
    price: number;
    time: string;
  }) => void;
}

interface DeliveryWay {
  id: number;
  name: string;
  price: number;
  type: 'pickup' | 'local' | 'post';
}


interface onDeliveryChangeProps {
    onDeliveryChange: (deliveryWayId: number, price: number) => void;
}

interface onPostOfficeSelectProps {
  onPostOfficeSelect: (deliveryAddress: string, deliveryPrice: number, deliveryTime: string) => void;
}

// interface DeliverySelectorProps {
//   onDeliveryChange: (optionId: number, price: number) => void;
//   onPostOfficeSelect: (address: string, price: number, time: string) => void;
// }

const DeliverySelector = ({ transports, onSelect }: DeliverySelectorProps) => {
  console.log('transports: ', transports);
  const [selectedTransportId, setSelectedTransportId] = useState<number>(0);
  const { props } = usePage();  // Автоматически получит тип из inertia.d.ts
                                // хук из библиотеки @inertiajs/react - предоставляет доступ к:
                                // Пропсам, переданным от сервера (Laravel) / URL-параметрам / Данным сессии
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [postDeliveryPrice, setPostDeliveryPrice] = useState<number>(0);

  // Варианты доставки (можно вынести в конфиг или получать из API)
  /*const deliveryWays: DeliveryWay[] = [
    { id: 1, name: 'Самовывоз со склада продавца: ', price: 0, type: 'pickup' },
    { id: 2, name: 'Доставка по Нижнему Новгороду: ', price: props.deliveryPrice ?? 990, type: 'local' },
    { id: 3, name: 'Почта России: ', price: props.deliveryPrice ?? 0, type: 'post' } // Цена будет уточнена
  ];*/

  /*const handleDeliveryWaySelect = (deliveryWayId: number, deliveryPrice: number) => {
    onDeliveryChange(deliveryWayId, deliveryPrice); // Передаём данные в родительский компонент
    setSelectedDeliveryWay(deliveryWayId);
    setIsDropdownOpen(false);
  };*/

  /*const handlePostOfficeData = (data: {
    address: string;
    cost: number;
    deliveryTime: string;
    postOfficeId: number;
  }) => {
    onDeliveryChange(3, data.cost); // 3 - ID способа "Почта России"
    onPostOfficeSelect(data.address, data.cost, data.deliveryTime);
    setPostDeliveryPrice(data.cost);
  };*/

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
                  }}>
                
                  <a data-transport={transport.id}>
                  {transport.id === 3 ? (
                      <> {transport.name} 
                      {`: от 490 ₽`}
                      </>
                    ) : (
                      <>{transport.name} 
                      {transport.base_price > 0 && `: ${transport.base_price} ₽`}
                      {transport.base_price === 0 && ': бесплатно'} </>
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
                })}
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