// resources/js/Constants/api.ts
export const API_ENDPOINTS = {
    CART: '/api/products/cart',
    PREORDER: '/api/products/preorder',
    RECENTLY_VIEWED: '/api/products/recently-viewed',
    USER_DATA: '/api/user-data',
    WAREHOUSES: '/api/warehouses',
    DELIVERY_OPTIONS: '/api/delivery-options',
    ORDER_CREATE: '/api/orders/create',
    FAVORITES_PRODUCTS: '/api/products/favorites',
    // USER_SYNC: '/api/user/sync',
} as const; // `as const` для точной типизации