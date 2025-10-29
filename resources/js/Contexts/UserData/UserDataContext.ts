// resources/js/Сontexts/UserData/UserDataContext.ts

import { createContext } from 'react';

export type TCart = Record<number, number>;                     // { [productId]: quantity }  — это один объект вида { 84: 1, 89: 2 }
export type TPreorder = Record<number, number>;                 // { [productId]: quantity }  — это один объект вида { 84: 1, 89: 2 }
export type TRecentlyViewedProducts = Record<number, number>;   // { [productId]: timestamp } — это один объект вида { 84: 123456789, 89: 123456790 }

export interface UserDataState {
    cart                  : TCart;
    preorder              : TPreorder;
    favorites             : number[];
    orders                : number[];       // здесь мы подразумеваем не массив объектов IOrder[], а именно массив id-шников!
    recentlyViewedProducts: TRecentlyViewedProducts;
    cartTotal             : number; 
    preorderTotal         : number; 
    favoritesTotal        : number; 
    ordersTotal           : number; 
    isLoading             : boolean;        // Статус загрузки
    error                 : string | null;
}

export interface UserDataContextType extends UserDataState {
    // Избранное
    addToFavorites: (productId: number) => Promise<{ 
        favoritesTotal: number; 
        error?: string 
    }>;

    // Использование Promise — если метод будет делать API-запросы...
    removeFromFavorites: (productId: number) => Promise<{ favoritesTotal: number; error?: string }>;
     
    addToCart: ( productId: number, quantity: number ) => Promise<{  
        cartTotal: number;  // Полезно для отображения в UI
        error?: string;     
    }>;
    
    updateCart: (productId: number, quantity: number) => Promise<{  
        cartTotal: number;  // Полезно для отображения в UI
        error?: string;     
    }>;

    removeFromCart: (productId: number) => Promise<{  
        cartTotal: number;
        error?: string;     
    }>;
    
    clearCart: () => Promise<void>;

    addToPreorder: ( productId: number, quantity: number, expectedDate: string | null ) => Promise<{  
        preorderTotal: number;  // Полезно для отображения в UI
        error?: string;     
    }>;
    
    updatePreorder: (productId: number, quantity: number, expectedDate: string | null) => Promise<{  
        preorderTotal: number;  // Полезно для отображения в UI
        error?: string;     
    }>;

    removeFromPreorder: (productId: number) => Promise<{  
        preorderTotal: number;
        error?: string;     
    }>;
    
    clearPreorder: () => Promise<void>;

    addOrder: (orderId: number) => Promise<void>;

    // Статус загрузки
    isLoading: boolean;
    error: string | null;

    // Недавно просмотренные товары
    addRecentlyViewedProd: ( productId: number ) => Promise<{  
        error?: string;     
    }>;
}

export const UserDataContext = createContext<UserDataContextType | null>(null);

