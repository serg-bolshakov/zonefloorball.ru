//recources/js/Components/OrderCheckoutModals/IndividualCustomerDataModalForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import useModal from "@/Hooks/useModal";

import { TCartCustomer } from '@/Types/cart';
import { motion } from 'framer-motion';

interface IndividualCustomerDataModalForm {
    initialDeliveryAddress: string;
    initialCustomerData: TCartCustomer;
    onSubmit: (data: TCartCustomer) => void;
    onCancel: () => void;
}

const IndividualCustomerDataModalForm: React.FC<IndividualCustomerDataModalForm> = ({
    initialDeliveryAddress,
    initialCustomerData,
    onSubmit,
    onCancel,
  }) => {
    
    console.log(initialDeliveryAddress);
    console.log(initialCustomerData);
    
    const [formData, setFormData] = useState<TCartCustomer>({
        type: 'individual',
        firstName: initialCustomerData.firstName,
        lastName: initialCustomerData.lastName,
        phone: initialCustomerData.phone,
        email: initialCustomerData.email,
        deliveryAddress: initialDeliveryAddress && initialDeliveryAddress.trim() !== '' 
            ? initialDeliveryAddress 
            : initialCustomerData.deliveryAddress,
    });
    
    console.log('formData', formData);
    console.log('formData deliveryAddress', initialDeliveryAddress ?? initialCustomerData.deliveryAddress);
    console.log('initialCustomerData.deliveryAddress', initialCustomerData.deliveryAddress);

    const [errors, setErrors] = useState<Partial<TCartCustomer>>({});
    const addressRef = useRef<HTMLDivElement>(null);

    // Валидация полей
    const validateField = (name: keyof TCartCustomer, value: string): boolean => {
        let isValid = true;
        let error = '';

        switch (name) {
            case 'deliveryAddress':
                if (!value.trim()) {
                    error = 'Адрес доставки обязателен';
                    isValid = false;
                    } else if (!/^[а-яА-ЯёЁ\d\s.,"!:)(/№-]*$/.test(value)) {
                    error = 'Недопустимые символы в адресе';
                    isValid = false;
                }
            break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return isValid;
    };
    
    // Обработчик адреса (contentEditable div)
    const handleAddressChange = () => {
        if (addressRef.current) {
            const newAddress = addressRef.current.textContent || '';
            setFormData(prev => ({ ...prev, deliveryAddress: newAddress }));
            validateField('deliveryAddress', newAddress);
        }
    };
 
    // Сабмит формы
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const isAddressValid = validateField('deliveryAddress', formData.deliveryAddress);

        if (isAddressValid) {
            onSubmit(formData);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <p className="registration-form__input-item"><span className="registration-form__title">Информация о получателе заказа</span></p>

                <p className="registration-form__input-item">
                    <label className="label" htmlFor="firstName">Имя: <span className="registration-error">*</span></label>
                    <input 
                        id="firstName" 
                        name="firstName" 
                        type="text" 
                        className="registration-form__input"
                        value={formData.firstName} 
                        readOnly disabled required 
                    />
                </p>

                <p className="registration-form__input-item">
                    <label className="label" htmlFor="lastName">Фамилия: <span className="registration-error">*</span></label>
                    <input 
                        id="lastName" 
                        name="lastName"
                        type="text"
                        className="registration-form__input"
                        value={formData.lastName}
                        readOnly disabled required 
                    />
                </p>
   
                <p className="registration-form__input-item">
                    <label className="label" htmlFor="phone">Телефон: <span className="registration-error">*</span></label>
                    <input 
                        id="phone" 
                        name="phone"
                        type="tel"
                        className="registration-form__input"
                        value={formData.phone}
                        readOnly disabled required 
                    />
                </p>

                <p className="registration-form__input-item">
                    <label className="label" htmlFor="email">Email (для чека, статуса заказа): <span className="registration-error">*</span></label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        className="registration-form__input"
                        value={formData.email}
                        readOnly disabled required 
                    />
                </p>

                <div id="basketordermakingdeliveryaddressfield" className="registration-form__input-item">
                    <label className="label">Адрес получения заказа: <span className="registration-error">*</span></label>
                    
                    {initialDeliveryAddress ? (
                        <div className="registration-form__input-address">
                            {initialDeliveryAddress}
                        </div>
                    ) : (
                        <>
                            <div
                                ref={addressRef}
                                contentEditable
                                className={`registration-form__input-address ${errors.deliveryAddress ? 'invalid' : ''}`}
                                onBlur={handleAddressChange}
                                dangerouslySetInnerHTML={{ __html: formData.deliveryAddress }}
                            />
                            {errors.deliveryAddress && ( <span className="registration-error">{errors.deliveryAddress}</span> )}
                        </>
                    )}                   
                                        
                    <span className="productAddition-form__clearance">Адрес доставки/получения должен быть указана русском языке, либо он "подгружается" из данных, введённых при выборе способа доставки.</span>
                </div>
                
                <div className="registration-form__input-item d-flex flex-sb padding-left8px padding-right24px">
                    <motion.button 
                            whileHover={{ scale: 1.1 }}  
                            whileTap={{ scale: 0.9 }}
                            type="button" className="order-btn"
                            onClick={onCancel}
                        >
                        Отменить
                    </motion.button>

                    <motion.button 
                        whileHover={{ scale: 1.1 }}  
                        whileTap={{ scale: 0.9 }}
                        animate={{
                            scale: [1, 1.05, 0.95], // Пульсация
                            transition: { 
                            repeat: Infinity, 
                            repeatDelay: 1,
                            duration: 0.9 
                            }
                        }}
                        type='submit'
                        className="order-btn"
                    >
                        Вперёд
                    </motion.button>
                    
                </div>
            
            </form>
        </>
    );
};

export default IndividualCustomerDataModalForm;