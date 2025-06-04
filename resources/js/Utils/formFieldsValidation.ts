// Utils/formFieldsValidation.ts

export const validateAddress = (value: string): string | null => {
    if (!value.trim()) return 'Адрес доставки обязателен';
    if (!/^[а-яА-ЯёЁ\d\s.,"!:)(/№-]*$/.test(value)) {
        return 'Недопустимые символы в адресе';
    }
    return null;
};