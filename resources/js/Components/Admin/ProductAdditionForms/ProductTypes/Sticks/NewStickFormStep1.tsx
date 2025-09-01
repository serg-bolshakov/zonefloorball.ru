// resources/js/Components/Admin/ProductAdditionForms/ProductTypes/Sticks/NewStickFormStep1.tsx
// TODO: Сделать проверку: Проверьте, заполнены ли поля "Марка" или "Модель" - одно их них должно быть заполнено обязательно. Другие поля, отмеченные "звёздочкой"?';

import React from 'react';
import { BRANDS } from '@/Constants/brands';
import { SHAFT_FLEXES, SHAFT_LENGTHS, STICK_SIDES } from '@/Constants/stickProps';
import { CERTIFICATION_OPTIONS } from '@/Constants/iff';
import { toast } from 'react-toastify';
import { IProduct } from '@/Types/types';
import { validateStep } from '@/Utils/validators/stickFormValidators';

// Типы для невалидированной формы (все поля optional)
export type TNewStickFormStep1 = {
    /* поля шага 1 */ 
    article    : string;
    brandId    : string;                   // Храним как строку (значение из input.value)
    model      : string;
    marka      : string;
    shaftFlexId: string;                   // Храним как строку (значение из input.value)
    colour     : string;
    material   : string;
    stickSizeId: string;                   // Храним как строку (значение из input.value)
    weight     : string;                   // Храним как строку (значение из input.value)
    prod_desc  : string;
    hookId     : string;                   // Храним как строку (значение из input.value)
    iffId      : string;                   // Храним как строку (значение из input.value)
    errors     : Record<string, string>;
};

// Типы для валидированных форм ... с правильными типами полей
export type TValidatedNewStickStep1 = {
  /* все поля шага 1 */ 
    article: string;
    categoryId: number,
    brandId: number;                        // Отправляем как число
    model: string | null;
    marka: string | null;
    shaftFlexId: number;                    // Отправляем как число
    colour: string | null;
    material: string | null;
    stickSizeId: number;                   // Отправляем как число      
    weight: string | null;
    prod_desc: string | null;
    hookId: number;                         // Отправляем как число
    iffId: number;                          // Отправляем как число
};

// Типы для валидированных форм ... с правильными типами полей
export type TValidatedNewStickStep1ForSimilar = {
  /* поля шага 1 для поиска возможного дубликата товара в БД */ 
    article: string;
    brandId: number;                        // Отправляем как число
    model: string | null;
    marka: string | null;
    shaftFlexId: number;                    // Отправляем как число
    colour: string | null;
};

interface Step1FormProps {
    data: TNewStickFormStep1;
    errors: Record<string, string>;
    similarProduct?: IProduct;
    isReadOnly?: boolean;
    onChange?: (data: Partial<TNewStickFormStep1>) => void;
    onCheckSimilar?: () => void;
    onSubmit?: () => void;
    isLoading: boolean;
}

