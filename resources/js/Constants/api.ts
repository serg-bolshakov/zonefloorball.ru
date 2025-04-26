// resources/js/Constants/api.ts
export const API_ENDPOINTS = {
    FAVORITES: '/api/products/favorites',
    CART: '/api/products/cart',
    RECENTLY_VIEWED: '/api/products/recently-viewed',
    USER_DATA: '/api/user-data',
    warehouses: '/api/warehouses',
} as const; // `as const` для точной типизации