// resources/js/Components/Admin/ProductAdditionForms/reducers/stickFormReducer.ts
import { TNewStickFormStep1, TValidatedNewStickStep1 } from "../ProductTypes/Sticks/NewStickFormStep1";
import { TStepNumber, TFormNewStickData } from "../ProductTypes/Sticks/AddStickForm";
import { IProduct } from "@/Types/types";

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
    currentStep: TStepNumber; // Явно указываем возможные шаги
    productId: number | null;
    isLoading: boolean;
    error: string | null; 
    steps: TSteps;
};

// Универсальный экшен для обновления
type TUpdateFormAction<T extends TStepNumber> = {
  type: 'UPDATE_FORM_DATA';
  step: T;
  payload: Partial<TFormNewStickData[T]>;
};

// Экшены редюсера
type TNewStickFormAction =
  // | { type: 'UPDATE_FORM_DATA'; step: number; payload: Partial<TNewStickFormStep1>; }    // Для шага 1
  | TUpdateFormAction<1>
  // | TUpdateFormAction<2>
  // | TUpdateFormAction<3>
  // | TUpdateFormAction<4>
  | { type: 'VALIDATE_STEP'; step: number }
  | { type: 'SET_SIMILAR_PRODUCTS'; payload: IProduct[] }
  | { type: 'SET_PRODUCT_ID'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };


// Сам reducer
export const stickFormReducer = (
    state: TNewStickFormState,
    action: TNewStickFormAction
): TNewStickFormState => {
  switch (action.type) {
    case 'UPDATE_FORM_DATA':
        const step = action.step;
        return {
            ...state,
            steps: {
                ...state.steps,
                [step]: {
                        ...state.steps[step],
                        raw: {
                        ...state.steps[step].raw,
                        ...action.payload
                    }
                }
            }
        };

    case 'VALIDATE_STEP':
      // Здесь должна быть логика валидации
      return state;

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
    steps: { 
        1: { raw: {} }, 
        2: { raw: {} }, 
        // ... 
    },
    isLoading: false,
    error: null
};