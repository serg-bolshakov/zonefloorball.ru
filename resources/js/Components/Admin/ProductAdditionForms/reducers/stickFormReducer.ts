// resources/js/Components/Admin/ProductAdditionForms/reducers/stickFormReducer.ts
import { TNewStickFormStep1, TValidatedNewStickStep1 } from "../ProductTypes/Sticks/NewStickFormStep1";
import { TNewStickFormStep2, TValidatedNewStickStep2 } from "../ProductTypes/Sticks/NewStickFormStep2";
import { TNewStickFormStep3, TValidatedNewStickStep3 } from "../ProductTypes/Sticks/NewStickFormStep3";
import { TNewStickFormStep4, TValidatedNewStickStep4 } from "../ProductTypes/Sticks/NewStickFormStep4";
import { TStepNumber, TFormNewStickData } from "../ProductTypes/Sticks/AddStickForm";
import { IProduct } from "@/Types/types";
import { validateStep } from "@/Utils/validators/stickFormValidators";

// Начальное состояние
type TSteps = {
  1: {
    raw: TNewStickFormStep1;                // Типы для невалидированной формы (все поля optional) 
    validated?: TValidatedNewStickStep1;
    errors?: Record<string, string>;
    similarProduct?: IProduct;              // Для подсказок
  };

  /* тип для шага 2 */
  2: {
    raw: TNewStickFormStep2;                // Типы для невалидированной формы (все поля optional) 
    validated?: TValidatedNewStickStep2;
    errors?: Record<string, string>;
    similarProduct?: IProduct;              // Для подсказок
  };
  
  3: {
      raw: TNewStickFormStep3;                // Типы для невалидированной формы (все поля optional) 
      validated?: TValidatedNewStickStep3;
      errors?: Record<string, string>;
      similarProduct?: IProduct;              // Для подсказок
    };
  4: {
      raw: TNewStickFormStep4;                // Типы для невалидированной формы (все поля optional) 
      validated?: TValidatedNewStickStep4;
      errors?: Record<string, string>;
      similarProduct?: IProduct;              // Для подсказок
    };
};

export type TNewStickFormState = {
    currentStep           : TStepNumber     ; // Явно указываем возможные шаги
    maxCompletedStep      : TStepNumber | 0 ; // Добавляем!
    productId             : number | null   ;
    productTitle          : string          ;
    productimgSrcBaseName : string          ;
    isLoading             : boolean         ;
    error                 : string | null   ; 
    steps                 : TSteps          ;
    similarProduct?       : IProduct        ;
};

// Универсальный экшен для обновления
type TUpdateFormAction<T extends TStepNumber> = {
  type: 'UPDATE_FORM_DATA';
  step: T;
  payload: Partial<TFormNewStickData[T]>;
};

// Универсальный тип для экшена валидации
type TValidateFormAction<T extends TStepNumber> = {
  type: 'VALIDATE_STEP';
  step: T;
  // data: Partial<TFormNewStickData[T]>;
};

// Экшены редюсера
type TNewStickFormAction =
  // | TUpdateFormAction<1>
  // | TUpdateFormAction<2>
  // | TUpdateFormAction<3>
  // | TUpdateFormAction<4>
  | TUpdateFormAction<TStepNumber>
  | TValidateFormAction<TStepNumber>
  | { 
      type: 'SET_SIMILAR_PRODUCT'; 
      step: 1; // Привязываем только к шагу 1
      payload: IProduct 
    }
  | {
      type: 'PRODUCT_CREATED';
      payload: {
        productId: number;
        productTitle: string;
        productimgSrcBaseName: string;
      };
    }
  | {
      type: 'RESTORE_DRAFT';
      payload: {
        productId: number | null;
        productTitle: string;
        currentStep: TStepNumber;
        maxCompletedStep: TStepNumber | 0;
        productimgSrcBaseName: string;
        productData?: IProduct;
      };
    }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STEP'; payload: TStepNumber }
  | { type: 'STEP_COMPLETED'; payload: TStepNumber }
  | { type: 'SET_STEP_ERRORS'; step: TStepNumber;  payload: Record<string, string> | undefined }
  | { type: 'SET_ERROR'; payload: string | null };


