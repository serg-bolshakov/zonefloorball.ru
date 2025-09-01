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
    CHECK_SIMILAR_PRODUCTS: '/api/check-similar/products',
    CREATE_STICK: '/api/products/sticks/create',
    GET_PRODUCT_PROPERTIES: '/api/stick-properties/{productId}',
    UPDATE_STICK_STEP2: '/api/stick-properties/save-step2/{productId}',
    CREATE_STICK_PRICES_STEP3: '/api/stick-properties/create-prices/{productId}',
    UPLOAD_STICK_IMAGES_STEP4: '/api/admin/products/{productId}/images',
} as const; // `as const` для точной типизации, as const гарантирует, что значения нельзя изменить

/**
 * endpoint с плейсхолдерами: /stick-properties/save-step2/{productId} 
 * Нужно заменить {productId} на реальное значение: /stick-properties/save-step2/123 - реализация идеи в Hooks/useApiRequest.ts
 */