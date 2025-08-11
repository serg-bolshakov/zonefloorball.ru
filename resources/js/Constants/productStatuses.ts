// resources/js/Constants/productStatuses.ts
export const PRODUCT_STATUSES = {
    ACTIVE   : 1,
    ARCHIEVED: 2,
} as const; // `as const` для точной типизации, as const гарантирует, что значения нельзя изменить