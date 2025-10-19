// resources/js/Components/Profile/LegalUserFields.tsx

import React, { useState, useCallback, useContext } from 'react';
import { IIndividualUser } from "@/Types/types";
import { IOrgUser } from '@/Types/types';
import { toast, ToastIcon } from 'react-toastify';
import { Inertia } from '@inertiajs/inertia';
import axios from 'axios';
import useModal from '@/Hooks/useModal';
import useAppContext from '@/Hooks/useAppContext';
import { AnimatePresence, motion, stagger } from 'framer-motion';
import { dateRu } from '@/Utils/dateFormatter';
import AddressSection from './AddressSection';
import { validateAddress } from '@/Utils/formFieldsValidation';
import { Link } from '@inertiajs/react';
import { checkNonEmptyString } from '@/Utils/checkHelpers';

interface IRepresentPerson {
    org_rep_name?: string;
    org_rep_surname?: string;
    org_rep_email?: string;
    org_rep_phone?: string;
}

interface ILegalUserFieldsProps { user: IOrgUser, representPerson?: IRepresentPerson | null }

interface ApiError {
    message?: string;
    errors?: Record<string, string[]>;
}

export type TEditableField = 'orgname' | 'phone' | 'inn' | 'kpp' | 'deliveryAddress' | 'legalAddress' | null;

const CONFIRMATION_TITLES: Record<Exclude<TEditableField, null>, string> = {       // Исключаем null
    orgname   : 'Подтвердите изменения в наименовании юридического лица (ИП)',
    phone   : 'Подтвердите изменение номера телефона',
    inn: 'Подтвердите корректировку ИНН',
    kpp: 'Подтвердите корректировку КПП',
    deliveryAddress : 'Подтвердите изменение Адреса',
    legalAddress: 'Подтвердите изменение юридического адреса',
    // null обработаем отдельно
} as const;

export type TFormData = {
    orgname: string;
    phone: string;
    inn: string;
    kpp: string;
    deliveryAddress: string;
    legalAddress: string;
};

type TFieldMapping = {
    orgname: 'name';
    phone: 'org_tel';
    inn: 'org_inn';
    deliveryAddress: 'delivery_addr_on_default';
    legalAddress: 'org_addr';
    // ... другие поля
};

type TFormErrors = Partial<Record<keyof TFormData, string>>;

