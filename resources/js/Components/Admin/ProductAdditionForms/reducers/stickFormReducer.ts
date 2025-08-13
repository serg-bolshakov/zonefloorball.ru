// resources/js/Components/Admin/ProductAdditionForms/reducers/stickFormReducer.ts
import { TNewStickFormStep1, TValidatedNewStickStep1 } from "../ProductTypes/Sticks/NewStickFormStep1";
import { TStepNumber, TFormNewStickData } from "../ProductTypes/Sticks/AddStickForm";
import { IProduct } from "@/Types/types";
import { validateStep } from "@/Utils/validators/stickFormValidators";

// Начальное состояние
type TSteps = {
  1: {
    raw: TNewStickFormStep1;                // Типы для невалидированной формы (все поля optional) 
    validated?: TValidatedNewStickStep1;
    errors?: Record<string, string>;
    similarProducts?: IProduct[];           // Для подсказок
  };

  2: { 
    /* тип для шага 2 */ 
    raw: TNewStickFormStep1;               
  };
  // 3?: { /* тип для шага 3 */ };
  // 4?: { /* тип для шага 4 */ };
};

export type TNewStickFormState = {
    currentStep    : TStepNumber  ; // Явно указываем возможные шаги
    productId      : number | null;
    isLoading      : boolean      ;
    error          : string | null; 
    steps          : TSteps       ;
    similarProducts: IProduct[]   ;
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
  data: Partial<TFormNewStickData[T]>;
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
      type: 'SET_SIMILAR_PRODUCTS'; 
      step: 1; // Привязываем только к шагу 1
      payload: IProduct[] 
    }
  | { type: 'SET_PRODUCT_ID'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STEP'; payload: TStepNumber }
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
        if (!state.steps[step]) return state;
        
        return {
            ...state,
            steps: {
                ...state.steps,
                [step]: {
                        ...state.steps[step],
                        raw: {
                            ...state.steps[step].raw,
                            ...action.payload
                        },
                    errors: undefined // Сбрасываем ошибки при обновлении
                }
            }
        };
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_STEP':
      return { ...state, currentStep: action.payload };

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

    case 'SET_SIMILAR_PRODUCTS': {
        const step = action.step;
        return {
            ...state,
            steps: {
            ...state.steps,
            [step]: {
                ...state.steps[step],
                similarProducts: action.payload
            }
            },
            similarProducts: action.payload // Дублируем в корень состояния для удобства
        };
    }

    case 'SET_PRODUCT_ID':
      return { ...state, productId: action.payload };

    default:
      return state;
  }
};

// Начальное состояние
export const initialState: TNewStickFormState = {
    currentStep: 1,
    productId: null,
    similarProducts: [],
    isLoading: false,
    error: null,
    steps: { 
        1: { raw: {} }, 
        2: { raw: {} }, 
        // ... 
    },
    
};