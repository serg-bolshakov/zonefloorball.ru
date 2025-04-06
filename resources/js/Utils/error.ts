//resources/js/Utils/error.ts
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Неизвестная ошибка';
};