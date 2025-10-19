// validators/stickFormValidators.ts
import { TNewStickFormStep1, TValidatedNewStickStep1 } from "@/Components/Admin/ProductAdditionForms/ProductTypes/Sticks/NewStickFormStep1";
import { TNewStickFormStep2, TValidatedNewStickStep2 } from "@/Components/Admin/ProductAdditionForms/ProductTypes/Sticks/NewStickFormStep2";
import { TNewStickFormStep3, TValidatedNewStickStep3 } from "@/Components/Admin/ProductAdditionForms/ProductTypes/Sticks/NewStickFormStep3";
import { TFormNewStickData, TConvertedFormNewStickData } from "@/Components/Admin/ProductAdditionForms/ProductTypes/Sticks/AddStickForm";
import { TStepNumber } from "@/Components/Admin/ProductAdditionForms/ProductTypes/Sticks/AddStickForm";
import { TRequestSimilarData } from "@/Hooks/useCheckSimilarProduct";
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

export const convertFormDataForRequestSimilar = (
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

    if (step === 1) {
        const stepData = data as TNewStickFormStep1;
        
        // Валидация артикула
        if (!stepData.article) {
            errors.article = 'Артикул обязателен';
        } else if (!/^\d{4,8}$/.test(stepData.article)) {
            errors.article = 'Артикул должен содержать 4-8 цифр';
        }
        
        if (!stepData.brandId) {
            errors.brandId = 'Выберите бренд клюшки';
        }

        if (!stepData.shaftFlexId) {
            errors.shaftFlexId = 'Укажите жёсткость рукоятки клюшки';
        }

        if (!/^[A-Za-z][a-zA-Z\/\s-]*$/.test(stepData.colour)) {
            errors.colour = 'Цвет пишется латинскими буквами';
        }

        if (!stepData.stickSizeId) {
            errors.stickSizeId = 'Укажите длину рукоятки клюшки';
        }

        if (!stepData.hookId) {
            errors.hookId = 'Выберите хват клюшки';
        }

        if (!stepData.iffId) {
            errors.iffId = 'Укажите, если сертификат IFF';
        }
    }

    if (step === 2) {
        const stepData = data as TNewStickFormStep2;
        // console.log('stepDate', stepData);
        if (stepData.editedTitle) {
            if (!/^\d{4,8}$/.test(stepData.editedTitle)) {
                errors.editedTitle = 'Артикул должен содержать 4-8 цифр';
            }
        }

        if (!stepData.gripId) {
            errors.gripId = 'Укажите тип обмотки рукоятки клюшки';
        }

        if (!stepData.profileId) {
            errors.profileId = 'Укажите профиль рукоятки клюшки';
        }

        if (!stepData.bladeModel) {
            errors.bladeModel = 'Укажите модель крюка клюшки';
        }
    }

    if (step === 3) {
        const stepData = data as TNewStickFormStep3;
        console.log('validateStep3 stepDate', stepData);

        // Валидация регулярной цены (РРЦ)
        if (!stepData.regularPrice) {
            errors.regularPrice = 'Поле обязательно для заполнения';
        } else {
            if (!/^[0-9]{1,5}(\.[0-9]{2})?$/.test(stepData.regularPrice)) {
                errors.regularPrice = 'Номинал должен содержать только цифры и точку для копеек';
            } 
            
            if (stepData.regularPrice.length > 8) {
                errors.regularPrice = 'Длина не должна превышать 8 символов';
            }
        }

        // Валидация специальной цены
        if (stepData.specialPrice) {
            if (!/^[0-9]{1,5}(\.[0-9]{2})?$/.test(stepData.specialPrice)) {
                errors.specialPrice = 'Номинал должен содержать только цифры и точку для копеек';
            }

            if (stepData.specialPrice.length > 8) {
                errors.specialPrice = 'Длина не должна превышать 8 символов';
            }
        }
        
        // Валидация дат
        if(stepData.specialPriceDateStart || stepData.specialPriceDateFinish) {
            const start = stepData.specialPriceDateStart;
            const finish = stepData.specialPriceDateFinish;
            const now = new Date().toISOString().split('T')[0];

            if (start && finish && start > finish) {
                errors.specialPrice = 'Дата окончания не может быть раньше даты начала';
            }

            if (start && start < now) {
                errors.specialPrice = 'Дата начала не может быть в прошлом';
            }

            if (finish && finish < now) {
                errors.specialPrice = 'Дата окончания не может быть в прошлом';
            }
        }
    };

    return errors;
};

export const convertFormData = <T extends TStepNumber>(
    step: T,
    data: Partial<TFormNewStickData[T]>
  ): TConvertedFormNewStickData[T] => {

    if (step === 1) {
        const stepData = data as Partial<TNewStickFormStep1>;
        return {
            // article     : stepData.article!,                             //  Оператор "!" (non-null assertion operator): «TypeScript, я как разработчик гарантирую, что это значение не будет null или undefined, даже если тип допускает это. Просто поверь мне.»
            article     : stepData.article ?? '',                           // Запасное значение для обязательного поля
            categoryId  : CATEGORY['STICKS'],
            brandId     : Number(stepData.brandId),
            model       : stepData.model ??  null,                          // Явное преобразование
            marka       : stepData.marka ??  null,
            shaftFlexId : Number(stepData.shaftFlexId),
            colour      : stepData.colour ? stepData.colour : null,
            material    : stepData.material ?? null,
            stickSizeId : Number(stepData.stickSizeId),                     // Отправляем как число      
            weight      : stepData.weight ?? null,                          // Явное преобразование
            prod_desc   : stepData.prod_desc ?? null,                       // Явное преобразование
            hookId      : Number(stepData.hookId),                          // Отправляем как число     
            iffId       : Number(stepData.iffId),                           // Отправляем как число     
        } as TConvertedFormNewStickData[T];
    }  

    if (step === 2) {
        const stepData = data as Partial<TNewStickFormStep2>;
        // console.log('stepDate2', stepData);
        return {
            series      : stepData.series,
            gripId      : Number(stepData.gripId),
            profileId   : Number(stepData.profileId),
            bladeModel  : Number(stepData.bladeModel),                     // Отправляем как число      
        } as TConvertedFormNewStickData[T];
    }

    if (step === 3) {
        const stepData = data as Partial<TNewStickFormStep3>;
        // console.log('convertFormData stepDate3', stepData);
        return {
            regularPrice: (stepData.regularPrice),
            specialPrice: (stepData.specialPrice) ?? null,
            specialPriceDateStart: stepData.specialPriceDateStart ?? null,
            specialPriceDateFinish: stepData.specialPriceDateFinish ?? null,
        } as TConvertedFormNewStickData[T];
    }

    throw new Error(`Unknown step: ${step}`);  
};