// Сам reducer
/**
 * @param state 
 * @param action 
 * @returns
 * 
 * Это чистая функция вида (state, action) => newState, которая:
 * Принимает текущее состояние (state) и объект действия (action)
 * Возвращает новое состояние на основе типа действия (action.type) 
 * 
 */

export const stickFormReducer = (
    state: TNewStickFormState,                          // Принимает текущее состояние (state) и объект действия (action)
    action: TNewStickFormAction
): TNewStickFormState => {
  switch (action.type) {                                // Возвращает новое состояние на основе типа действия (action.type) 
    case 'UPDATE_FORM_DATA': {
        const step = action.step;
        console.log('const UPDATE_FORM_DATA input step', step);
        console.log('const UPDATE_FORM_DATA input data', action.payload);
        return {
            ...state,
            steps: {
            ...state.steps,
            [step]: {
                    ...state.steps[step],
                    raw: {
                    ...state.steps[step].raw,
                    ...action.payload // Здесь должно быть частичное обновление
                    },
                    errors: undefined // Сбрасываем ошибки при изменении
                }
            }
        };
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_STEP':
      return { ...state, currentStep: action.payload };

    case 'STEP_COMPLETED':
      /*return {
          ...state,
          maxCompletedStep: Math.max(state.maxCompletedStep, action.payload) as keyof TFormNewStickData
      };*/
      const newMaxStep = Math.max(state.maxCompletedStep, action.payload);
      const validStep = Object.keys(state.steps)
          .map(Number)
          .filter(n => !isNaN(n))
          .includes(newMaxStep) ? newMaxStep as keyof TFormNewStickData : state.maxCompletedStep;
      
      return {
          ...state,
          maxCompletedStep: validStep
      };

    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_STEP_ERRORS': {
        const step = action.step;
        if (!state.steps[step]) return state;
        const errors = action.payload;
        
        return {
            ...state,
            steps: {
                ...state.steps,
                [step]: {
                    ...state.steps[step],
                    errors // Сохраняем ошибки при заполнении формы в состоянии
                }
            }
        };
    }
    
    case 'VALIDATE_STEP': {
        const step = action.step;
        if (!state.steps[step]) return state;
        const errors = validateStep(step, state.steps[step].raw);
        console.log('errors', errors);
        return {
            ...state,
            steps: {
                ...state.steps,
                [step]: {
                    ...state.steps[step],
                    errors // Сохраняем ошибки при заполнении формы в состоянии
                }
            }
        };
    }

    case 'SET_SIMILAR_PRODUCT': {
        const step = action.step;
        return {
            ...state,
            steps: {
            ...state.steps,
            [step]: {
                ...state.steps[step],
                similarProduct: action.payload
            }
            },
            similarProduct: action.payload // Дублируем в корень состояния для удобства
        };
    }

    case 'PRODUCT_CREATED':
      return {
          ...state,
          productId: action.payload.productId,
          productTitle: action.payload.productTitle,
          productimgSrcBaseName: action.payload.productimgSrcBaseName,
          steps: {
              ...state.steps,
              2: {
                  ...state.steps[2],
                  raw: {
                      ...state.steps[2].raw,
                      title: action.payload.productTitle,         // Автозаполнение!
                  }
              }
          },
          isLoading: false,
          error: null
      };

    case 'RESTORE_DRAFT':
      console.log('RESTORE_DRAFT', action.payload.productData);
      const properties = action.payload.productData?.properties || [];
      const hookProperty = properties.find(prop => prop.prop_title === 'hook');
      const flexProperty = properties.find(prop => prop.prop_title === 'shaft_flex');
      
      const seriesProperties = properties.filter(prop => prop.prop_title === 'serie') || [];;
      const seriesIds = seriesProperties?.map(prop => prop.id.toString());
      const gripTypeProperty = properties.find(prop => prop.prop_title === 'grip_type');
      const shaftProfileProperty = properties.find(prop => prop.prop_title === 'shaft_profile');
      const bladeModelProperty = properties.find(prop => prop.prop_title === 'blade_model');

      return {
          ...state,
          currentStep: action.payload.currentStep ?? 1,
          maxCompletedStep: action.payload.maxCompletedStep ?? 1, // Восстанавливаем прогресс
          productId: action.payload.productId ?? null,
          productTitle: action.payload.productTitle ?? '',
          productimgSrcBaseName: action.payload.productimgSrcBaseName ?? '',
          
          steps: {
              ...state.steps,
              1: {
                ...state.steps[1],
                  raw: {
                    article: action.payload.productData?.article ?? '',
                    brandId: action.payload.productData?.brand_id?.toString() ?? '',
                    model: action.payload.productData?.model ?? '',
                    marka: action.payload.productData?.marka ?? '',
                    shaftFlexId: flexProperty?.id?.toString() ?? '',
                    colour: action.payload.productData?.colour ?? '',
                    material: action.payload.productData?.material ?? '',
                    stickSizeId: action.payload.productData?.size_id?.toString() ?? '',
                    weight: action.payload.productData?.weight ?? '',
                    prod_desc: action.payload.productData?.prod_desc ?? '',
                    hookId: hookProperty?.id?.toString() ?? '',
                    iffId: action.payload.productData?.iff_id?.toString() ?? '',
                    errors: {},
                  }
              },
              2: {
                  ...state.steps[2],
                  raw: {
                    title: action.payload.productTitle,         // Автозаполнение!
                    editedTitle: '',
                    series: seriesIds, // Всегда массив (даже пустой) ID серий!
                    gripId: gripTypeProperty?.id?.toString() ?? '0',
                    profileId: shaftProfileProperty?.id?.toString() ?? '0',
                    bladeModel: bladeModelProperty?.id?.toString() ?? '0',
                    errors: {},
                  }
              },
              3: {
                  ...state.steps[3],
                  raw: {
                    regularPrice: action.payload.productData?.regular_price?.price_value?.toString() ?? '',
                    specialPrice: action.payload.productData?.actual_price?.price_value?.toString() ?? '',
                    specialPriceDateStart: action.payload.productData?.actual_price?.date_start ?? '',
                    specialPriceDateFinish: action.payload.productData?.actual_price?.date_end ?? '',
                    errors: {},
                  }
              }
          },
          isLoading: false,
          error: null
      };

    default:
      return state;
  }
};

