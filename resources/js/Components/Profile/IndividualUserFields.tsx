// resources/js/Components/Profile/IndividualUserFields.tsx

import React, { useState, useCallback, useContext } from 'react';
import { IIndividualUser } from "@/Types/types";
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

interface IIndividualUserFieldsProps { user: IIndividualUser }

export type TEditableField = 'names' | 'phone' | 'birthday' | 'address' | null;

const CONFIRMATION_TITLES: Record<Exclude<TEditableField, null>, string> = {       // Исключаем null
    names   : 'Подтвердите изменение Фамилии и/или Имени',
    phone   : 'Подтвердите изменение Вашего номера телефона',
    birthday: 'Подтвердите изменение Даты рождения',
    address : 'Подтвердите изменение Адреса',
    // null обработаем отдельно
} as const;

export type TFormData = {
    name: string;
    surname: string;
    phone: string;
    birthday: string;
    address: string;
};

type TFieldMapping = {
    surname: 'pers_surname';
    phone: 'pers_tel';
    birthday: 'date_of_birth';
    address: 'delivery_addr_on_default';
    // ... другие поля
};

type TFormErrors = Partial<Record<keyof TFormData, string>>;

const IndividualUserFields: React.FC<IIndividualUserFieldsProps> = ({ user }) => {
    
    // Достаём setUser из контекста
    const { setUser } = useAppContext();

    const [activeForm, setActiveForm] = useState<TEditableField>(null);
    const [formData, setFormData] = useState<TFormData>({
        name: user.name,
        surname: user.pers_surname || '',
        phone: user.pers_tel || '',
        birthday: user.date_of_birth || '',
        address: user.delivery_addr_on_default || ''
    });
    
    const [errors, setErrors] = useState<TFormErrors>({});

    // Базовая валидация при изменении (без debounce). Отказ от debounce: простая валидация на лету (onChange)
    const validateField = (name: string, value: string): boolean => {
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

        case 'address':
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
    
    // Обработчик изменения полей - оптимизация рендеров с помощью useCallback:
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Базовая валидация при изменении (без debounce). Отказ от debounce: простая валидация на лету (onChange)
        validateField(name, value);
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, address: value }));
        
        // Валидация в реальном времени
        validateField('address', value);
    };

    const [initialData, setInitialData] = useState<TFormData>({} as TFormData);

    const handleOpenForm = (formName: TEditableField) => {
        setActiveForm(formName);
        setErrors({});
        
        // Всегда берём актуальные данные из контекста/пропсов
        setFormData({
            name: user?.name || '',
            surname: user?.pers_surname || '',
            phone: user?.pers_tel || '',
            birthday: user?.date_of_birth || '',            // null превращаем в пустую строку
            address: user?.delivery_addr_on_default || ''   // null превращаем в пустую строку
        });

        // Сохраняем текущие данные как исходные
        setInitialData({ ...formData });
    };

    // Добавим отдельное состояние для чекбокса:
    const [shouldDeleteBirthday, setShouldDeleteBirthday] = useState(false);
    const [shouldDeleteData, setShouldDeleteData] = useState(false);

    // Сброс формы при закрытии (к исходным значениям)
    const handleCancel = () => {
        setFormData({
            name: user.name,
            surname: user.pers_surname || '',
            phone: user.pers_tel || '',
            birthday: user.date_of_birth || '',
            address: user.delivery_addr_on_default || ''
        });
        setActiveForm(null);

        shouldDeleteBirthday ? setShouldDeleteBirthday(false) : true;
        shouldDeleteData ? setShouldDeleteData(false) : true;
    };

    const { openModal } = useModal(); 

    // Выносим проверку изменений в отдельную функцию
    const checkChanges = (fields: (keyof TFormData)[]): boolean => {
        const hasFormChanges = fields.some(field => 
            formData[field] !== initialData[field]
        );
        
        // Если пользователь активировал чекбокс - считаем это изменением
        return hasFormChanges || shouldDeleteBirthday;
    };

    // Для кнопки в форме имени - сделал прямо в кнопках
    /*const hasNamesChanges = checkChanges(['name', 'surname']);
    // Для кнопки в форме телефона - сделал прямо в кнопках
    const hasPhoneChanges = checkChanges(['phone']);*/

    // Конфигурация преобразования полей
    const getServerFieldName = (field: keyof TFieldMapping | string): string => {
        const mapping: Record<string, string> = {
            surname : 'pers_surname',           // Клиентское 'surname' -> Серверное 'pers_surname'
            phone   : 'pers_tel',               // Клиентское 'phone' -> Серверное 'pers_tel'       
            birthday: 'date_of_birth',
            address: 'delivery_addr_on_default'
        };
        return mapping[field] || field;         // Если поля нет в маппинге, возвращаем как есть
    };

    const getConfirmationTitle = (formType: Exclude<TEditableField, null>): string => {
        return CONFIRMATION_TITLES[formType] || 'Подтвердите изменение данных';
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShouldDeleteBirthday(e.target.checked);
    };

    const handleCheckboxAddressDelete = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShouldDeleteData(e.target.checked);
    };

    // Отправка формы
    const handleSubmit = async (e: React.FormEvent, fields: (keyof TFormData)[]) => {
        e.preventDefault();
        // console.log('handleSubmit fields', fields);
        // Проверяем, есть ли изменения (дублируем для безопасности) - сделали кнопку неактивной, если нет никаких изменени...
        const hasChanges = (fields: (keyof TFormData)[]): boolean => {
            // console.log('hasChanges', fields);
            const hasFormChanges = fields.some(field => 
                formData[field] !== initialData[field]
            );
            
            // Если пользователь активировал чекбокс - считаем это изменением
            return hasFormChanges || shouldDeleteBirthday;
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
        
        const activeFormNonNull = activeForm ?? 'names';                    // Запасное значение для проверкт на null
        let oldValue, newValue: string | null = '';

        // для получения прежних данных юзера мы должны обратиться к контексту, а там данные юзера указаны в соответствии с наименованиями полей в таблице БД
        // используем здесь: oldValue = user?.[serverFieldName as keyof typeof user] || 'не указано';
        const serverFieldName = getServerFieldName(activeFormNonNull as keyof TFieldMapping | string);
        
        if (activeForm === 'names') {
            oldValue = `${user?.name || ''} ${user?.pers_surname || ''}`.trim() || 'Не указано';
            newValue = `${formData.name} ${formData.surname}`.trim();
        } else if (activeForm === 'birthday') {
            const fieldKey = activeForm as keyof typeof user;
            oldValue = dateRu(user?.date_of_birth)  || 'Не указано';
            newValue = dateRu(formData[fieldKey as keyof TFormData])  || 'Не указано';
        } else {
            const fieldKey = activeForm as keyof typeof user;
            oldValue = user?.[serverFieldName as keyof typeof user] || 'Не указано';
            newValue = formData[fieldKey as keyof TFormData];
        }

        const payload: Record<string, string | null> = {};

        // Обработка удаления даты рождения
        if (shouldDeleteBirthday) {
            payload['date_of_birth'] = null; // Явное указание null для сервера
        } else if (shouldDeleteData) {
            payload['delivery_addr_on_default'] = null; // Явное указание null для сервера
        }
        // Обычные изменения
        else {
            fields.forEach(field => {
            const serverFieldName = getServerFieldName(field);
            payload[serverFieldName] = formData[field];
            });
        }
        // Показываем модалку только если есть реальные изменения (сто тысяч раз проверили уже... :) )
        if (Object.keys(payload).length > 0) {
            openModal(null, 'update', {
                title: 
                    shouldDeleteBirthday ? "Удалить дату рождения из профиля?" : 
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
                onConfirm: async () => {
                    try {
                        // Отправляем только нужные поля
                        /*const payload = fields.reduce((acc, field) => {
                            const serverFieldName = getServerFieldName(field);
                            acc[serverFieldName] = formData[field];
                            return acc;
                        }, {} as Record<string, string>);*/
                        
                        // console.log(payload);
                        const response = await axios.put('/profile', payload);

                        // Важное изменение: обновляем контекст
                        if (response.data.user && setUser) {
                            setUser(response.data.user); // Обновляем глобальное состояние
                        }

                        shouldDeleteBirthday 
                        ? toast.success('Дата рождения удалена!', { icon: '🎂' as unknown as ToastIcon, autoClose: 2000 }) // не работает: иконка не всплывает, но и ошибок нет - пусть останется... :)
                        : shouldDeleteData ? toast.success('Данные адреса удалены из профиля')
                        : toast.success('Данные обновлены!');

                        if (shouldDeleteBirthday) {
                            setFormData(prev => ({ ...prev, birthday: '' }));   // Сбрасываем значение
                            setShouldDeleteBirthday(false);                     // Сбрасываем чекбокс
                        }
                        
                        if (shouldDeleteData) {
                            setFormData(prev => ({ ...prev, address: '' }));    // Сбрасываем значение
                            setShouldDeleteData(false);                         // Сбрасываем чекбокс
                        }



                        setActiveForm(null);
                    } catch (error) {
                        if (axios.isAxiosError(error) && error.response?.data?.errors) {
                        setErrors(error.response.data.errors);
                        toast.error('Ошибка валидации');
                        } else {
                            toast.error('Ошибка при обновлении');
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
            {/* Поле имени и фамилии*/}
            {/* <h4 className="fs11">Пользователь: </h4> */}
            <div className="profile-info__line--title flex-sb fs12">
                <p>{formData.name} {formData.surname}</p> 
                <img src="/storage/icons/edit.png"  
                    alt="edit-logo" 
                    title="Редактировать Фамилию и/или Имя" 
                    onClick={() => activeForm === 'names' ? handleCancel() : handleOpenForm('names')}
                />
            </div>
            { activeForm === 'names' && (
                <div className="profile-changing-form margin-bottom8px">
                    <form onSubmit={(e) => handleSubmit(e, ['name', 'surname'])}>
                        <h6 className="color-red">Корректируем Имя / Фамилию</h6>
                        
                        <label className="fs12" htmlFor="nameprofilechanging">Имя: </label>
                        <input 
                            className={`registration-form__input margin-tb4px ${errors.name ? 'invalid' : ''}`} 
                            type="text"
                            required
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            autoFocus
                            autoComplete="name"
                        />
                        <span className="productAddition-form__clearance">
                            Имя пишется буквами русского алфавита, должно быть длиной от 1 до 30 символов, может содержать пробел и дефис.
                        </span>
                    
                        
                        <label className="fs12" htmlFor="surnameprofilechanging">Фамилия: </label>
                        <input
                            className={`registration-form__input margin-tb4px ${errors.surname ? 'invalid' : ''}`} 
                            type="text"
                            required
                            name="surname"
                            value={formData.surname}
                            onChange={handleChange}
                            autoComplete="surname"
                        />
                        <span className="productAddition-form__clearance">
                            Правила написания фамилии такие же, как и для имени (см.выше).
                        </span>
                        {errors.surname && <div className="color-red margin-top12px">{errors.surname}</div>}
                        
                        <div className="d-flex flex-sa">
                            <button type="submit" className="changing-form__submit-btn" disabled={!checkChanges(['name', 'surname'])}>Изменить</button>
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
                
            {/* Блок телефона */}
            <h4 className="fs11">Контактный номер: </h4>
            <div className="profile-info__line--title flex-sb fs12">
                <p>{user.pers_tel}</p>
                <p>
                    <img 
                        src="/storage/icons/edit.png" 
                        alt="edit-logo" 
                        title="Редактировать номер телефона"
                        onClick={() => activeForm === 'phone' ? handleCancel() : handleOpenForm('phone')}
                    />
                </p>
            </div>
            
            {activeForm === 'phone' && (
                <div className="profile-changing-form margin-bottom8px">
                    <form onSubmit={(e) => handleSubmit(e, ['phone'])}>
                        <h6 className="color-red">Корректируем номер телефона</h6>
                        <label className="fs12" htmlFor="inputprofilecahngingtelnum">
                            Мой новый номер мобильного телефона: 
                        </label>
                        <input
                            className="registration-form__input margin-tb4px"
                            type="tel"
                            required
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            pattern="\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}"
                            placeholder="+7 (XXX) XXX-XX-XX"
                        />
                        <span className="productAddition-form__clearance">
                            Номер телефона вводится в формате: +7 (999) 123-45-67
                        </span>
                        {errors.phone && <div className="color-red margin-top12px">{errors.phone}</div>}
                        <div className="d-flex flex-sa">
                            <button type="submit" className="changing-form__submit-btn" disabled={!checkChanges(['phone'])}>Изменить</button>
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

            {/* Блок даты рождения */}
            <h4 className="fs11">Дата рождения: </h4>
            <div className="profile-info__line--title flex-sb fs12">
                <p>{user.date_of_birth ? dateRu(user.date_of_birth) : 'Не указана'}</p>    
                <p>
                    <img 
                        src="/storage/icons/edit.png" 
                        alt="edit-logo" 
                        title="Указать/удалить дату рождения"
                        onClick={() => activeForm === 'birthday' ? handleCancel() : handleOpenForm('birthday')}
                    />
                </p>
            </div>

            {activeForm === 'birthday' && (
                <div className="profile-changing-form margin-bottom8px">
                    <form onSubmit={(e) => handleSubmit(e, ['birthday'])}>
                        <label className="fs12" htmlFor="inputprofilecahngingbirthday">
                            День моего рождения: 
                        </label>
                        <br />
                        <input
                            // className="registration-form__input margin-tb4px"
                            className={shouldDeleteBirthday ? 'disabled-field registration-form__input margin-tb4px' : 'registration-form__input margin-tb4px'}
                            type="date"
                            name="birthday"
                            value={formData.birthday}
                            onChange={handleChange}
                            disabled={shouldDeleteBirthday} // Блокируем поле ввода при активированном чекбоксе
                        />
                        <span className="productAddition-form__clearance">
                            Если будет указана - мы будем поздравлять Вас с этим событием.
                        </span>

                        {errors.birthday && <div className="color-red margin-top12px">{errors.birthday}</div>}
                        
                        <input 
                            type="checkbox" 
                            id="deletebirthdayfromaccount"
                            name="deletebirthday" 
                            checked={shouldDeleteBirthday}
                            onChange={handleCheckboxChange}
                            hidden
                        />
                        <label htmlFor="deletebirthdayfromaccount" className="checkbox-label">
                            Удалить дату рождения из системы
                        </label>
                        
                        <div className="d-flex flex-sa">
                            <button type="submit" className="changing-form__submit-btn" disabled={!checkChanges(['birthday'])}>Изменить</button>
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

            {/* Блок адреса доставки по умолчанию*/}
            {/*<AddressSection user={user} handleCancel={handleCancel} handleOpenForm={handleOpenForm} handleSubmit={handleSubmit} activeForm={activeForm} />*/}

            <h4 className="fs11">Адрес доставки заказов (по умолчанию): </h4>
            <div className="profile-info__line--title flex-sb fs12">
                <p>{user.delivery_addr_on_default ? (user.delivery_addr_on_default) : 'Не указан'}</p>    
                <img 
                    src="/storage/icons/edit.png" 
                    alt="edit-logo" 
                    title="Редактировать адрес"
                    onClick={() => activeForm === 'address' ? handleCancel() : handleOpenForm('address')}
                />
            </div>

            {activeForm === 'address' && (
                <div id="profilechangingdeliveryaddressdiv" className="profile-changing-form">
                    <form onSubmit={(e) => handleSubmit(e, ['address'])}>
                        <div id="editdeliveryaddressfieldinprofile" className="registration-form__input-item margin-tb4px">
                            <label className="fs12" htmlFor="editdeliveryaddressfieldinprofilediv">
                                Адрес доставки/получения заказов <br/>(по умолчанию): 
                            </label>
                            {/* Поле адреса */}
                            <textarea
                                id="editdeliveryaddressfieldinprofilediv"
                                className={shouldDeleteData ? 'disabled-field registration-form__input-address margin-tb12px' : 'registration-form__input-address margin-tb12px'}
                                // className='registration-form__input-address margin-tb12px'
                                value={formData.address}
                                onChange={handleAddressChange}
                                disabled={shouldDeleteData}
                            />
                            <span className="productAddition-form__clearance">
                                В этот адрес (если он будет здесь указан) будут отправляться заказы. 
                                Адрес можно указать при выборе транспортной компании.
                            </span>

                            {errors.address && <div className="color-red margin-top12px">{errors.address}</div>}
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
                                disabled={((!!errors.address || !checkChanges(['address'])) && (shouldDeleteData && !formData.address))}
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
        </>
    );

};

export default IndividualUserFields;

      