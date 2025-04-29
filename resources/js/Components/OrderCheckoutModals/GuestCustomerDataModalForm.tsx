//recources/js/Components/OrderCheckoutModals/GuestCustomerDataModalForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import useModal from "@/Hooks/useModal";

import { IGuestCustomerData } from "@/Types/orders";
import { TValidationRule } from "@/Types/orders";

import { motion } from 'framer-motion';

interface GuestCustomerDataModalFormProps {
    initialDeliveryAddress: string;
    onSubmit: (data: IGuestCustomerData) => void;
    onCancel: () => void;
}

const GuestCustomerDataModalForm: React.FC<GuestCustomerDataModalFormProps> = ({
    initialDeliveryAddress,
    onSubmit,
    onCancel,
  }) => {
    
    const [formData, setFormData] = useState<IGuestCustomerData>({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        deliveryAddress: initialDeliveryAddress,
    });

    const [errors, setErrors] = useState<Partial<IGuestCustomerData>>({});
    const addressRef = useRef<HTMLDivElement>(null);

    // Валидация полей
    const validateField = (name: keyof IGuestCustomerData, value: string): boolean => {
        let isValid = true;
        let error = '';

        switch (name) {
        case 'firstName':
        case 'lastName' :
            if (!/^[а-яА-ЯёЁ\s'-]+$/.test(value)) {
                error = 'Пожалуйста, укажите данные на русском языке';
                isValid = false;
            } else if (value.length > 30) {
                error = 'Длина текста не может превышать 30 символов!';
                isValid = false;
            }
            break;

        case 'phone':
            if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value)) {
                error = 'Неверно указан номер телефона!';
                isValid = false;
            }
            break;

        case 'email':
            if (!value.trim()) {
                error = 'Email обязателен';
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                error = 'Некорректный формат email';
                isValid = false;
            }
            break;

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

    // Обработчик изменений полей
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name as keyof IGuestCustomerData, value);
    };
    
    // Обработчик адреса (contentEditable div)
    const handleAddressChange = () => {
        if (addressRef.current) {
            const newAddress = addressRef.current.textContent || '';
            setFormData(prev => ({ ...prev, deliveryAddress: newAddress }));
            validateField('deliveryAddress', newAddress);
        }
    };

    // Маска для телефона
    const handlePhoneInput = (e: React.FormEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        let value = input.value.replace(/\D/g, '');
        let formattedValue = '+7 (___) ___-__-__';

        if (value.length > 1) {
            value = value.substring(1);
        }

        for (let i = 0; i < value.length; i++) {
            formattedValue = formattedValue.replace('_', value[i]);
        }

        input.value = formattedValue;
        setFormData(prev => ({ ...prev, phone: formattedValue }));
        validateField('phone', formattedValue);
    };

    // Дебаунс для валидации email (чтобы не проверять на каждый ввод символа):
        const [emailTimeout, setEmailTimeout] = useState<NodeJS.Timeout>();

        const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;
            setFormData(prev => ({ ...prev, email: value }));
            
            if (emailTimeout) clearTimeout(emailTimeout);
            
            setEmailTimeout(setTimeout(() => {
                validateField('email', value);
            }, 500));
        };

        // Не забыть очистить таймаут при размонтировании... :)
        useEffect(() => {
            return () => {
                if (emailTimeout) clearTimeout(emailTimeout);
            };
        }, []);
    // Дебаунс закончен... 

    // Сабмит формы
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Валидация всех полей перед отправкой
        const isFirstNameValid = validateField('firstName', formData.firstName);
        const isLastNameValid = validateField('lastName', formData.lastName);
        const isPhoneValid = validateField('phone', formData.phone);
        const isEmailValid = validateField('email', formData.email);
        const isAddressValid = validateField('deliveryAddress', formData.deliveryAddress);

        if (isFirstNameValid && isLastNameValid && isPhoneValid && isEmailValid && isAddressValid) {
            onSubmit(formData);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}> 
                <p className="order-info__text">Важно! Оформление заказа производится без регистрации и авторизации покупателя! Вы сможете отслеживать изменения статуса и ход доставки только на этом устройстве в разделе "Мои заказы / покупки". Для доступа в "личный кабинет", получения детальной информации и специальных цен, рекомендуем <a href="/register">зарегистрироваться</a> в системе или <a href="/login">авторизоваться</a></p>
                <p className="registration-form__input-item"><span className="registration-form__title">Информация о получателе заказа</span></p>

                <p className="registration-form__input-item">
                    <label className="label" htmlFor="firstName">Имя: <span className="registration-error">*</span></label>
                    <input 
                        id="firstName" 
                        name="firstName" 
                        type="text" 
                        className={`registration-form__input  ${errors.firstName ? 'invalid' : ''}`} 
                        value={formData.firstName} 
                        onChange={handleChange}
                        onBlur={() => validateField('firstName', formData.firstName)}
                        maxLength={30}
                        autoFocus={!initialDeliveryAddress} // Фокус только если адрес не заполнен
                        autoComplete="name"
                        required 
                    />
                    {errors.firstName && ( <span className="registration-error">{errors.firstName}</span> )}
                    <span className="productAddition-form__clearance">Имя пишется буквами русского алфавита, должно быть длиной от 1 до 30 символов, может содержать пробел и дефис.</span>
                </p>

                <p className="registration-form__input-item">
                    <label className="label" htmlFor="lastName">Фамилия: <span className="registration-error">*</span></label>
                    <input 
                        id="lastName" 
                        name="lastName"
                        type="text"
                        className={`registration-form__input  ${errors.lastName ? 'invalid' : ''}`} 
                        value={formData.lastName}
                        onChange={handleChange}
                        onBlur={() => validateField('lastName', formData.lastName)}
                        maxLength={30}
                        autoComplete="surname"
                        required
                    />
                    {errors.lastName && ( <span className="registration-error">{errors.lastName}</span> )}
                    <span className="productAddition-form__clearance">Правила написания фамилии такие же, как и для имени (см.выше).</span>
                </p>

                <p className="registration-form__input-item">
                    <label className="label" htmlFor="phone">Телефон: <span className="registration-error">*</span></label>
                    <input 
                        id="phone" 
                        name="phone"
                        type="tel"
                        className={`registration-form__input  ${errors.phone ? 'invalid' : ''}`}
                        placeholder="+7 (999) 123-45-67"
                        onInput={handlePhoneInput}
                        onBlur={() => validateField('phone', formData.phone)}
                        autoComplete="tel"
                        required
                    />
                    {errors.phone && ( <span className="registration-error">{errors.phone}</span> )}
                    <span className="productAddition-form__clearance">Номер телефона вводится в формате: +7 (999) 123-45-67</span>
                </p>

                <p className="registration-form__input-item">
                    <label className="label" htmlFor="email">Email (для чека, статуса заказа): <span className="registration-error">*</span></label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        className={`registration-form__input  ${errors.email ? 'invalid' : ''}`}
                        placeholder="user@gmail.com"
                        value={formData.email}
                        // onChange={handleEmailChange}
                        // onBlur={() => validateField('email', formData.email)}
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, email: e.target.value }));
                            // Базовая валидация при изменении (без debounce). Отказ от debounce: простая валидация на лету (onChange)
                            if (e.target.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
                              setErrors(prev => ({ ...prev, email: 'Некорректный email' }));
                            } else {
                              setErrors(prev => ({ ...prev, email: '' }));
                            }
                        }}
                        onBlur={() => {
                            // Финализация проверки при onBlur: if (empty) => "Введите email"
                            if (!formData.email.trim()) {
                              setErrors(prev => ({ ...prev, email: 'Введите email' }));
                            }
                        }}
                        autoComplete="email"
                        required
                    />
                    {errors.email && ( <span className="registration-error">{errors.email}</span> )}
                    <span className="productAddition-form__clearance">На этот email придёт кассовый чек и номер для отслеживания.</span>
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
                
                <div className="d-flex flex-sb padding-left8px padding-right24px">
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

export default GuestCustomerDataModalForm;