// Инициализируем начальное состояние
export const initialState: TNewStickFormState = {
    currentStep: 1,
    maxCompletedStep: 0, // Добавляем!
    productId: null,
    productTitle: '',
    productimgSrcBaseName: '',

    isLoading: false,
    error: null,
    steps: { 
        1: { raw: {
                // ... все поля
                article    : '', // Пустая строка вместо undefined
                brandId    : '',
                model      : '',
                marka      : '',
                shaftFlexId: '',
                colour     : '',
                material   : '',
                stickSizeId: '',
                weight     : '',
                prod_desc  : '',
                hookId     : '',
                iffId      : '',
                errors     : {},
            }, 
            errors: undefined
        }, 
        2: { raw: {
                title       : '',
                editedTitle : '',
                series      : [],
                gripId      : '', // здесь будет id-свойства типа обмотки для клюшки
                profileId   : '',
                bladeModel  : '', // здесь будет id-свойства типа крюка для клюшки
                errors      : {},
            },
            errors: undefined
        }, 
        3: { raw: {
                regularPrice          : '',
                specialPrice          : '',
                specialPriceDateStart : '',
                specialPriceDateFinish: '',
                errors                : {},
            },
            errors: undefined
        },
        4: { raw: {
                errors                : {},
            },
            errors: undefined
        },  
    },
    
};