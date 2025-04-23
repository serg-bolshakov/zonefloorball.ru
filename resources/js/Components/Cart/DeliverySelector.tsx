//resources/js/Components/Cart/DeliverySelector.tsx

import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import RussianPostMap from '../RussianPostMap';

interface DeliveryWay {
  id: number;
  name: string;
  price: number;
  type: 'pickup' | 'local' | 'post';
}


interface onDeliveryChangeProps {
    onDeliveryChange: (optionId: number, price: number) => void;
}

const DeliverySelector = ({ onDeliveryChange }: onDeliveryChangeProps) => {
  const { props } = usePage();  // Автоматически получит тип из inertia.d.ts
                                // хук из библиотеки @inertiajs/react - предоставляет доступ к:
                                // Пропсам, переданным от сервера (Laravel) / URL-параметрам / Данным сессии
  const [selectedDeliveryWay, setSelectedDeliveryWay] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Варианты доставки (можно вынести в конфиг или получать из API)
  const deliveryWays: DeliveryWay[] = [
    { id: 1, name: 'Самовывоз со склада продавца: ', price: 0, type: 'pickup' },
    { id: 2, name: 'Доставка по Нижнему Новгороду: ', price: props.deliveryPrice ?? 990, type: 'local' },
    { id: 3, name: 'Почта России: ', price: props.deliveryPrice ?? 490, type: 'post' } // Цена будет уточнена
  ];

  const handleDeliveryWaySelect = (optionId: number, deliveryPrice: number) => {
    onDeliveryChange(optionId, deliveryPrice); // Передаём данные в родительский компонент
    setSelectedDeliveryWay(optionId);
    setIsDropdownOpen(false);
  };


  const handlePostOfficeData = (data: {
    address: string;
    cost: number;
    deliveryTime: string;
    postOfficeId: number;
  }) => {
    onDeliveryChange(3, data.cost); // 3 - ID способа "Почта России"
  };

  return (
    <>      
        {/* Основное поле выбора */}
        <div className='d-flex'>
            <div 
                className={`basketSelectTransportVisibleBlock ${isDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                {selectedDeliveryWay 
                ? deliveryWays.find(o => o.id === selectedDeliveryWay)?.name 
                : 'Выбрать способ доставки/получения заказа'}
            </div>
        </div>
      
        <div className="basket-res__delivery">
            <h3 className="basketPriceYesDeliveryBlockH3elemDelivery">
            {selectedDeliveryWay === 0 ? (
                <i>Сейчас стоимость заказа без учёта доставки.</i>
                ) : (
                    <>
                        Стоимость доставки: {deliveryWays.find(o => o.id === selectedDeliveryWay)?.price}
                        &nbsp;<sup>₽</sup>
                    </>
                )
            }
            </h3>
        </div>

        {/* Выпадающий список */}
        {isDropdownOpen && (
            <ul className="basket-select__transport-drop">
            {deliveryWays.map(deliveryWay => (
                <li 
                key={deliveryWay.id}
                onClick={() => handleDeliveryWaySelect(deliveryWay.id, deliveryWay.price)}
                >
                <a data-transport={deliveryWay.id}>
                    {deliveryWay.name} 
                    {deliveryWay.price > 0 && `${deliveryWay.price} ₽`}
                    {deliveryWay.price === 0 && 'бесплатно'}
                </a>
                </li>
            ))}
            </ul>
        )}

        {/* Скрытое поле для формы */}
        <input 
            type="hidden" 
            name="choosedTransportCompanyForOrderDelivery" 
            value={selectedDeliveryWay} 
        />

        {/* Блок для отображения карты Почты России */}
        {selectedDeliveryWay === 3 && (
            <RussianPostMap onSelect={handlePostOfficeData} />
        )}       
    </>
  );
};

export default DeliverySelector;