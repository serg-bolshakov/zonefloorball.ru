// resources/js/Constants/api.ts
export const API_ENDPOINTS = {
    FAVORITES: '/api/products/favorites',
    CART: '/api/products/cart',
    USER_DATA: '/api/user-data'
  } as const; // `as const` для точной типизации