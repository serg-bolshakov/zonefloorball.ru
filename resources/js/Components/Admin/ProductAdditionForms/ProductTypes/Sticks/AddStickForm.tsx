// components/Admin/ProductAdditionForms/AddStickForm.tsx
import { useReducer, useCallback, useRef, useEffect, useState } from 'react';
import { stickFormReducer, initialState } from '../../reducers/stickFormReducer';
import NewStickStep1Form from './NewStickFormStep1';
import NewStickStep2Form from './NewStickFormStep2';
import NewStickStep3Form from './NewStickFormStep3';
import NewStickStep4Form from './NewStickFormStep4';
import { TNewStickFormStep1, TValidatedNewStickStep1 } from './NewStickFormStep1';
import { TNewStickFormStep2, TValidatedNewStickStep2 } from './NewStickFormStep2';
import { TNewStickFormStep3, TValidatedNewStickStep3 } from './NewStickFormStep3';
import { TNewStickFormStep4, TValidatedNewStickStep4 } from './NewStickFormStep4';
import { convertFormData, validateStep, validatePartStepForRequestSimilar, convertFormDataForRequestSimilar } from '@/Utils/validators/stickFormValidators';
import useCheckSimilarProduct from '@/Hooks/useCheckSimilarProduct';
import useCreateStick from '@/Hooks/useCreateStick';
import { toast } from 'react-toastify';
import { getErrorMessage } from '@/Utils/error';
import useStickProperties from '@/Hooks/useStickProperties';
import axios from 'axios';
import { IPropertiesProps } from '@/Hooks/useStickProperties';
import { useApiRequest } from '@/Hooks/useApiRequest';
import { API_ENDPOINTS } from '@/Constants/api';

// Общий тип для всей формы
export type TFormNewStickData = { 
    1: TNewStickFormStep1;
    2: TNewStickFormStep2;
    3: TNewStickFormStep3;
    4: TNewStickFormStep4;
};

// Общий тип для всей формы
export type TConvertedFormNewStickData = { 
    1: TValidatedNewStickStep1;
    2: TValidatedNewStickStep2;
    3: TValidatedNewStickStep3;
    4: TValidatedNewStickStep4;
};

// Тип номера шага
export type TStepNumber = keyof TFormNewStickData; // 1 | 2 | 3 | 4

// Типы для ответа сервера
export interface IApiRequestResponse {
    success: boolean;
    message?: string;
    data?: any; // Для дополнительных данных
}