const NewStickFormStep1: React.FC<Step1FormProps> = ({
    data,
    errors,
    similarProduct,
    isReadOnly = false, // По умолчанию не read-only
    onChange,
    onCheckSimilar,
    onSubmit,
    isLoading,
}) => {

  // Обработчик изменений
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log('name', name);
    console.log('value', value);
    onChange?.({ [e.target.name]: e.target.value });  // Опциональная цепочка
  };
  
  // Обработчик отправки
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // // Проверяем ошибки после обновления состояния
    //   const step1Errors = validateStep(1, data);

    //   if (Object.keys(step1Errors).length > 0) {
    //       // изменяем состояние ошибоу
    //       dispatch({ type: 'VALIDATE_STEP', step: 1 });

    //       toast.error('Исправьте ошибки в форме');
    //       return;
    //   }

    onSubmit?.(); // Опциональная цепочка
  };

  const handleCheckSimilarClick = () => {
      onCheckSimilar?.();
  };

  return (
    <div className="productAddition">
      {isReadOnly && (
          <div className="readonly-overlay">
              <span>Режим просмотра</span>
          </div>
      )}

      <form onSubmit={handleSubmit}> 
        <p className="productAddition-form__input-item">
          <span className="productAddition-form__title">
            Добавление новой клюшки в базу данных (шаг 1-й из 4-х).
            Общая информация
          </span>
        </p>
        <p className="productAddition-form__input-item">
          <span className="productAddition-form__star">*</span> - поля, обязательные для заполнения
        </p>
        
        {/* Поле: Артикул */}
        <div className="productAddition-form__input-item">
          <label htmlFor="article">1. Артикул:&nbsp;&nbsp;&nbsp;</label>
          <input
            // className="productAddition-form__input productAddition-form__input-article"
            className={`productAddition-form__input ${
                isReadOnly ? 'readonly-input' : ''
            }`}
            type="text"
            name="article"
            value={data.article}
            onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
            required
            readOnly={isReadOnly}
          />
          
          <span className="productAddition-error margin-left8px">
            *
            {errors?.article && (
              <>
                <br />
                {errors?.article}
              </>
            )}
          </span>
          <span className="productAddition-form__clearance">
            должен быть длиной от 4 до 8 символов, содержать только цифры
          </span>
        </div>

        {/* Поле: Бренд */}
        <div className="productAddition-form__input-item">
          <label>2. Укажите бренд товара:&nbsp;&nbsp;&nbsp;</label>
          {Object.values(BRANDS).map(brand => (
            <label key={`brand-${brand.id}`} className='margin-right12px'>
              <input
                type="radio"
                name="brandId"
                value={String(brand.id)} // Конвертируем в строку // Всегда строка в DOM!
                checked={data.brandId === String(brand.id)}
                // onChange={handleChange}
                onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
                readOnly={isReadOnly}
              />
              {brand.name}
            </label>
          ))}
          <span className="productAddition-error margin-left8px">
            *
            {errors?.brandId && (
              <>
                <br />
                {errors?.brandId}
              </>
            )}
          </span>
        </div>

        {/* Модель */}
        <div className="productAddition-form__input-item">
          <label htmlFor="model">3. Модель клюшки:&nbsp;&nbsp;&nbsp;</label>
          <input
            // className="productAddition-form__input productAddition-form__input-model"
            className={`productAddition-form__input productAddition-form__input-model ${
                isReadOnly ? 'readonly-input' : ''
            }`}
            type="text"
            name="model"
            value={data.model}
            onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
            readOnly={isReadOnly}
          />
          <span className="productAddition-form__clearance">
            <br/>обычно совпадает с моделью крюка, содержит буквы (возможно цифры или в конце знак +). 
            Модель пишется заглавными буквами. Жёсткость - строчными (маленькими)
          </span>
        </div>
        
        {/* Марка */}
        <div className="productAddition-form__input-item">
            <label htmlFor="marka">4. Марка:&nbsp;&nbsp;&nbsp;</label>
            <input 
              // className="productAddition-form__input productAddition-form__input-marka" 
              className={`productAddition-form__input productAddition-form__input-marka ${
                isReadOnly ? 'readonly-input' : ''
            }`}
              type="text" 
              name="marka"
              value={data.marka}
              onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
              readOnly={isReadOnly}
            />
            {errors?.marka && (
              <span className="productAddition-error">*<br/>{errors?.marka}</span>
            )}
            <span className="productAddition-form__clearance"><br />Марка клюшки обычно указана на рукоятке, должна состоять из латинских букв, возможно указание спец символов (градусов кривизны рукоятки).</span>
        </div>

        {/* Жёсткость рукоятки */}
        <label>5. Выберите заявленную жёсткость рукоятки (flex, мм.):&nbsp;&nbsp;&nbsp;</label>
        <div className="productAddition-form__input-item productAddition-form__input-item-set">  
            {Object.values(SHAFT_FLEXES).map(flex => (
              <div key={`shaft-flex-${flex.id}`} className='productAddition-form__input-shaftFlex-block'>
                <label>{flex.name}</label>
                <input
                  className="productAddition-form__input-shaftFlex" 
                  type="radio"
                  name="shaftFlexId"
                  value={String(flex.id)} // Конвертируем в строку // Всегда строка в DOM!
                  checked={data.shaftFlexId === String(flex.id)}
                  onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
                  readOnly={isReadOnly}
                />
              </div>
            ))}
            <span className="productAddition-error margin-left8px">
            *
            {errors?.shaftFlexId && (
              <>
                <br />
                {errors?.shaftFlexId}
              </>
            )}
          </span>
        </div>

        {/* Цвет */}
        <div className="productAddition-form__input-item">
            <label htmlFor="model">6. Укажите цвет товара:&nbsp;&nbsp;&nbsp;</label>
            <input 
              // className="productAddition-form__input productAddition-form__input-colour"
              className={`productAddition-form__input productAddition-form__input-colour ${
                  isReadOnly ? 'readonly-input' : ''
              }`}
              type="text"
              name="colour"
              value={data.colour}
              onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
              readOnly={isReadOnly}
            />
            {errors?.colour && (
              <span className="productAddition-error">*<br/>{errors?.colour}</span>
            )}
            <span className="productAddition-form__clearance"><br />Цвет клюшки - это обычно многоцветие. Должно состоять из латинских букв, возможны пробелы и косая черта или дефис для выражения многообразия цветов. Пример: dark blue/neon orange</span>
        </div>
        
        {/* Кнопка проверки */}
            {!isReadOnly && onCheckSimilar && (
                <button 
                    type="button" 
                    className={`${isLoading ? 'productAddition-form__submit-btn-out basket-button_disabled' : 'productAddition-form__submit-btn-out'}`}
                    onClick={handleCheckSimilarClick}
                    disabled={isLoading}
                >
                    Проверить похожие
                </button>
            )}

        {/* Материал */}
        <div className="productAddition-form__input-item">
            <label htmlFor="material">7. Укажите состав рукоятки (материал):&nbsp;&nbsp;&nbsp;</label>
            <input 
              // className="productAddition-form__input productAddition-form__input-material"
              className={`productAddition-form__input productAddition-form__input-material ${
                  isReadOnly ? 'readonly-input' : ''
              }`}
              type="text"
              name="material"
              value={data.material}
              onChange={handleChange}
            />
            {errors?.material && (
              <span className="productAddition-error">*<br/>{errors?.material}</span>
            )}
            <span className="productAddition-form__clearance"><br />Если состав материала интепретируется на русском языке и понятно покупателю - оно указывается на нём. Иначе - на языке оригинала. Строчными (маленькими) буквами. Пример: карбоновое волокно 95%, стекловолокно 5%</span>
        </div>

        {/* Длина рукоятки */}
        <label>8. Выберите заявленную длину рукоятки (см.):&nbsp;&nbsp;&nbsp;</label>
        <div className="productAddition-form__input-item productAddition-form__input-item-set">  
            {Object.values(SHAFT_LENGTHS).map(length => (
              <div key={`shaft-length-${length.id}`} className='productAddition-form__input-stickSize-block'>
                <label>{length.name}</label>
                <input
                  className="productAddition-form__input-stickSize" 
                  type="radio"
                  name="stickSizeId"
                  value={String(length.id)} // Конвертируем в строку // Всегда строка в DOM!
                  checked={data.stickSizeId === String(length.id)}
                  onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
                  readOnly={isReadOnly}
                />
              </div>
            ))}
          
            <span className="productAddition-error margin-left8px">
              *
              {errors?.stickSizeId && (
                <>
                  <br />
                  {errors?.stickSizeId}
                </>
              )}
            </span>
        </div>

        {/* Вес товара без упаковки */}
        <div className="productAddition-form__input-item">
            <label>9. Вес товара без упаковки (г.):&nbsp;&nbsp;&nbsp;</label>
            <input
              // className="productAddition-form__input productAddition-form__input-weight"
              className={`productAddition-form__input productAddition-form__input-weihgt ${
                  isReadOnly ? 'readonly-input' : ''
              }`}
              type="text"
              name="weight"
              value={data.weight}
              onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
              readOnly={isReadOnly}
            />
            {errors?.weight && (
              <span className="productAddition-error">*<br/>{errors?.weight}</span>
            )}
            <span className="productAddition-form__clearance">должен быть длиной от 1 до 5 символов, содержать только цифры</span>
        </div>

        <label>10. Описание товарной позиции:&nbsp;&nbsp;&nbsp;</label>
        <div className="productAddition-form__input-item">
            <textarea 
                // className="productAddition-form__input productAddition-form__input-description"
                className={`productAddition-form__input productAddition-form__input-description ${
                    isReadOnly ? 'readonly-input' : ''
                }`}
                name="prod_desc"
                value={data.prod_desc}
                onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
                readOnly={isReadOnly}
            />
            {errors?.prod_desc && (
              <span className="productAddition-error">*<br/>{errors?.prod_desc}</span>
            )}
        </div>

        <div className="productAddition-form__input-item">
            <label>11. Укажите игровую сторону клюшки (хват):&nbsp;&nbsp;&nbsp;</label>

            {Object.values(STICK_SIDES).map(side => (
              
              <React.Fragment key={`stick-side-${side.id}`}>
                <label>{side.name}</label>
                <input
                  className="productAddition-form__input-hook"
                  type="radio"
                  name="hookId"
                  value={String(side.id)} // Конвертируем в строку // Всегда строка в DOM!
                  checked={data.hookId === String(side.id)}
                  onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
                  readOnly={isReadOnly}
                />
              </React.Fragment>
            ))}
            <span className="productAddition-error margin-left8px">
              *
              {errors?.hookId && (
                <>
                  <br />
                  {errors?.hookId}
                </>
              )}
            </span>
        </div>

        <div className="productAddition-form__input-item">
            <label>12. Имеется ли сертификат соответствия IFF (международной федерации флорбола):&nbsp;&nbsp;&nbsp;</label>
            
            {Object.values(CERTIFICATION_OPTIONS).map((option) => (
              <React.Fragment key={`iff-option-${option.id}`}>
                <label>{option.label}</label>
                <input
                  className="productAddition-form__input-brand"
                  type="radio"
                  name="iffId"
                  value={option.id}
                  checked={data.iffId === option.id}
                  onChange={isReadOnly ? undefined : handleChange} // Отключаем изменение
                  readOnly={isReadOnly}
                />
              </React.Fragment>
            ))}
            <span className="productAddition-error margin-left8px">
              *
              {errors?.iffId && (
                <>
                  <br />
                  {errors?.iffId}
                </>
              )}
            </span>
        </div>

        {/* Кнопки скрываем в read-only режиме */}
        {!isReadOnly && onSubmit && (
          <>
            <button 
                type="submit" 
                className="productAddition-button__stage1 productAddition-form__submit-btn margin-right12px"
                disabled={isLoading}
            >
                Сохранить и продолжить
            </button>

            <button 
              type="button" 
              className="productAddition-button__stage1 productAddition-form__submit-btn"
              // onClick={() => setFormData({})}
            >
              Очистить форму
            </button>
          </>
        )}

        
        
        
      </form>
    </div>
  );
};

export default NewStickFormStep1;