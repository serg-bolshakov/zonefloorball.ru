// components/Admin/ProductAdditionForms/AddStickForm.tsx
import { useReducer, useCallback } from 'react';
import { stickFormReducer, initialState } from '../../reducers/stickFormReducer';
import NewStickStep1Form from './NewStickFormStep1';
import { TNewStickFormStep1, TValidatedNewStickStep1 } from './NewStickFormStep1';
import { сonvertFormData, validateStep } from '@/Utils/validators/stickFormValidators';
import useCheckSimilarProducts from '@/Hooks/useCheckSimilarProducts';
import { toast } from 'react-toastify';
import { getErrorMessage } from '@/Utils/error';

// Общий тип для всей формы
export type TFormNewStickData = { 
    1: TNewStickFormStep1;
    // ...
};

// Тип номера шага
export type TStepNumber = keyof TFormNewStickData; // 1 | 2 | 3 | 4

const AddStickForm = () => {
    const [state, dispatch] = useReducer(stickFormReducer, initialState);
    const { checkSimilarProduct } = useCheckSimilarProducts();
  
    // Обновление данных текущего шага
    const updateFormData = <T extends TStepNumber>(
        step: T,
        data: Partial<TFormNewStickData[T]>
    ) => {
      dispatch({
          type: 'UPDATE_FORM_DATA',
          step,
          payload: data
      });
    };
  
  // Проверка похожих товаров
    const handleCheckSimilar = useCallback(async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      const step = state.currentStep;
      const formData = state.steps[step].raw;

      try {
        
        // 1. Синхронная валидация перед диспатчем
        const errors = validateStep(step, formData);

        if (Object.keys(errors).length > 0) {
          dispatch({ 
            type: 'SET_STEP_ERRORS', 
            step, 
            payload: errors 
          });
          return; // Прерываем если есть ошибки
        }
        
        // 2. Конвертация данных
        // Если ошибок при заполнении формы нет, валидируем заполненные поля для отправки на сервер (строковые значения, полученные из формы, мы должны преобразовать в числовые значения (где требуется)):
        const converted = сonvertFormData(step, formData);
        console.log('[CheckSimilar] Payload:', converted); // Логирование для отладки
        // 3. Запрос к API
        const res = await checkSimilarProduct(converted, {
          onSuccess: (res) => {
              const message = res.data?.length 
                ? `Найдено ${res.data.length} аналогов`
                : 'Похожих товаров не найдено';

              toast.success(res?.message || message);
        
              // Дополнительная обработка успешного ответа
              /* if(res.data) {
                dispatch({ 
                    type: 'SET_SIMILAR_PRODUCTS', 
                    payload: res.data 
                });
              }*/

             //Унификация обработки пустого ответа - пока так оставим, далее посмотрим...
              dispatch({ 
                type: 'SET_SIMILAR_PRODUCTS',
                step: 1, 
                payload: res.data || [] // Всегда массив, даже пустой
              });   
          },
        });
        
      } catch (error) {
          // 5. Универсальная обработка ошибок
          const message = getErrorMessage(error);
          dispatch({ type: 'SET_ERROR', payload: message });
          toast.error(`Ошибка при проверке: ${message}`);
      } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
      }
  }, [state.currentStep, checkSimilarProduct]);

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