const AddStickForm = () => {
    
    const [state, dispatch] = useReducer(stickFormReducer, initialState);  
    const steps: TStepNumber[] = [1, 2, 3, 4];
    const { checkSimilarProduct } = useCheckSimilarProduct();
    const { createStick } = useCreateStick();
    const { makeRequest } = useApiRequest();
    const { fetchProperties } = useStickProperties(); // Хук на верхнем уровне
    const stateRef = useRef(state);
    // выбираем доступные для заполнения на втором (пока) шаге поля (серии, там всякие...)
    const [properties, setProperties] = useState<IPropertiesProps | null>(null);
    
    // Актуализируем ref при каждом изменении состояния
    useEffect(() => {
      stateRef.current = state;
    }, [state]); 

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

      console.log('click', state);
    };
  
    // Проверка похожих товаров (только на первом шаге делается проверка)
    const handleCheckSimilar = async () => {
        const { currentStep, steps } = stateRef.current;
        const formData = steps[1].raw;

        console.log('Актуальные данные из ref:', formData);       // Для отладки
              
        // 1. Синхронная валидация перед диспатчем
        const errors = validatePartStepForRequestSimilar(formData);
        if (Object.keys(errors).length > 0) {
          dispatch({ type: 'SET_STEP_ERRORS', step: currentStep, payload: errors });
          return; // Прерываем если есть ошибки
        }
        
        // 2. Конвертация данных
        // Если ошибок при заполнении формы нет, валидируем заполненные поля для отправки на сервер (строковые значения, полученные из формы, мы должны преобразовать в числовые значения (где требуется)):
        const converted = convertFormDataForRequestSimilar(formData);
        console.log('[CheckSimilar] Payload:', converted); // Логирование для отладки
        
        // 3. Запрос к API
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
          
          const res = await checkSimilarProduct(converted, {
            onSuccess: (res) => {
                const message = res.data
                  ? 'В базе данных присутствует аналог'
                  : 'Похожих товаров не найдено';

                toast.success( res.message ? res.message : message );
          
                // Дополнительная обработка успешного ответа
                if(res.data) {
                  dispatch({ 
                      type: 'SET_SIMILAR_PRODUCT',
                      step: 1, 
                      payload: res.data 
                  });
                }
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
    }; // Зависимости не нужны, так как используем ref

    const handleCreateProduct = async () => {
        // Валидируем локально (синхронно)
        const step1Errors = validateStep(1, state.steps[1].raw);
        
        if (Object.keys(step1Errors).length > 0) {
            // Сохраняем ошибки в state
            dispatch({ 
                type: 'SET_STEP_ERRORS', 
                step: 1, 
                payload: step1Errors 
            });
            toast.error('Исправьте ошибки в форме');
            return;
        }
        
        toast.success('Данные корректны!');

        // Если ошибок нет - создаем товар
        dispatch({ type: 'SET_LOADING', payload: true });
        
        try {
            // Конвертируем данные для отправки
            const payload = convertFormData(1, state.steps[1].raw);
            console.log('payload', payload);

            // Отправляем на сервер
            const response = await createStick(payload);

            if (!response.success) {
                // Обрабатываем бизнес-логические ошибки (409 Conflict)
                toast.error(response.message || 'Ошибка при создании товара');
                return;
            }

            // Успешное создание
            const { productId, title, imgSrcBaseName } = response;
         
            // Обновляем состояние
            dispatch({
                type: 'PRODUCT_CREATED',
                payload: {
                    productId: response.productId!,
                    productTitle: response.title!,
                    productimgSrcBaseName: response.imgSrcBaseName!,
                }
            });
            
            // Сохраняем в localStorage
            localStorage.setItem('stick_form_process', JSON.stringify({
                productId,
                currentStep: 2,
                maxCompletedStep: 1,
                productTitle: title,
                productimgSrcBaseName: imgSrcBaseName,
                lastUpdated: new Date().toISOString()
            }));

            // После успешного создания товара на шаге 1
            dispatch({  type: 'STEP_COMPLETED', payload: 1 });

            // Переходим на шаг 2
            dispatch({ type: 'SET_STEP', payload: 2 });

            toast.success('Товар успешно создан!');
        } catch (error: any) {
          // Обрабатываем все ошибки в одном месте
          if (error.type === 'api') {
              switch (error.status) {
                  case 409:
                      toast.error('Товар с таким артикулом уже существует');
                      break;
                  case 500:
                      toast.error('Ошибка сервера при создании товара');
                      break;
                  default:
                      toast.error(error.data?.message || 'Неизвестная ошибка сервера');
              }
          } else {
              toast.error(error.message || 'Ошибка сети');
          }
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const handleStep2Submit = async () => {
        // console.log('validator', state.steps[2].raw);
        // Валидируем локально (синхронно)
        const step2Errors = validateStep(2, state.steps[2].raw);
        
        if (Object.keys(step2Errors).length > 0) {
            // Сохраняем ошибки в state
            dispatch({ 
                type: 'SET_STEP_ERRORS', 
                step: 2, 
                payload: step2Errors 
            });
            toast.error('Исправьте ошибки в форме');
            return;
        }
        
        toast.success('Данные корректны!');

        // Если ошибок нет - насыщаем товар дополнительными свойствами
        dispatch({ type: 'SET_LOADING', payload: true });

        try {
            // Конвертируем данные для отправки
            const payload = convertFormData(2, state.steps[2].raw);
            // console.log('payload', payload);

            // Отправка на сервер
            const response = await makeRequest<IApiRequestResponse>(      // Отправляет POST на /stick-properties/save-step2/123 + JSON data, Laravel: Видит роут /{productId} → извлекает 123 из URL, Автоматически передает 123 как первый аргумент в метод, Данные из тела запроса попадают в $request
                API_ENDPOINTS.UPDATE_STICK_STEP2,
                payload,
                { productId: state.productId!.toString() } // Параметры URL
            );

            if (!response.success) {
                // Обрабатываем бизнес-логические ошибки
                toast.error(response.message || 'Ошибка при обновлении свойств товара');
                return;
            }
                       
            // Порядок действий после успеха:

              // 1. Обновление состояния
              dispatch({ type: 'STEP_COMPLETED', payload: 2 });
            
              // 2. Переходим на шаг 3
              dispatch({ type: 'SET_STEP', payload: 3 });

              if (response.success) {
                  toast.success(response.message || 'Товару успешно добавлены новые свойства!');
              }
            
              // 3. Затем обновляем localStorage
              const saved = localStorage.getItem('stick_form_process');
              if (saved) {
                  const formData = JSON.parse(saved);
                  localStorage.setItem('stick_form_process', JSON.stringify({
                      ...formData,
                      currentStep: 3,
                      maxCompletedStep: 2,
                      lastUpdated: new Date().toISOString()
                  }));
              }
        } catch (error: any) {
          // Обрабатываем все ошибки в одном месте
          if (error.type === 'api') {
              switch (error.status) {
                  case 500:
                      toast.error('Ошибка сервера при обновлении товара');
                      break;
                  default:
                      toast.error(error.data?.message || 'Неизвестная ошибка сервера');
              }
          } else {
              toast.error(error.message || 'Ошибка сети');
          }
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const handleStep3Submit = async () => {
        console.log('validator', state.steps[3].raw);
        // Валидируем локально (синхронно)
        const step3Errors = validateStep(3, state.steps[3].raw);
        
        if (Object.keys(step3Errors).length > 0) {
            // Сохраняем ошибки в state
            dispatch({ 
                type: 'SET_STEP_ERRORS', 
                step: 3, 
                payload: step3Errors 
            });
            toast.error('Исправьте ошибки в форме');
            return;
        }
        
        toast.success('Данные корректны!');
        
        // Если ошибок нет - насыщаем товар дополнительными свойствами - ЦЕНАМИ (РРЦ - обязательна для заполнения, от неё идут все скидки)
        dispatch({ type: 'SET_LOADING', payload: true });

        try {
            // Конвертируем данные для отправки
            const payload = convertFormData(3, state.steps[3].raw);
            console.log('handleStep3Submit payload', payload);

            // Отправка на сервер
            const response = await makeRequest<IApiRequestResponse>(      // Отправляет POST на /stick-properties/create-prices/{productId} + JSON data, Laravel: Видит роут /{productId} → извлекает 123 из URL, Автоматически передает 123 как первый аргумент в метод, Данные из тела запроса попадают в $request
                API_ENDPOINTS.CREATE_STICK_PRICES_STEP3,
                payload,
                { productId: state.productId!.toString() } // Параметры URL
            );

            if (!response.success) {
                // Обрабатываем бизнес-логические ошибки
                toast.error(response.message || 'Ошибка при обновлении свойств товара');
                return;
            }
                       
            // Порядок действий после успеха:

              // 1. Обновление состояния
              dispatch({ type: 'STEP_COMPLETED', payload: 3 });
            
              // 2. Переходим на шаг 3
              dispatch({ type: 'SET_STEP', payload: 4 });

              if (response.success) {
                  toast.success(response.message || 'Товару успешно добавлены стартовый цены!');
              }
            
              // 3. Затем обновляем localStorage
              const saved = localStorage.getItem('stick_form_process');
              if (saved) {
                  const formData = JSON.parse(saved);
                  localStorage.setItem('stick_form_process', JSON.stringify({
                      ...formData,
                      currentStep: 4,
                      maxCompletedStep: 3,
                      lastUpdated: new Date().toISOString()
                  }));
              }
        } catch (error: any) {
          // Обрабатываем все ошибки в одном месте
          if (error.type === 'api') {
              switch (error.status) {
                  case 500:
                      toast.error('Ошибка сервера при обновлении товара');
                      break;
                  default:
                      toast.error(error.data?.message || 'Неизвестная ошибка сервера');
              }
          } else {
              toast.error(error.message || 'Ошибка сети');
          }
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };
    
    const handleStepClick = (step: TStepNumber) => {
      if (step <= (state.maxCompletedStep + 1)) { // Используем maxCompletedStep!
        dispatch({ type: 'SET_STEP', payload: step });
      }
    };
   
    console.log('currentState', state);
    
    // При инициализации компонента, восстановление при загрузке:
    useEffect(() => {
        const restoreDraft = async () => {
            const saved = localStorage.getItem('stick_form_process');
            if (saved) {
                const { productId, productTitle, currentStep, maxCompletedStep, productimgSrcBaseName } = JSON.parse(saved);
                
              try {
                // Отдельная функция, а не хук
                const properties = await fetchProperties(productId);
                console.log('restoreDraft properties', properties);
                setProperties(properties); // Сохраняем в состояние
                
                dispatch({
                    type: 'RESTORE_DRAFT',
                    payload: {
                        productId,
                        productTitle,
                        currentStep,
                        maxCompletedStep,
                        productimgSrcBaseName,
                        productData: properties.product!,
                    }
                });
              } catch (error) {
                  console.error('Failed to restore draft:', error);
              }
            }
        };

        restoreDraft();
    }, [fetchProperties]);

    const handleImageUpload = async (
        files: File[], 
        mainIndices: number[], 
        showCaseIndices: number[], 
        promoIndices: number[], 
        orientations: Record<number, number>
    ) => {
        // Логика отправки на сервер
        
        dispatch({ type: 'SET_LOADING', payload: true });

        try {
            const formData = new FormData();

            // Добавляем файлы // files.forEach(file => formData.append('images[]', file));
            files.forEach((file, index) => {
                formData.append('images[]', file);
                // добавим метаданные для каждого файла - потом посмотрим, что будет в контроллере...
                formData.append(`image_${index}_name`, file.name);
            });
            
            /* formData.append('mainIndex', mainIndex.toString());
            formData.append('showcaseIndex', showcaseIndex.toString());
            formData.append('promoIndices', promoIndices.toString());
            formData.append('orientations', JSON.stringify(orientations));*/

            // Добавляем метаданные - ВСЕ в JSON
            const metadata = {
                mainIndices,
                showCaseIndices, 
                promoIndices,
                orientations
            };
            
            formData.append('metadata', JSON.stringify(metadata));

            // Отправка на сервер
            const response = await makeRequest<IApiRequestResponse>(      // Отправляет POST на '/api/admin/products/{productId}/images', Laravel: Видит роут /{productId} → извлекает 123 из URL, Автоматически передает 123 как первый аргумент в метод, Данные из тела запроса попадают в $request
                API_ENDPOINTS.UPLOAD_STICK_IMAGES_STEP4,
                formData, { productId: state.productId!.toString() } // Параметры URL
                // FormData сам установит правильный Content-Type:  headers: 'Content-Type: multipart/form-data'
            );

            if (!response.success) {
                // Обрабатываем бизнес-логические ошибки
                toast.error(response.message || 'Ошибка при загрузке изображений товара');
                return;
            }

            // Успешная обработка
            toast.success(response.message || 'Оформление нового товара успешно завершено!');
                       
            // Порядок действий после успеха:

              // 1. Очищаем редюсер (переводим в начальное нулевое состояние)
              /* dispatch({ 
                    type: 'RESTORE_DRAFT', 
                    payload: {
                      productId: null,
                      productTitle: '',
                      currentStep: 1,
                      maxCompletedStep: 1,
                      productimgSrcBaseName: '',
                  }
              });*/
              // dispatch({ type: 'RESTORE_DRAFT', payload: initialState }); // очень красиво получилось... 

              // 2. Затем удаляем localStorage - оформление завершено удаляем из локального хранилища запись: 
              // localStorage.removeItem('stick_form_process');
              
        } catch (error: any) {
          // Обрабатываем все ошибки в одном месте
          if (error.type === 'api') {
            switch (error.status) {
                case 413:
                    toast.error('Размер файлов слишком большой');
                    break;
                case 422:
                    toast.error('Недопустимый формат файлов');
                    break;
                case 500:
                    toast.error('Ошибка сервера при загрузке изображений');
                    break;
                default:
                    toast.error(error.data?.message || 'Ошибка сервера');
            }
          } else {
              toast.error(error.message || 'Ошибка сети');
          }
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const onComplete = async () => {
      //
    };

    const onCancel = async () => {
      //
    };


  return (
    <div className="stick-form-container">
      {/* Навигация по шагам */}
        <div className="form-steps">
          {steps.map(step => (
            <button
              key={step}
              className={`step-tab b-r-8 ${state.currentStep === step ? 'active' : ''} ${
                  step <= state.maxCompletedStep ? 'completed' : '' // Здесь тоже!
              }`}
              onClick={() => handleStepClick(step)}
              disabled={step > (state.maxCompletedStep + 1) && (step != state.maxCompletedStep)} 
            >
              Шаг {step}
              {step <= state.maxCompletedStep && <span> ✓</span>}
            </button>
          ))}
      </div>

      {/* Отображение текущего шага */}
      <div className="form-content">
        {state.currentStep === 1 && (
          <NewStickStep1Form
            data={state.steps[1].raw}
            errors={state.steps[1].errors || {}}
            similarProduct={state.steps[1].similarProduct}
            
            onChange={state.productId ? undefined : (data) => updateFormData(1, data)} // Отключаем изменение если товар уже создан
            onCheckSimilar={state.productId ? undefined : handleCheckSimilar} // Отключаем проверку
            onSubmit={state.productId ? undefined : handleCreateProduct} // Отключаем отправку
            
            isLoading={state.isLoading}
            isReadOnly={!!state.productId} // Добавляем флаг read-only
          />
        )}

        {state.currentStep === 2 && (
          <NewStickStep2Form
            state={state.steps[2].raw}
            errors={state.steps[2].errors || {}}
            possibleProps={properties}
            productId={state.productId!}
            similarProduct={state.steps[1].similarProduct}
            onChange={state.maxCompletedStep > state.currentStep ? undefined : (data) => updateFormData(2, data)}
            onSubmit={state.maxCompletedStep > state.currentStep ? undefined : handleStep2Submit}
            isLoading={state.isLoading}
            isReadOnly={state.maxCompletedStep >= state.currentStep} // Добавляем флаг read-only
          />
        )}

        {state.currentStep === 3 && (
          <NewStickStep3Form
            state={state.steps[3].raw}
            errors={state.steps[3].errors || {}}
            possibleProps={properties}
            productId={state.productId!}
            similarProduct={state.steps[1].similarProduct}
            onChange={state.maxCompletedStep > state.currentStep ? undefined : (data) => updateFormData(3, data)}
            onSubmit={state.maxCompletedStep > state.currentStep ? undefined : handleStep3Submit}
            isLoading={state.isLoading}
            isReadOnly={state.maxCompletedStep >= state.currentStep} // Добавляем флаг read-only
          />
        )}

        {state.currentStep === 4 && (
          <NewStickStep4Form
            errors={state.steps[4].errors || {}}
            productId={state.productId!}
            similarProduct={state.steps[1].similarProduct}
            isLoading={state.isLoading}
            onComplete={onComplete}
            onCancel={onCancel}
            onUpload={handleImageUpload} // Передаем обработчик
          />
        )}

      </div>
    </div>
  );
};

export default AddStickForm;
