// validators/stickFormValidators.ts
import { TNewStickFormStep1 } from "@/Components/Admin/ProductAdditionForms/ProductTypes/Sticks/NewStickFormStep1";


export const validateStep = (step: number, data: any): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (step === 1) {
    const stepData = data as TNewStickFormStep1;
    
    // Валидация артикула
    if (!stepData.article) {
      errors.article = 'Артикул обязателен';
    } else if (!/^\d{4,8}$/.test(stepData.article)) {
      errors.article = 'Артикул должен содержать 4-8 цифр';
    }
    
    // Валидация других полей шага 1
    // ...
  }
  
  return errors;
};