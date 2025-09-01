// resources/js/Components/Admin/ProductAdditionForms/ProductTypes/Sticks/NewStickFormStep3.tsx
import React, { useState, useEffect } from 'react';
import { IPropertiesProps } from '@/Hooks/useStickProperties';
import { IProduct } from '@/Types/types';


// Типы для невалидированной формы (все поля optional)
export type TNewStickFormStep3 = {
    /* поля шага 3 */ 
    regularPrice?: string;
    specialPrice?: string;
    specialPriceDateStart?: string;
    specialPriceDateFinish?: string;
    errors?: Record<string, string>;
};

// Типы для валидированных форм ... с правильными типами полей
export type TValidatedNewStickStep3 = {
  /* все поля шага 3 */ 
    regularPrice: string;
    specialPrice: string | null;
    specialPriceDateStart: string | null;
    specialPriceDateFinish: string | null;
};


interface Step3FormProps {
    state: TNewStickFormStep3;
    errors: Record<string, string>;
    possibleProps: IPropertiesProps | null;
    productId: number;
    similarProduct?: IProduct;
    isReadOnly?: boolean;
    onChange?: (data: Partial<TNewStickFormStep3>) => void;
    onSubmit?: () => void;
    isLoading: boolean;
}

const NewStickFormStep3: React.FC<Step3FormProps> = ({
    state,
    errors,
    possibleProps,
    productId,
    similarProduct,
    isReadOnly = false, // По умолчанию не read-only
    onChange,
    onSubmit,
    isLoading
}) => {
  
    // Обработчик отправки
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(); // Опциональная цепочка
    };

    // Обработчики изменений
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        // console.log('start');
        onChange?.({ [name]: value });
    };

    return (
        <div className="productAddition">
            
            {isReadOnly && (
                <div className="readonly-overlay">
                    <span>Режим просмотра</span>
                </div>
            )}

            {!isReadOnly && (
                <div className="readonly-overlay">
                    <span>Режим редактирования. Здесь вы вводите основные варианты цен</span>
                </div>
            )}

            <p className="productAddition-form__input-item">
                <span className="productAddition-form__title">
                Здесь мы установим цены (шаг 3-й из четырёх) и останется загрузить изображения товара
                </span>
            </p>
        
            <p className="productAddition-form__input-item">
                <span className="productAddition-form__star">*</span> - поля, обязательные для заполнения
            </p>

            <form onSubmit={handleSubmit}> 
                {/* Поле регулярной цены */}
                <div className="productAddition-form__input-item productAddition-form__input-radiogroup">
                    <label htmlFor="regularPrice">
                        18. Цена регулярная (рекомендованная производителем розничная цена) в рублях РФ:&nbsp;&nbsp;&nbsp;
                    </label>
                    
                    <input
                        className={`productAddition-button__stage3 productAddition-form__input productAddition-form__input-price ${
                            isReadOnly ? 'readonly-input' : ''
                        }`}
                        type="text"
                        name="regularPrice"
                        value={state.regularPrice}
                        onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
                        required
                        readOnly={isReadOnly}
                    />
                        
                    <span className="productAddition-error margin-left8px">
                        *
                        {errors?.regularPrice && (
                        <>
                            <br />
                            {errors?.regularPrice}
                        </>
                        )}
                    </span>
                    
                    <span className="productAddition-form__clearance">
                        Пример: 399.99 - номинал должен быть выражен в цифрах, длиной от 1-го до 8-ми символов, 
                        содержать только цифры и точку, если выделены копейки
                    </span>
                </div>

                {/* Поле специальной цены и дат */}
                <div className="">
                    <label htmlFor="specialPrice">
                        19. Цена специальная (цена со скидкой) в рублях РФ:&nbsp;&nbsp;&nbsp;
                    </label>
                    
                    <input
                        className={`productAddition-form__input productAddition-form__input-price ${
                            isReadOnly ? 'readonly-input' : ''
                        }`}
                        type="text"
                        name="specialPrice"
                        value={state.specialPrice}
                        onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
                        readOnly={isReadOnly}
                    />
                    
                    <label htmlFor="specialPriceDateStart">
                        Дата начала действия скидки:&nbsp;&nbsp;&nbsp;
                    </label>
                    
                    <input
                        // className="productAddition-form__input productAddition-form__input-price-date"
                        className={`productAddition-form__input productAddition-form__input-price-date ${
                            isReadOnly ? 'readonly-input' : ''
                        }`}
                        type="date"
                        name="specialPriceDateStart"
                        value={state.specialPriceDateStart}
                        onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
                        readOnly={isReadOnly}
                    />

                    <label htmlFor="specialPriceDateFinish">
                        Дата окончания действия скидки:&nbsp;&nbsp;&nbsp;
                    </label>
                    
                    <input
                        // className="productAddition-form__input productAddition-form__input-price-date"
                        className={`productAddition-form__input productAddition-form__input-price-date ${
                            isReadOnly ? 'readonly-input' : ''
                        }`}
                        type="date"
                        name="specialPriceDateFinish"
                        value={state.specialPriceDateFinish}
                        onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
                        readOnly={isReadOnly}
                    />
                    
                    <br/>
                    
                    {errors.specialPrice && (
                        <span className="productAddition-error">
                        {errors.specialPrice}
                        </span>
                    )}
                    
                    <span className="productAddition-form__clearance">
                        <br/>
                        Если не указана дата окончания акции - скидка применяется автоматически без ограничения срока. 
                        Если дата начала пустая - скидка применяется сразу, с момента опубликования.
                    </span>
                </div>

                {/* Кнопки скрываем в read-only режиме */}
                {!isReadOnly && onSubmit && (
                    <div className="form-actions d-flex gap-12 margin-top12px">
                        <button
                            type="submit"
                            className="productAddition-button__stage3 productAddition-form__submit-btn"
                        >
                            Утвердить цены
                        </button>
                        
                        <button
                            type="reset"
                            className="productAddition-button__stage3 productAddition-form__submit-btn"
                            onClick={() => onChange?.({
                                regularPrice: '',
                                specialPrice: '',
                                specialPriceDateStart: '',
                                specialPriceDateFinish: ''
                            })}
                            disabled={isLoading}
                        >
                            Очистить форму
                        </button>
                    </div>
                )}
            </form>

            {/* Кнопка отмены */}
            {!isReadOnly && onSubmit && (
                <button
                    type="button"
                    className="productAddition-button__stage3 productAddition-form__submit-btn-out"
                    // onClick={onCancel}
                >
                    Отменить оформление нового товара и выйти
                </button>
            )}
        </div>
    );
};

export default NewStickFormStep3;