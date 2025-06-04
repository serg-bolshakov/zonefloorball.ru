// resources/js/Components/Profile/AddrssSection.tsx
import { IIndividualUser } from "@/Types/types";
import React, { useState, useEffect, useContext } from 'react';
import { validateAddress } from "@/Utils/formFieldsValidation";

type TEditableField = 'names' | 'phone' | 'birthday' | 'address' | null; // Уточняем только нужные поля
type TFormData = { address: string; };

interface IAddrssSectionProps { 
    user: IIndividualUser;
    handleCancel: () => void; 
    handleOpenForm: (formName: TEditableField) => void;
    handleSubmit: (e: React.FormEvent, fields: (keyof TFormData)[]) => void;
    activeForm: TEditableField;
}

const AddrssSection: React.FC<IAddrssSectionProps> = ({ user, handleOpenForm, handleCancel, handleSubmit, activeForm }) => {

    const [errors, setErrors] = useState<{ address?: string }>({});

    const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setFormState(prev => ({ ...prev, address: value }));
        
        // Валидация в реальном времени
        const error = validateAddress(value);
        setErrors(prev => ({ ...prev, address: error || undefined }));
    };

    const [formState, setFormState] = useState({
        address: user.delivery_addr_on_default || '',
        shouldDelete: false,
        isHuman: false
    });

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    // Обработчик отправки формы:
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Финализируем валидацию
        const addressError = validateAddress(formState.address);
        if (addressError) {
            setErrors({ address: addressError });
            return;
        }

        if (!formState.isHuman) {
            setErrors({ address: 'Подтвердите, что вы не робот' });
            return;
        }

        // Подготовка payload
        const payload = {
            delivery_addr_on_default: formState.shouldDelete 
            ? null 
            : formState.address
        };

        // Отправка данных
        handleSubmit(e, ['address']);
    };
    
    // Используем useEffect для синхронизации:
    useEffect(() => {
        if (activeForm !== 'address') {
            setFormState({
            address: user.delivery_addr_on_default || '',
            shouldDelete: false,
            isHuman: false
            });
        }
    }, [activeForm, user.delivery_addr_on_default]);

    return (
        <>
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
                    <form onSubmit={handleFormSubmit}>
                        <div id="editdeliveryaddressfieldinprofile" className="registration-form__input-item margin-tb4px">
                            <label className="fs12" htmlFor="editdeliveryaddressfieldinprofilediv">
                                Адрес доставки/получения заказов <br/>(по умолчанию): 
                            </label>
                            {/* Поле адреса */}
                            <textarea
                                id="editdeliveryaddressfieldinprofilediv"
                                className={formState.shouldDelete ? 'disabled-field registration-form__input-address margin-tb12px' : 'registration-form__input-address margin-tb12px'}
                                value={formState.address}
                                onChange={handleAddressChange}
                                disabled={formState.shouldDelete}
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
                                name="shouldDelete"
                                hidden
                                checked={formState.shouldDelete}
                                onChange={handleCheckboxChange}
                            />
                            <label htmlFor="deletedeliveryaddressfromaccount" className="fs12">
                                Удалить данные адреса из системы
                            </label>
                        </div>

                        <div>
                            {/* Капча */}
                            <input 
                                type="checkbox"
                                id="checkchangingaddringprofile" 
                                name="isHuman"
                                checked={formState.isHuman}
                                onChange={handleCheckboxChange}
                                hidden
                            />
                            <label htmlFor="checkchangingaddringprofile" className="fs12">
                                Я не робот
                            </label>
                        </div>

                        {/* Кнопки */}
                        <div className="d-flex flex-sa">
                            <button 
                                type="submit" 
                                disabled={!formState.isHuman || Object.keys(errors).length > 0} 
                                className="changing-form__submit-btn"
                            >
                                {formState.shouldDelete ? 'Удалить' : 'Сохранить'}
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

export default AddrssSection;