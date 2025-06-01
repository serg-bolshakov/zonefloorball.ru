// resources/js/Components/Profile/IndividualUserFields.tsx

import React, { useState, useCallback, useContext } from 'react';
import { IIndividualUser } from "@/Types/types";
import { toast } from 'react-toastify';
import { Inertia } from '@inertiajs/inertia';
import axios from 'axios';
import useModal from '@/Hooks/useModal';
import useAppContext from '@/Hooks/useAppContext';

interface IIndividualUserFieldsProps { user: IIndividualUser }

type TEditableField = 'names' | 'phone' | 'birthday' | 'address' | null;

type TFormData = {
  name: string;
  surname: string;
  phone: string;
  birthday: string;
  address: string;
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


    const [initialData, setInitialData] = useState<TFormData>({} as TFormData);

    const handleOpenForm = (formName: TEditableField) => {
        setActiveForm(formName);
        setErrors({});
        // Сохраняем текущие данные как исходные
        setInitialData({ ...formData });
    };

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
    };

    const { openModal } = useModal(); 

    // Выносим проверку изменений в отдельную функцию
    const checkChanges = (fields: (keyof TFormData)[]): boolean => {
        return fields.some(field => {
            const serverFieldName = field === 'surname' ? 'pers_surname' : field;
            return formData[field] !== initialData[field];
        });
    };

    // Для кнопки в форме имени
    const hasNamesChanges = checkChanges(['name', 'surname']);

    // Отправка формы
    const handleSubmit = async (e: React.FormEvent, fields: (keyof TFormData)[]) => {
        e.preventDefault();

        // Проверяем, есть ли изменения (дублируем для безопасности) - сделали кнопку неактивной, если нет никаких изменени...
        const hasChanges = fields.some(field => {
            const serverFieldName = field === 'surname' ? 'pers_surname' : field;
            return formData[field] !== initialData[field];
        });

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

        openModal(null, 'update', {
            title: "Подтвердите изменение данных!",
            onConfirm: async () => {
                try {
                    // Отправляем только нужные поля
                    const payload = fields.reduce((acc, field) => {
                    acc[field === 'surname' ? 'pers_surname' : field] = formData[field];
                    return acc;
                    }, {} as Record<string, string>);
                    
                    const response = await axios.put('/profile', payload);

                    // Важное изменение: обновляем контекст
                    if (response.data.user && setUser) {
                        setUser(response.data.user); // Обновляем глобальное состояние
                    }

                    toast.success('Данные обновлены!');
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
                toast.success('Данные остались неизменными');
            }
        });
    };

    return (
        <>
            {/* Поле имени */}
            <div className="profile-info__line--title flex-sb fs11">
                { activeForm === 'names' ? (
                    <form onSubmit={(e) => handleSubmit(e, ['name', 'surname'])} className="profile-changing-form margin-bottom8px">
                        <h6 className="color-red">Корректируем Имя / Фамилию</h6>
                        <div className="registration-form__input-item">
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
                            {errors.name && <div className="color-red margin-top12px">{errors.name}</div>}
                        </div>
                        <div className="registration-form__input-item">
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
                        </div>
                        <div className="d-flex flex-sa">
                            <button type="submit" className="changing-form__submit-btn" disabled={!hasNamesChanges}>Изменить</button>
                            <button 
                                type="button" 
                                className="changing-form__submit-btn"
                                onClick={handleCancel}
                            >
                                Не меняем
                            </button>
                        </div>
                    </form>
                ) : (
                    <p>{formData.name} {formData.surname}</p>   
                )}
                <img src="/storage/icons/edit.png"  
                    alt="edit-logo" 
                    title="Редактировать Фамилию и/или Имя" 
                    onClick={() => activeForm === 'names' ? handleCancel() : handleOpenForm('names')}
                />
            </div>     
        </>
    );

};




export default IndividualUserFields;

      