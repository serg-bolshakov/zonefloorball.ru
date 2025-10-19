// Utils/formFieldsValidation.ts

export const validateAddress = (value: string): string | null => {
    if (!value.trim()) return 'Адрес доставки обязателен';
    if (!/^[а-яА-ЯёЁ\d\s.,"!:)(/№-]*$/.test(value)) {
        return 'Недопустимые символы в адресе';
    }
    return null;
};

// Валидация дат
export const validateDatesPeriod = (
    dateStart: string, 
    dateFinish: string,
    existingPeriods: Array<{start: string, end: string}> = []
): string | null => {

    const now = new Date().toISOString().split('T')[0];

    // Проверка пересечения с существующими периодами
    for (const period of existingPeriods) {
        if (dateStart <= period.end && (dateFinish >= period.start || !dateFinish)) {
            return 'Период пересекается с существующей акцией';
        }
    }
    
    if (dateStart && dateFinish && dateStart > dateFinish) {
        return 'Дата окончания не может быть раньше даты начала';
    }

    return null;
};

interface IValidationResult {
    isValid: boolean;
    errors: string[];
}

export const validatePriceDates = (
    startDate: string | null, 
    endDate: string | null,
    priceType: 'special' | 'preorder' = 'special'
): IValidationResult => {
    const errors: string[] = [];
    const now = new Date().toISOString().split('T')[0];

    // Только для специальных цен проверяем даты
    if (priceType === 'special') {
        if (startDate && endDate && startDate > endDate) {
            errors.push('Дата окончания не может быть раньше даты начала');
        }

        if (endDate && endDate < now) {
            errors.push('Дата окончания не может быть в прошлом');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
        