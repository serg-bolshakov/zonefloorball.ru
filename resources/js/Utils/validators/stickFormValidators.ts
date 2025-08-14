// validators/stickFormValidators.ts
import { TNewStickFormStep1 } from "@/Components/Admin/ProductAdditionForms/ProductTypes/Sticks/NewStickFormStep1";
import { TFormNewStickData } from "@/Components/Admin/ProductAdditionForms/ProductTypes/Sticks/AddStickForm";
import { TStepNumber } from "@/Components/Admin/ProductAdditionForms/ProductTypes/Sticks/AddStickForm";
import { TRequestSimilarData } from "@/Hooks/useCheckSimilarProducts";
import { CATEGORY } from "@/Constants/categories";


export const validatePartStepForRequestSimilar = (
    data: TNewStickFormStep1
  ): Record<string, string> => {

    console.log('const validatePartStepForRequestSimilar input data', data);
    const errors: Record<string, string> = {};

    if (!data.article) {
        errors.article = 'Артикул обязателен';
        } else if (!/^\d{4,8}$/.test(data.article)) {
        errors.article = 'Артикул должен содержать 4-8 цифр';
    }

    if (!data.brandId) {
        errors.brandId = 'Выберите бренд клюшки';
    }

    if (!data.shaftFlexId) {
        errors.shaftFlexId = 'Укажите жёсткость рукоятки клюшки';
    }

    return errors;
};

export const сonvertFormDataForRequestSimilar = (
    data: TNewStickFormStep1
  ): TRequestSimilarData => {

    return {
        // article     : data.article!,                     //  Оператор "!" (non-null assertion operator): «TypeScript, я как разработчик гарантирую, что это значение не будет null или undefined, даже если тип допускает это. Просто поверь мне.»
        article     : data.article || '',                   // Запасное значение для обязательного поля
        categoryId  : CATEGORY['STICKS'],
        brandId     : Number(data.brandId),
        model       : data.model ? data.model : null,       // Явное преобразование
        marka       : data.marka ? data.marka : null,
        shaftFlexId : Number(data.shaftFlexId),
        colour      : data.colour ? data.colour : null,
    };
};


export const validateStep = <T extends TStepNumber>(
    step: T,
    data: Partial<TFormNewStickData[T]>
  ): Record<string, string> => {

    const errors: Record<string, string> = {};

    /* if (step === 1) {
        const stepData = data as TNewStickFormStep1;
        
        // Валидация артикула
        if (!stepData.article) {
        errors.article = 'Артикул обязателен';
        } else if (!/^\d{4,8}$/.test(stepData.article)) {
        errors.article = 'Артикул должен содержать 4-8 цифр';
        }
        
        // Валидация других полей шага 1
        // ...
  }*/
  
    // Валидация артикула - теоретически валидироваться должны только поля из списка для конкретного шага... проверим... если что не так будет получаться, будем делать как в закомментированном участке кода...
    if (!data.article) {
        errors.article = 'Артикул обязателен';
        } else if (!/^\d{4,8}$/.test(data.article)) {
        errors.article = 'Артикул должен содержать 4-8 цифр';
    }

    if (!data.brandId) {
        errors.brandId = 'Выберите бренд клюшки';
    }

    if (!data.shaftFlexId) {
        errors.shaftFlexId = 'Укажите жёсткость рукоятки клюшки';
    }

    return errors;
};

export const сonvertFormData = <T extends TStepNumber>(
    step: T,
    data: Partial<TFormNewStickData[T]>
  ): TRequestSimilarData => {

    return {
        // article     : data.article!,                    //  Оператор "!" (non-null assertion operator): «TypeScript, я как разработчик гарантирую, что это значение не будет null или undefined, даже если тип допускает это. Просто поверь мне.»
        article     : data.article || '', // Запасное значение для обязательного поля
        categoryId  : CATEGORY['STICKS'],
        brandId     : Number(data.brandId),
        model       : data.model ? data.model : null,   // Явное преобразование
        marka       : data.marka ? data.marka : null,
        shaftFlexId : Number(data.shaftFlexId),
        colour      : data.colour ? data.colour : null,
    };
};