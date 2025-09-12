// resources/js/Components/Admin/ProductAdditionForms/ProductTypes/Sticks/NewStickFormStep2.tsx

import { useState } from 'react';
import { BRANDS } from '@/Constants/brands';
import useStickProperties from '@/Hooks/useStickProperties';
import { toast } from 'react-toastify';
import { IProduct } from '@/Types/types';
import { TStepNumber } from './AddStickForm';
import { IPropertiesProps } from '@/Hooks/useStickProperties';

// Типы для невалидированной формы (все поля optional)
export type TNewStickFormStep2 = {
    /* поля шага 2 */ 
    title?      : string;
    editedTitle?: string;
    series?     : string[];
    gripId?     : string;
    profileId?  : string;
    bladeModel? : string;
    errors?     : Record<string, string>;
    
    // Поля для добавления новых характеристик
    newGripName?: string;
    newGripBrandId?: string;
    newProfileName?: string;
    newProfileBrandId?: string;
    newBladeName?: string;
    newBladeBrand?: string;
    newBladeBrandId?: string;
};

// Типы для валидированных форм ... с правильными типами полей
export type TValidatedNewStickStep2 = {
  /* все поля шага 2 */ 
    title: string;
    editedTitle : string | null;
    series      : [],
    gripId      : number | null, // здесь будет id-свойства типа обмотки для клюшки
    profileId   : number | null,
    bladeModel  : number | null, // здесь будет id-свойства типа крюка для клюшки
};

interface Step2FormProps {
    state: TNewStickFormStep2;
    errors: Record<string, string>;
    possibleProps: IPropertiesProps | null;
    productId: number;
    similarProduct?: IProduct;
    isReadOnly?: boolean;
    // onChange: (state: Partial<TNewStickFormStep2>) => void;
    onChange?: (data: Partial<TNewStickFormStep2>) => void;
    onSubmit?: () => void;
    isLoading: boolean;
}

