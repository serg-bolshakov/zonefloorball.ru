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
    // CHECK_SIMILAR_PRODUCTS: (categoryId: number) => `/api/check-similar/products/category/${categoryId}`,
    CHECK_SIMILAR_PRODUCTS: '/api/check-similar/products',
} as const; // `as const` для точной типизации, as const гарантирует, что значения нельзя изменить