//resources/js/Components/Cart/DeliverySelector.tsx

import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

interface DeliveryOption {
  id: number;
  name: string;
  price: number;
  type: 'pickup' | 'local' | 'post';
}


interface onDeliveryChangeProps {
    onDeliveryChange: (optionId: number, price: number) => void;
}

const DeliverySelector: React.FC<onDeliveryChangeProps> = ({ onDeliveryChange }) => {
  const { props } = usePage();  // Автоматически получит тип из inertia.d.ts
                                // хук из библиотеки @inertiajs/react - предоставляет доступ к:
                                // Пропсам, переданным от сервера (Laravel) / URL-параметрам / Данным сессии
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [postOfficeData, setPostOfficeData] = useState<any>(null);


  // Варианты доставки (можно вынести в конфиг или получать из API)
  const deliveryOptions: DeliveryOption[] = [
    { id: 1, name: 'Самовывоз со склада продавца: ', price: 0, type: 'pickup' },
    { id: 2, name: 'Доставка по Нижнему Новгороду: ', price: props.deliveryPrice ?? 990, type: 'local' },
    { id: 3, name: 'Почта России: ', price: props.deliveryPrice ?? 490, type: 'post' } // Цена будет уточнена
  ];

  const handleOptionSelect = (optionId: number, deliveryPrice: number) => {
    onDeliveryChange(optionId, deliveryPrice); // Передаём данные в родительский компонент
    setSelectedOption(optionId);
    setIsDropdownOpen(false);
    
    if (optionId === 3) {
      loadPostOffices(); // Загружаем отделения Почты России
    }
  };

  const loadPostOffices = async () => {
    try {
      // Здесь будет ваш API-запрос к сервису Почты России
      const response = await fetch('https://api.pochta.ru/offices');
      setPostOfficeData(await response.json());
    } catch (error) {
      console.error('Ошибка загрузки отделений:', error);
    }
  };

  return (
    <>      
        {/* Основное поле выбора */}
        <div className='d-flex'>
            <div 
                className={`basketSelectTransportVisibleBlock ${isDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                {selectedOption 
                ? deliveryOptions.find(o => o.id === selectedOption)?.name 
                : 'Выбрать способ доставки/получения заказа'}
            </div>
        </div>
      
        <div className="basket-res__delivery">
            <h3 className="basketPriceYesDeliveryBlockH3elemDelivery">
            {selectedOption === 0 ? (
                <i>Сейчас стоимость заказа без учёта доставки.</i>
                ) : (
                    <>
                        Стоимость доставки: {deliveryOptions.find(o => o.id === selectedOption)?.price}
                        &nbsp;<sup>₽</sup>
                    </>
                )
            }
            </h3>
        </div>

        {/* Выпадающий список */}
        {isDropdownOpen && (
            <ul className="basket-select__transport-drop">
            {deliveryOptions.map(option => (
                <li 
                key={option.id}
                onClick={() => handleOptionSelect(option.id, option.price)}
                >
                <a data-transport={option.id}>
                    {option.name} 
                    {option.price > 0 && `${option.price} ₽`}
                    {option.price === 0 && 'бесплатно'}
                </a>
                </li>
            ))}
            </ul>
        )}

        {/* Скрытое поле для формы */}
        <input 
            type="hidden" 
            name="choosedTransportCompanyForOrderDelivery" 
            value={selectedOption} 
        />

        {/* Блок для отображения карты Почты России */}
        {selectedOption === 3 && postOfficeData && (
            <div className="post-office-map">
            {/* Здесь будет компонент с Яндекс.Картой */}
            <p>Выберите отделение на карте:</p>
            {/* Интеграция с API карт */}
            </div>
        )}       
      
    </>
  );
};

export default DeliverySelector;