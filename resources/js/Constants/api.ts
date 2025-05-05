// resources/js/Constants/api.ts
export const API_ENDPOINTS = {
    FAVORITES: '/api/products/favorites',
    CART: '/api/products/cart',
    RECENTLY_VIEWED: '/api/products/recently-viewed',
    USER_DATA: '/api/user-data',
    WAREHOUSES: '/api/warehouses',
    DELIVERY_OPTIONS: '/api/delivery-options',
    ORDER_CREATE: '/api/orders/create',
} as const; // `as const` для точной типизации