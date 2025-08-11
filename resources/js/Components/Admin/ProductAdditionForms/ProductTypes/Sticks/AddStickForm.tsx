// components/Admin/ProductAdditionForms/AddStickForm.tsx
import { useReducer } from 'react';
import { stickFormReducer, initialState } from '../../reducers/stickFormReducer';
import NewStickStep1Form from './NewStickFormStep1';
import { TNewStickFormStep1, TValidatedNewStickStep1 } from './NewStickFormStep1';

// Общий тип для всей формы
export type TFormNewStickData = { 
    1: TNewStickFormStep1;
    // ...
};


export type TStepNumber = keyof TFormNewStickData; // 1 | 2 | 3 | 4

// Универсальный экшен для обновления
type TUpdateFormAction<T extends TStepNumber> = {
  type: 'UPDATE_FORM_DATA';
  step: T;
  payload: Partial<TFormNewStickData[T]>;
};

const AddStickForm = () => {

  const [state, dispatch] = useReducer(stickFormReducer, initialState);

  
  // Обновление данных текущего шага
  const updateFormData = <T extends TStepNumber>(
    step: T,
    data: Partial<TFormNewStickData[T]>
  ) => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      step,
      payload: data
    } as TUpdateFormAction<T>);
  };
  
  
  // Валидация и преобразование данных
  /*const validateAndConvertStep1 = (data: TNewStickFormStep1): TValidatedNewStickStep1 => {
      return {
          article: data.article || '',
          brandId: Number(data.brandId) || 0,
          model: data.model || null,
          // ... остальные поля с конвертацией
      };
  };*/

  const handleNext = (stepData: any) => {
    //
  };

  const handlePrev = () => {
    //
  };

  return (
    <div className="stick-form-container">
      {/* Навигация по шагам */}
      <div className="form-steps">
        {[1, 2, 3, 4].map(step => (
          <button
            key={step}
            className={`step-tab ${state.currentStep === step ? 'active' : ''}`}
            disabled={step > state.currentStep}
          >
            Шаг {step}
          </button>
        ))}
      </div>

      {/* Отображение текущего шага */}
      <div className="form-content">
        {state.currentStep === 1 && (
          <NewStickStep1Form 
            state={initialState}
            data={state.steps[1].raw}
            onChange={updateFormData}
            // onNext={handleNext}
          />
        )}

        {/* Аналогично для других шагов */}

      </div>
    </div>
  );
};

export default AddStickForm;