const LegalUserFields: React.FC<ILegalUserFieldsProps> = ({ user, representPerson }) => {

    const { openModal } = useModal(); 
    
    // Состояние видимости карточки предприятия
    const [isCompanyCardVisible, setIsCompanyCardVisible] = useState(false);

    // Состояние видимости карточки представителя компании
    const [isContactPersonCardVisible, setIsContactPersonCardVisible] = useState(false);
    
    // Достаём setUser из контекста
    const { setUser } = useAppContext();

    // console.log('user', user);

    // Активная форма редактирования
    const [activeForm, setActiveForm] = useState<TEditableField>(null);

    // Данные формы
    const [formData, setFormData] = useState<TFormData>({
        orgname: user.name,
        phone: user.org_tel || '',
        inn: user.org_inn || '',
        kpp: user.org_kpp || '',
        deliveryAddress: user.delivery_addr_on_default || '',
        legalAddress: user.org_addr || ''
    });
    
    // Ошибки валидации
    const [errors, setErrors] = useState<TFormErrors>({});

    // Базовая валидация при изменении (без debounce). Отказ от debounce: простая валидация на лету (onChange)
    const validateField = (name: string, value: string): boolean => {
        // console.log('validator name', name);
        // console.log('validator value', value);
        let error = '';
        let isValid = true;
        switch (name) {
        case 'name':
        case 'surname' :
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
        case 'birthday':
            if (!/^((19[5-9][0-9])|(20[0-1][0-9]))-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])$/.test(value)) {
                error = 'Вводите корректные данные, пожалуйста... Если уверены в своей правоте, - оставьте поле пока пустым и напишите нам об ошибке.';
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
        case 'legalAddress':
            if (!value.trim()) {
                error = 'Адрес обязателен';
                isValid = false;
            } else if (!/^[а-яА-ЯёЁ\d\s.,"!:)(/№-]*$/.test(value)) {
                error = 'Недопустимые символы в адресе';
                isValid = false;
            }
            break;
        case 'orgname' :
            if (!/^[a-zA-Zа-яА-ЯёЁ\d\s.,"!:)(/№-]+$/.test(value)) {
                error = 'Проверьте написание на наличие спецсимволов';
                isValid = false;
            } else if (value.length > 30) {
                error = 'Длина текста не может превышать 255 символов!';
                isValid = false;
            }
            break;
        case 'inn':
            if (!/^[\d]{10,12}$/.test(value)) {
                error = 'ИНН может содержать только цифры, длина не более 12 знаков!';
                isValid = false;
            } 
            break;
        }
                
        setErrors(prev => ({ ...prev, [name]: error }));
        return isValid;
    };
    
    // Обработчик изменения полей - оптимизация рендеров с помощью useCallback:
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Базовая валидация при изменении (без debounce). Отказ от debounce: простая валидация на лету (onChange)
        validateField(name, value);
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleDeliveryAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, deliveryAddress: value }));
        
        // Валидация в реальном времени
        validateField('deliveryAddress', value);
    };

    const handleOrgAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, legalAddress: value }));
        
        // Валидация в реальном времени
        validateField('legalAddress', value);
    };

    const [initialData, setInitialData] = useState<TFormData>({} as TFormData);

    const handleOpenForm = (formName: TEditableField) => {
        setActiveForm(formName);
        setErrors({});
        
        // Всегда берём актуальные данные из контекста/пропсов
        setFormData({
            orgname: user?.name || '',
            phone: user?.org_tel || '',
            inn: user?.org_inn || '',                           // null превращаем в пустую строку
            kpp: user?.org_kpp || '',
            deliveryAddress: user?.delivery_addr_on_default || '',      // null превращаем в пустую строку
            legalAddress: user?.org_addr || ''
        });

        // Сохраняем текущие данные как исходные
        setInitialData({ ...formData });
    };

    // Добавим отдельное состояние для чекбокса:
    const [shouldDeleteData, setShouldDeleteData] = useState(false);

    // Сброс формы при закрытии (к исходным значениям)
    const handleCancel = () => {
        setFormData({
            orgname: user.name,
            phone: user.org_tel || '',
            inn: user.org_inn || '',
            kpp: user.org_addr || '',
            deliveryAddress: user.delivery_addr_on_default || '',
            legalAddress: user.org_addr || ''
        });
        setActiveForm(null);

        shouldDeleteData ? setShouldDeleteData(false) : true;
    };

    // Выносим проверку изменений в отдельную функцию
    const checkChanges = (fields: (keyof TFormData)[]): boolean => {
        const hasFormChanges = fields.some(field => 
            formData[field] !== initialData[field]
        );
        // console.log('checkChanges fields', fields);
        // console.log('checkChanges hasFormChanges', hasFormChanges);


        // Если пользователь активировал чекбокс - считаем это изменением
        return hasFormChanges;
    };

    // Конфигурация преобразования полей
    const getServerFieldName = (field: keyof TFieldMapping | string): string => {
        const mapping: Record<string, string> = {
            orgname     : 'name',
            phone       : 'org_tel',               // Клиентское 'phone' -> Серверное 'org_tel'       
            inn         : 'org_inn',
            kpp         : 'org_kpp',
            deliveryAddress     : 'delivery_addr_on_default',
            legalAddress: 'org_addr'
        };
        return mapping[field] || field;         // Если поля нет в маппинге, возвращаем как есть
    };

    const getConfirmationTitle = (formType: Exclude<TEditableField, null>): string => {
        return CONFIRMATION_TITLES[formType] || 'Подтвердите изменение данных';
    };

    const handleCheckboxAddressDelete = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShouldDeleteData(e.target.checked);
    };

    // Отправка формы
    const handleSubmit = async (e: React.FormEvent, fields: (keyof TFormData)[]) => {
        e.preventDefault();
        // console.log('handleSubmit fields', fields);
        // console.log(!!checkChanges(['phone']));
        // console.log(errors.phone);
        // Проверяем, есть ли изменения (дублируем для безопасности) - сделали кнопку неактивной, если нет никаких изменени...
        const hasChanges = (fields: (keyof TFormData)[]): boolean => {
            // console.log('hasChanges', fields);
            const hasFormChanges = fields.some(field => 
                formData[field] !== initialData[field]
            );
            
            return hasFormChanges;
        };

        if (!hasChanges) {
            toast.info('Вы не внесли изменений');
            setActiveForm(null); // Закрываем форму
            return;
        }
  
        // Валидация всех переданных полей
        const hasErrors = fields.some(field => {
            return !validateField(field, formData[field]);;
        });
  
        if (hasErrors) {
            toast.error('Исправьте ошибки в форме');
            return;
        }
        
        const activeFormNonNull = activeForm ?? 'orgname';                    // Запасное значение для проверкт на null
        let oldValue, newValue: string | null = '';

        // для получения прежних данных юзера мы должны обратиться к контексту, а там данные юзера указаны в соответствии с наименованиями полей в таблице БД
        // используем здесь: oldValue = user?.[serverFieldName as keyof typeof user] || 'не указано';
        const serverFieldName = getServerFieldName(activeFormNonNull as keyof TFieldMapping | string);
        
        if (activeForm === 'orgname') {
            oldValue = `${user?.name || ''}`.trim() || 'Не указано';
            newValue = `${formData.orgname}`.trim();
        } else if (activeForm === 'inn') {
            const fieldKey = activeForm as keyof typeof user;
            oldValue = user?.org_inn  || 'Не указано';
            newValue = formData[fieldKey as keyof TFormData]  || 'Не указано';
        } else {
            const fieldKey = activeForm as keyof typeof user;
            oldValue = user?.[serverFieldName as keyof typeof user] || 'Не указано';
            newValue = formData[fieldKey as keyof TFormData];
        }

        const payload: Record<string, string | null> = {};

        // Обработка удаления адреса
        if (shouldDeleteData) {
            payload['delivery_addr_on_default'] = null; // Явное указание null для сервера
        } else {                                        // Обычные изменения
            fields.forEach(field => {
            const serverFieldName = getServerFieldName(field);
            payload[serverFieldName] = formData[field];
            });
        }
        // Показываем модалку только если есть реальные изменения (сто тысяч раз проверили уже... :) )
        if (Object.keys(payload).length > 0) {
            openModal(null, 'update', {
                title: 
                    shouldDeleteData     ? "Удалить данные адреса из профиля?" :
                (
                    <div>
                        <h3>{getConfirmationTitle(activeFormNonNull)}</h3>
                        <AnimatePresence>
                            <motion.div 
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 0,
                                    transition: { 
                                        repeat: Infinity, 
                                        repeatDelay: 1,
                                        duration: 5 
                                    }
                                }}
                                key={newValue}
                            >
                                <div className='fs12 margin-top12px'>Сейчас: <span className="line-through">{oldValue}</span><br /> Будет: <span className="color-green">{newValue}</span></div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                ),
                /*onConfirm: async () => {
                    try {
                        // Отправляем только нужные поля
                                              
                        console.log(payload);
                        const response = await axios.put('/profile', payload);
                        console.log(response);
                        // Важное изменение: обновляем контекст
                        if (response.data.user && setUser) {
                            setUser(response.data.user); // Обновляем глобальное состояние
                        }

                        shouldDeleteData ? toast.success('Данные адреса удалены из профиля')
                        : toast.success('Данные обновлены!');

                        if (shouldDeleteData) {
                            setFormData(prev => ({ ...prev, deliveryAddress: '' }));    // Сбрасываем значение
                            setShouldDeleteData(false);                         // Сбрасываем чекбокс
                        }

                        setActiveForm(null);
                    } catch (error) {
                        console.log('error', error);
                        if (axios.isAxiosError(error) && error.response?.data?.errors) {
                            setErrors(error.response.data.errors);
                            toast.error(error.response.data.errors);
                        } else {
                            toast.error('Ошибка при обновлении');
                        }
                    }
                },*/
                
                onConfirm: async () => {
                    try {
                        const response = await axios.put('/profile', payload);
                        
                        if (response.data.user && setUser) {
                            setUser(response.data.user);
                        }

                        shouldDeleteData 
                            ? toast.success('Данные адреса удалены из профиля')
                            : toast.success('Данные обновлены!');

                        if (shouldDeleteData) {
                            setFormData(prev => ({ ...prev, deliveryAddress: '' }));
                            setShouldDeleteData(false);
                        }

                        setActiveForm(null);
                    } catch (error) {
                        console.log('error', error);
                        
                        if (axios.isAxiosError(error)) { 
                            // Обработка ошибок валидации
                            if (error.response?.data?.errors) {
                                setErrors(error.response.data.errors);
                                
                                // Безопасное извлечение первой ошибки
                                const errorEntries = Object.entries(error.response.data.errors);
                                if (errorEntries.length > 0) {
                                    const firstErrorList: any = errorEntries[0][1];
                                    if (firstErrorList.length > 0) {
                                        toast.error(firstErrorList[0]);
                                    }
                                }
                            } 
                            // Обработка других API-ошибок
                            else if (error.response?.data?.message) {
                                toast.error(error.response.data.message);
                            } else {
                                toast.error('Ошибка при обновлении данных');
                            }
                        } else {
                            toast.error('Неизвестная ошибка');
                        }
                    }
                },

                onCancel: () => {
                    toast.success('Данные сохранены без изменений');
                    handleCancel();
                }
            });
        }
    };

    // console.log( ((!!errors.address || !checkChanges(['address'])) && (shouldDeleteData && !formData.address)) || !(!!errors.address && checkChanges(['address']) && shouldDeleteData));    
    // console.log( ((!!errors.address || !checkChanges(['address'])) && (shouldDeleteData && !formData.address)) );
    // console.log( !(!!errors.address && checkChanges(['address']) && shouldDeleteData)  )
    return (
        <>
            
            {/* Это просто серая черта (бордер) */}
            <div className="profile-info__line margin-left12px"></div>

            {/* Поле имени и фамилии*/}
            {/* <h4 className="fs11">Пользователь: </h4> */}
            <div className="profile-info__line--title flex-sb fs12">
                <p>{formData.orgname}</p> 
                <img src="/storage/icons/edit.png"  
                    alt="edit-logo" 
                    title="Редактировать наименование организации (ИП)" 
                    onClick={() => activeForm === 'orgname' ? handleCancel() : handleOpenForm('orgname')}
                    className="cursor-pointer"
                />
            </div>
            { activeForm === 'orgname' && (
                <div className="profile-changing-form margin-bottom8px">
                    <form onSubmit={(e) => handleSubmit(e, ['orgname'])}>
                        <h6 className="color-red">Вы в режиме редактирования</h6>
                        
                        <label className="fs12" htmlFor="nameprofilechanging">Наименование: </label>
                        <input 
                            className={`registration-form__input margin-tb4px ${errors.orgname ? 'invalid' : ''}`} 
                            type="text"
                            required
                            name="orgname"
                            value={formData.orgname}
                            onChange={handleChange}
                            autoFocus
                            autoComplete="name"
                        />
                        <span className="productAddition-form__clearance">
                            Наименование организации указывается в соответствии с учредительными документами.
                        </span>
                    
                        <div className="d-flex flex-sa">
                            <button type="submit" className="changing-form__submit-btn" disabled={!checkChanges(['orgname'])}>Изменить</button>
                            <button 
                                type="button" 
                                className="changing-form__submit-btn"
                                onClick={handleCancel}
                            >
                                Не меняем
                            </button>
                        </div>
                    </form>
                </div>           
            )}

            
            {/* Переключатель карточки предприятия */}
            <div className="profile-info__line--title flex-sb fs11">
                <p>Карточка предприятия</p>
                <img
                    src={`/storage/icons/${isCompanyCardVisible ? 'icon-close' : 'search'}.png`}
                    alt={isCompanyCardVisible ? 'close-logo' : 'search-logo'}
                    title={isCompanyCardVisible ? 'Закрыть просмотр' : 'Посмотреть контактную информацию'}
                    onClick={() => setIsCompanyCardVisible(!isCompanyCardVisible)}
                    className="cursor-pointer"
                />
            </div>

            {/* Карточка предприятия (видна только при isCompanyCardVisible) */}
            {isCompanyCardVisible && (
                <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="company-card margin-bottom24px"
                >
                    {/* Блок ИНН/КПП */}
                    <div className="profile-user__card--div">
                        <div className="profile-info__line--title flex-sb">
                            <h4 className="fs11 margin-left12px margin-tb12px">ИНН: {user.org_inn}</h4>
                            {/* <img
                                src="/storage/icons/edit.png"
                                alt="edit-logo"
                                title="Редактировать ИНН"
                                onClick={() => activeForm === 'inn' ? handleCancel() : handleOpenForm('inn')}
                                className="cursor-pointer"
                            /> */}
                            <h4 className="fs11 margin-left12px margin-tb12px">КПП: {user.org_kpp}</h4>
                        </div>
                        {/* Это просто серая черта (бордер) */}
                        <div className="profile-info__line margin-left12px"></div>
                    </div>
                    {activeForm === 'inn' && (
                        <div className="profile-changing-form">
                        <form onSubmit={(e) => handleSubmit(e, ['inn'])}>
                            <label className="fs12">ИНН:</label>
                            <input
                                type="text"
                                name="inn"
                                value={formData.inn}
                                onChange={handleChange}
                                className={`registration-form__input ${errors.inn ? 'invalid' : ''}`}
                                maxLength={12}
                            />
                            {errors.inn && <div className="color-red fs12">{errors.inn}</div>}
                            <div className="d-flex flex-sa margin-top12px">
                                <button
                                    type="submit"
                                    className="changing-form__submit-btn"
                                    disabled={!checkChanges(['inn'])}
                                >
                                    Сохранить
                                </button>
                                <button
                                    type="button"
                                    className="changing-form__submit-btn"
                                    onClick={handleCancel}
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                        </div>
                    )}

                    {/* Блок юридического адреса */}
                    <div className="profile-user__card--div">
                        <div className="profile-info__address--title flex-sb">
                            <h4 className="margin-left12px fs11">Юридический адрес:</h4>
                            <img
                                src={`/storage/icons/${activeForm === 'legalAddress' ? 'icon-close' : 'edit'}.png`}
                                alt="edit-logo"
                                title={activeForm === 'legalAddress' ? 'Закрыть форму редактирования' : 'Редактировать юридический адрес'}
                                onClick={() => activeForm === 'legalAddress' ? handleCancel() : handleOpenForm('legalAddress')}
                                className="cursor-pointer"
                            />
                        </div>
                        <div className="profile-info__line margin-left12px">
                            <span className='margin-left12px fs11'>{user.org_addr || 'Не указан'}</span>
                        </div>
                    </div>
                    {activeForm === 'legalAddress' && (
                        <div className="profile-changing-form margin-bottom12px">
                            <form onSubmit={(e) => handleSubmit(e, ['legalAddress'])}>
                                <div className="registration-form__input-item">
                                    <label className="fs12 color-red margin-left12px">
                                        Редактируем юридический адрес!
                                    </label>
                                    {/* Поле адреса */}
                                    <textarea
                                        id="editorgaddressfieldinprofilediv"
                                        className='registration-form__input-address margin-tb12px'
                                        value={formData.legalAddress}
                                        onChange={handleOrgAddressChange}
                                    />
                                    <span className="productAddition-form__clearance">
                                        Указывается в соответствии с учредительными документами.
                                    </span>

                                    {errors.legalAddress && <div className="color-red margin-top12px">{errors.legalAddress}</div>}
                                </div>
                                <div className="d-flex flex-sa margin-top12px">
                                    <button
                                        type="submit"
                                        className="changing-form__submit-btn"
                                        disabled={!checkChanges(['legalAddress']) || !!errors.legalAddress}
                                    >
                                        Сохранить
                                    </button>
                                    <button
                                        type="button"
                                        className="changing-form__submit-btn"
                                        onClick={handleCancel}
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Блок телефона */}
                    <div className="profile-user__card--div">
                        <div className="profile-info__address--title flex-sb">
                            <h4 className="margin-left12px fs11">Телефон: {user.org_tel || 'Не указан'}</h4>
                            <img
                                // src="/storage/icons/edit.png"
                                src={`/storage/icons/${activeForm === 'phone' ? 'icon-close' : 'edit'}.png`}
                                alt="edit-logo"
                                title={activeForm === 'phone' ? 'Закрыть форму редактирования' : 'Редактировать номер телефона'}
                                onClick={() => activeForm === 'phone' ? handleCancel() : handleOpenForm('phone')}
                                className="cursor-pointer"
                            />
                        </div>
                        {/* Это просто серая черта (бордер) */}
                        <div className="profile-info__line margin-left12px"></div>
                    </div>

                    {activeForm === 'phone' && (
                        <div className="profile-changing-form">
                            <form onSubmit={(e) => handleSubmit(e, ['phone'])}>
                                <div className="fs12 color-red margin-bottom12px">Редактируем номер телефона:</div>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`registration-form__input ${errors.phone ? 'invalid' : ''}`}
                                    placeholder="+7 (XXX) XXX-XX-XX"
                                    pattern="\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}"
                                />
                                {errors.phone && <div className="color-red fs12">{errors.phone}</div>}
                                <div className="d-flex flex-sa margin-top12px">
                                <button
                                    type="submit"
                                    className="changing-form__submit-btn"
                                    disabled={!checkChanges(['phone']) || !!errors.phone}
                                > 
                                    Сохранить
                                </button>
                                <button
                                    type="button"
                                    className="changing-form__submit-btn"
                                    onClick={handleCancel}
                                >
                                    Отмена
                                </button>
                                </div>
                            </form>
                        </div>
                    )}
                </motion.div>
            )}
            {/* Это просто серая черта (бордер) */}
            <div className="profile-info__line margin-left12px"></div>

            {/* Блок адреса доставки по умолчанию*/}
            <h4 className="fs11">Адрес доставки заказов (по умолчанию): </h4>
            <div className="profile-info__line--title flex-sb fs12">
                <p>{user.delivery_addr_on_default ? (user.delivery_addr_on_default) : 'Не указан'}</p>    
                <img 
                    src="/storage/icons/edit.png" 
                    alt="edit-logo" 
                    title="Редактировать адрес"
                    onClick={() => activeForm === 'deliveryAddress' ? handleCancel() : handleOpenForm('deliveryAddress')}
                />
            </div>

            {activeForm === 'deliveryAddress' && (
                <div id="profilechangingdeliveryaddressdiv" className="profile-changing-form">
                    <form onSubmit={(e) => handleSubmit(e, ['deliveryAddress'])}>
                        <div id="editdeliveryaddressfieldinprofile" className="registration-form__input-item margin-tb4px">
                            <label className="fs12" htmlFor="editdeliveryaddressfieldinprofilediv">
                                Адрес доставки/получения заказов <br/>(по умолчанию): 
                            </label>
                            {/* Поле адреса */}
                            <textarea
                                id="editdeliveryaddressfieldinprofilediv"
                                className={shouldDeleteData ? 'disabled-field registration-form__input-address margin-tb12px' : 'registration-form__input-address margin-tb12px'}
                                // className='registration-form__input-address margin-tb12px'
                                value={formData.deliveryAddress}
                                onChange={handleDeliveryAddressChange}
                                disabled={shouldDeleteData}
                            />
                            <span className="productAddition-form__clearance">
                                В этот адрес (если он будет здесь указан) будут отправляться заказы. 
                                Адрес можно указать при выборе транспортной компании.
                            </span>

                            {errors.deliveryAddress && <div className="color-red margin-top12px">{errors.deliveryAddress}</div>}
                        </div>

                        <div>
                            {/* Чекбокс удаления */}
                            <input 
                                type="checkbox" 
                                id="deletedeliveryaddressfromaccount"
                                name="shouldDeleteData"
                                hidden
                                checked={shouldDeleteData}
                                onChange={handleCheckboxAddressDelete}
                            />
                            <label htmlFor="deletedeliveryaddressfromaccount" className="checkbox-label">
                                Удалить данные адреса из системы
                            </label>
                        </div>

                        {/* Кнопки */}
                        <div className="d-flex flex-sa">
                            <button 
                                type="submit" 
                                name='address'
                                disabled={((!!errors.deliveryAddress || !checkChanges(['deliveryAddress'])) && (shouldDeleteData && !formData.deliveryAddress))}
                                className="changing-form__submit-btn"
                            >
                                {shouldDeleteData ? 'Удалить' : 'Сохранить'}
                            </button>

                            <button 
                                type="button" 
                                className="changing-form__submit-btn"
                                onClick={handleCancel}
                            >
                                Отмена
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Блок представителя организации */}
            {representPerson && (
                <>
                    <div className="representative-info"></div><div className="margin-top24px">
                        <div className="profile-user__card--div">
                            <h4 className="fs11 margin-left12px">Представитель (контактное лицо): </h4>
                            <div className="profile-info__address--title flex-sb">
                                <h4 className="margin-left12px fs11">{representPerson.org_rep_name} {representPerson.org_rep_surname}</h4>
                                <img
                                    src={`/storage/icons/${isContactPersonCardVisible ? 'icon-close' : 'search'}.png`}
                                    alt="edit-logo"
                                    title={isContactPersonCardVisible ? 'Закрыть форму просмотра' : 'Посмотреть профиль'}
                                    onClick={() => setIsContactPersonCardVisible(!isContactPersonCardVisible)}
                                    className="cursor-pointer"
                                />
                            </div>
                        </div>

                        {isContactPersonCardVisible && (representPerson.org_rep_phone || representPerson.org_rep_email) && (
                            <>
                                <div className="profile-info__address--title">
                                    {/* <div className="profile-user__card--div"> */}
                                    <div className="">
                                        <div className="fs11 margin-left12px margin-tb12px d-flex flex-sb"><p className='margin-right12px'>Телефон: </p><p>{representPerson.org_rep_phone ?? 'Не указан'}</p></div>
                                        <div className="fs11 margin-left12px margin-tb12px d-flex flex-sb flex-wrap"><p className='margin-right12px'>email:</p><p>{representPerson.org_rep_email ?? 'Нет данных'}</p></div>
                                    </div>
                                </div> 
                                {/* Это просто серая черта (бордер) */}
                                <div className="profile-info__line margin-left12px"></div>
                            </>
                        )}
                    </div>
                </>
            )}
            
        </>
    );
};

export default LegalUserFields;

      