const NewStickFormStep2: React.FC<Step2FormProps> = ({
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
    const [showGripForm, setShowGripForm] = useState(false);
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [showBladeForm, setShowBladeForm] = useState(false);
    const [localNewGripError, setLocalNewGripError] = useState<string | null>(null);
    const [localNewBladeError, setLocalNewBladeError] = useState<string | null>(null);
    
    console.log ('possibleProps', possibleProps);
    
    const {
        loading: propsLoading,
        addGrip,
        //addProfile,
        addBladeModelForStick
    } = useStickProperties();

    // Обработчики изменений
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        console.log('start');

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            const currentSeries = state.series || [];
            
            if (checked) {
                onChange?.({ series: [...currentSeries, value] });
            } else {
                onChange?.({ series: currentSeries.filter(id => id !== value) });
            }
        } else {
            onChange?.({ [name]: value });
        }
    };

    const handleEditTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.({ editedTitle: e.target.value });
    };

    // Обработчики добавления новых свойств
    const handleAddGrip = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 1. Синхронная валидация локальной формы
        if(!state.newGripName) {
            setLocalNewGripError('Поле обязательно для заполнения');
            return; // Прерываем если есть ошибки 
        } else if (!/^[A-Z][A-Z\s-]*$/.test(state.newGripName)) {
            setLocalNewGripError('Наименование типа обмотки пишется буквами латинского алфавита, заглавными буквами. Может содержать пробел или дефис между словами');
            return;
        }

        // 2. Конвертация данных
        // Если ошибок при заполнении формы нет, валидируем заполненные поля для отправки на сервер (строковые значения, полученные из формы, мы должны преобразовать в числовые значения (где требуется)):
        const brandIdValidated = Number(state.newGripBrandId);

        try {
            await addGrip({
                name: state.newGripName,
                brandId: brandIdValidated,
            });
            toast.success('Тип обмотки успешно добавлен');
            setShowGripForm(false);
            onChange?.({ newGripName: '', newGripBrandId: '' });
        } catch (error) {
            toast.error('Ошибка при добавлении типа обмотки');
        }
    }; 

    /* const handleAddProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addProfile({
                name: state.newProfileName,
                brandId: state.newProfileBrandId || null
            });
            toast.success('Профиль рукоятки успешно добавлен');
            setShowProfileForm(false);
            onChange({ newProfileName: '', newProfileBrandId: '' });
        } catch (error) {
            toast.error('Ошибка при добавлении профиля рукоятки');
        }
    }; */

    const handleAddBladeModel = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Синхронная валидация локальной формы
            const trimmedName = state.newBladeName?.trim(); 

            if (!trimmedName) {
                setLocalNewBladeError('Поле обязательно для заполнения');
                return;
            }

            if (!/^[\p{L}0-9()\.\s-]+$/u.test(trimmedName)) {                                                      // \p{L} - любые буквы (включая кириллицу)
                setLocalNewBladeError('Наименование должно содержать только цифры, буквы, точки, пробелы и дефисы');
                return;
            }

            // Дополнительная проверка: не начинается ли с дефиса или пробела
            if (/^[-\s]/.test(trimmedName)) {
                setLocalNewBladeError('Название не может начинаться с дефиса или пробела');
                return;
            }

            // Проверка на несколько подряд идущих дефисов или пробелов
            if (/[-\s]{2,}/.test(trimmedName)) {
                setLocalNewBladeError('Нельзя использовать несколько дефисов или пробелов подряд');
                return;
            }

        // 2. Конвертация данных
        // Если ошибок при заполнении формы нет, валидируем заполненные поля для отправки на сервер (строковые значения, полученные из формы, мы должны преобразовать в числовые значения (где требуется)):
        const brandIdValidated = Number(state.newBladeBrandId);

        try {
            await addBladeModelForStick({
                productId: productId,
                name: trimmedName,
                brandId: brandIdValidated,
            });
            toast.success('Модель крюка успешно добавлена');
            setShowBladeForm(false);
            onChange?.({ newBladeName: '', newBladeBrandId: '' });
        } catch (error) {
            toast.error('Ошибка при добавлении модели крюка');
        }
    };

    // Обработчик отправки
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(); // Опциональная цепочка
    };
    
    console.log('loading', isReadOnly);

    return (
        <div className="productAddition">
            {isReadOnly && (
                <div className="readonly-overlay">
                    <span>Режим просмотра</span>
                </div>
            )}
            <form onSubmit={handleSubmit}> 
                <div className="productAddition-form__input-item">
                    <div className="productAddition-form__title">
                        Описание дополнительных характеристик нового товара (шаг 2-й из 4-х). <p className='margin-top12px'> Дополнительные характеристики</p>
                    </div>
                </div>
                <p className="productAddition-form__input-item">
                    <span className="productAddition-form__star">*</span> - поля, обязательные для заполнения
                </p>
                
                {/* Поле: Наименование товара */}
                <div className="productAddition-form__input-item d-flex gap-12">
                    <input 
                        // className="productAddition-form__input-stick-title" 
                        className={`productAddition-form__input-stick-title ${
                            isReadOnly ? 'readonly-input' : ''
                        }`}
                        type="text" 
                        disabled 
                        value={state.title || ''} 
                    />
                    <input
                        // className="productAddition-form__input-stick-title-edit"
                        className={`productAddition-form__input-stick-title-edit ${
                            isReadOnly ? 'readonly-input' : ''
                        }`}
                        type="text"
                        name="editedTitle"
                        placeholder="Здесь можно указать изменённое наименование товара..."
                        value={state.editedTitle || ''}
                        onChange={isReadOnly ? undefined : handleEditTitleChange} // Отключаем изменение
                        readOnly={isReadOnly}
                    />
                    {errors.editedTitle && (
                        <span className="productAddition-error">{errors.editedTitle}</span>
                    )}
                </div>

                {/* Серии */}
                <div className="prop-list productAddition-form__input-radiogroup">
                    <p>14. Проверьте! Возможно товар из какой-либо указанной серии:</p>
                    {possibleProps?.series.map(serie => (
                        <div key={serie.id}>
                            <input
                                type="checkbox"
                                id={`serie_${serie.id}`}
                                name="series"
                                value={serie.id}
                                checked={state.series?.includes(serie.id.toString()) || false}
                                onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
                                readOnly={isReadOnly}
                                disabled={isLoading || propsLoading}
                            />
                            <label htmlFor={`serie_${serie.id}`}>{serie.prop_value_view}</label>
                        </div>
                    ))}
                    {errors.series && (
                        <span className="productAddition-error">{errors.series}</span>
                    )}
                </div>

                {/* Тип обмотки */}
                <div className="productAddition-form__input-item productAddition-form__input-radiogroup">
                    <p>15. Укажите тип обмотки клюшки:
                        <span className="productAddition-error margin-left8px">
                            *
                            {errors?.gripId && (
                            <>
                                <br />
                                {errors?.gripId}
                            </>
                            )}
                        </span>
                    </p>
                    {possibleProps?.grips.map(grip => (
                        <div key={grip.id}>
                            <input
                                type="radio"
                                id={`grip_${grip.id}`}
                                name="gripId"
                                value={grip.id}
                                checked={state.gripId === grip.id.toString()}
                                onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
                                readOnly={isReadOnly}
                                disabled={isLoading || propsLoading}
                            />
                            <label htmlFor={`grip_${grip.id}`}>{grip.prop_value_view}</label>
                        </div>
                    ))}
                    <div>
                        <input
                            type="radio"
                            id="grip_none"
                            name="gripId"
                            value="0"
                            checked={state.gripId === '0'}
                            onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
                            readOnly={isReadOnly}
                            disabled={isLoading || propsLoading}
                        />
                        <label htmlFor="grip_none">Значение не указано (пустое)</label>
                    </div>
                    {errors.gripId && (
                        <span className="productAddition-error">{errors.gripId}</span>
                    )}
                    
                    <button
                        type="button"
                        className="productAddition-form__submit-btn-out"
                        onClick={() => setShowGripForm(!showGripForm)}
                        disabled={isLoading || propsLoading}
                    >
                        Добавить новый тип
                    </button>

                    {showGripForm && (
                        <div className="addition-new-prop-form">
                            <p className="registration-form__input-item">
                                <span className="registration-form__title">
                                    Добавление нового типа обмотки
                                </span>
                            </p>
                            <div className="registration-form__input-item">
                                <label htmlFor="newGripName">Наименование типа обмотки:</label>
                                <span className="productAddition-error margin-left8px">
                                    *
                                    {localNewGripError && (
                                        <>
                                        <br />
                                        {localNewGripError}
                                        </>
                                    )}
                                </span>

                                <input
                                    className="registration-form__input margin-top12px"
                                    type="text"
                                    id="newGripName"
                                    name="newGripName"
                                    value={state.newGripName || ''}
                                    onChange={(e) => onChange?.({ newGripName: e.target.value })}
                                    required
                                />
                            </div>
                                                        
                            <div className="productAddition-form__input-radiogroup">
                                <label>Укажите бренд:</label>
                                <div>
                                    <input
                                        className='margin-top12px'
                                        type="radio"
                                        id="gripBrandAny"
                                        name="newGripBrandId"
                                        value="0"
                                        checked={!state.newGripBrandId || state.newGripBrandId === '0'}
                                        onChange={(e) => onChange?.({ newGripBrandId: e.target.value })}
                                    />
                                    <label htmlFor="gripBrandAny">Подходит для любого бренда</label>
                                </div>
                                {Object.values(BRANDS).map(brand => (
                                    <div key={`grip-brand-${brand.id}`}>
                                        <input
                                            type="radio"
                                            id={`gripBrand_${brand.id}`}
                                            name="newGripBrandId"
                                            value={String(brand.id)} // Конвертируем в строку // Всегда строка в DOM!
                                            checked={state.newGripBrandId === brand.id.toString()}
                                            onChange={(e) => onChange?.({ newGripBrandId: e.target.value })}
                                        />
                                        <label htmlFor={`gripBrand_${brand.id}`}>{brand.name}</label>
                                    </div>
                                ))}
                            </div>
                            <div className='margin-top12px'>
                                <button 
                                    type="submit" 
                                    className="registration-form__submit-btn margin-right12px"
                                    onClick={handleAddGrip}
                                    >
                                    Добавить
                                </button>
                                <button
                                    type="button"
                                    className="registration-form__submit-btn"
                                    onClick={() => setShowGripForm(false)}
                                >
                                    Отменить
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Профиль рукоятки */}
                <div className="productAddition-form__input-item productAddition-form__input-radiogroup">
                    <p>16. Выберите профиль рукоятки клюшки:
                        <span className="productAddition-error margin-left8px">
                            *
                            {errors?.profileId && (
                            <>
                                <br />
                                {errors?.profileId}
                            </>
                            )}
                        </span>
                    </p>
                    {possibleProps?.profiles.map(profile => (
                        <div key={profile.id}>
                            <input
                                type="radio"
                                id={`profile_${profile.id}`}
                                name="profileId"
                                value={profile.id}
                                checked={state.profileId === profile.id.toString()}
                                onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
                                readOnly={isReadOnly}
                                disabled={isLoading || propsLoading}
                            />
                            <label htmlFor={`profile_${profile.id}`}>{profile.prop_value_view}</label>
                        </div>
                    ))}
                    <div>
                        <input
                            type="radio"
                            id="profile_none"
                            name="profileId"
                            value="0"
                            checked={state.profileId === '0'}
                            onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
                            readOnly={isReadOnly}
                            disabled={isLoading || propsLoading}
                        />
                        <label htmlFor="profile_none">Значение не указано (пустое)</label>
                    </div>
                    {errors.profileId && (
                        <span className="productAddition-error">{errors.profileId}</span>
                    )}
                    
                    <button
                        type="button"
                        className="productAddition-form__submit-btn-out"
                        onClick={() => setShowProfileForm(!showProfileForm)}
                        disabled={isLoading || propsLoading}
                    >
                        Добавить профиль
                    </button>

                    {/* {showProfileForm && (
                        <div className="addition-new-prop-form">
                            <form onSubmit={handleAddProfile}>
                                <p className="registration-form__input-item">
                                    <span className="registration-form__title">
                                        Добавление нового профиля рукоятки
                                    </span>
                                </p>
                                <p className="registration-form__input-item">
                                    <label htmlFor="newProfileName">Наименование профиля:</label>
                                    <input
                                        className="registration-form__input"
                                        type="text"
                                        id="newProfileName"
                                        name="newProfileName"
                                        value={state.newProfileName || ''}
                                        onChange={(e) => onChange({ newProfileName: e.target.value })}
                                        required
                                    />
                                </p>
                                
                                <div className="productAddition-form__input-radiogroup">
                                    <label>Укажите бренд:</label>
                                    <div>
                                        <input
                                            type="radio"
                                            id="profileBrandAny"
                                            name="newProfileBrandId"
                                            value="0"
                                            checked={!state.newProfileBrandId || state.newProfileBrandId === '0'}
                                            onChange={(e) => onChange({ newProfileBrandId: e.target.value })}
                                        />
                                        <label htmlFor="profileBrandAny">Подходит для любого бренда</label>
                                    </div>
                                    {Object.values(BRANDS).map(brand => (
                                        <div key={`profile-brand-${brand.id}`}>
                                            <input
                                                type="radio"
                                                id={`profileBrand_${brand.id}`}
                                                name="newProfileBrandId"
                                                value={String(brand.id)} // Конвертируем в строку // Всегда строка в DOM!
                                                checked={state.newProfileBrandId === brand.id.toString()}
                                                onChange={(e) => onChange({ newProfileBrandId: e.target.value })}
                                            />
                                            <label htmlFor={`profileBrand_${brand.id}`}>{brand.name}</label>
                                        </div>
                                    ))}
                                </div>
                                
                                <button type="submit" className="registration-form__submit-btn">
                                    Добавить
                                </button>
                                <button
                                    type="button"
                                    className="registration-form__submit-btn"
                                    onClick={() => setShowProfileForm(false)}
                                >
                                    Отменить
                                </button>
                            </form>
                        </div>
                    )} */}
                </div>

                {/* Модель крюка */}
                <div className="productAddition-form__input-item productAddition-form__input-radiogroup">
                    <p>17. Модель крюка, которым комплектуется клюшка: 
                        <span className="productAddition-error margin-left8px">
                            *
                            {errors?.bladeModel && (
                            <>
                                <br />
                                {errors?.bladeModel}
                            </>
                            )}
                        </span>
                    </p>
                    {possibleProps?.bladeModels.map(model => (
                        <div key={model.id}>
                            <input
                                type="radio"
                                id={`blade_${model.id}`}
                                name="bladeModel"
                                value={model.id}
                                checked={state.bladeModel === model.id.toString()}
                                onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
                                readOnly={isReadOnly}
                                disabled={isLoading || propsLoading}
                            />
                            <label htmlFor={`blade_${model.id}`}>{model.prop_value_view}</label>
                        </div>
                    ))}
                    <div>
                        <input
                            type="radio"
                            name="bladeModel"
                            value="0"
                            checked={state.bladeModel === '0'}
                            onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
                            readOnly={isReadOnly}
                            disabled={isLoading || propsLoading}
                        />
                        <label htmlFor="blade_none">Значение не указано (пустое)</label>
                    </div>
                    {errors.bladeModel && (
                        <span className="productAddition-error">{errors.bladeModel}</span>
                    )}
                    
                    <button
                        type="button"
                        className="productAddition-form__submit-btn-out"
                        onClick={() => setShowBladeForm(!showBladeForm)}
                        disabled={isLoading || propsLoading}
                    >
                        Добавить модель крюка
                    </button>

                    {showBladeForm && (
                        <div className="addition-new-prop-form">
                            <p className="registration-form__input-item">
                                <span className="registration-form__title">
                                    Добавление новой модели крюка
                                </span>
                            </p>

                            <div className="registration-form__input-item">
                                <label htmlFor="newBladeName">Наименование модели крюка:</label>
                                <span className="productAddition-error margin-left8px">
                                *
                                {localNewBladeError && (
                                        <>
                                        <br />
                                        {localNewBladeError}
                                        </>
                                    )}
                                </span>
                                <span className="productAddition-form__clearance">
                                    Модель пишется латинскими заглавными буквами (как в оригинале), далее: состав и прописью жёсткость (прописными буквами). Пример: EPIC PE REGULAR
                                </span>

                                <input
                                    className="registration-form__input  margin-top12px"
                                    type="text"
                                    id="newBladeName"
                                    name="newBladeName"
                                    value={state.newBladeName || ''}
                                    onChange={(e) => onChange?.({ newBladeName: e.target.value })}
                                    required
                                />
                            </div>
                            
                            <div className="productAddition-form__input-radiogroup">
                                <label>Укажите бренд:</label>
                                <div className='margin-top12px'>
                                    <input
                                        type="radio"
                                        id="bladeBrandAny"
                                        name="newBladeBrandId"
                                        value="0"
                                        checked={!state.newBladeBrandId || state.newBladeBrandId === '0'}
                                        onChange={(e) => onChange?.({ newBladeBrandId: e.target.value })}
                                    />
                                    <label htmlFor="bladeBrandAny">Подходит для любого бренда</label>
                                </div>
                                {Object.values(BRANDS).map(brand => (
                                    <div key={`blade-brand-${brand.id}`}>
                                        <input
                                            type="radio"
                                            id={`bladeBrand_${brand.id}`}
                                            name="newBladeBrandId"
                                            value={String(brand.id)} // Конвертируем в строку // Всегда строка в DOM!
                                            checked={state.newBladeBrandId === brand.id.toString()}
                                            onChange={(e) => onChange?.({ newBladeBrandId: e.target.value })}
                                        />
                                        <label htmlFor={`bladeBrand_${brand.id}`}>{brand.name}</label>
                                    </div>
                                ))}
                            </div>
                            
                            <div className='margin-top12px'>
                                <button 
                                    type="submit" 
                                    className="registration-form__submit-btn margin-right12px"
                                    onClick={handleAddBladeModel}
                                    >
                                    Добавить
                                </button>
                                <button
                                    type="button"
                                    className="registration-form__submit-btn"
                                    onClick={() => setShowBladeForm(false)}
                                >
                                    Отменить
                                </button>
                            </div>
                        </div>
                    )} 
                </div>

                {/* Кнопки скрываем в read-only режиме */}
                {!isReadOnly && onSubmit && (
                    <div className="form-actions">
                        <button
                            type="submit" 
                            className="productAddition-form__submit-btn"
                            disabled={isLoading || propsLoading}
                        >
                            Сохранить и ввести цены
                        </button>
                        <button
                            type="button"
                            className="productAddition-form__submit-btn"
                            onClick={() => onChange?.({
                                series: [],
                                gripId: '',
                                profileId: '',
                                bladeModel: '',
                                editedTitle: ''
                            })}
                            disabled={isLoading}
                        >
                            Очистить форму
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default NewStickFormStep2;