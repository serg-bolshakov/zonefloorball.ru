// resources/js/Constants/categories.ts
export const CATEGORY = {
    STICKS: 1,  // клюшки
} as const; // `as const` для точной типизации, as const гарантирует, что значения нельзя изменить

// Тип для безопасного использования
export type TCategoryId = typeof CATEGORY[keyof typeof CATEGORY];

// Проверка существования категории
/* const isValidCategory = (id: number): id is TCategoryId => {
    return Object.values(CATEGORY).includes(id as TCategoryId);
} */