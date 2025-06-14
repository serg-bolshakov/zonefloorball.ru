// resources/js/Сontexts/UserData/Context.ts

import { createContext } from 'react';

export type TCart = Record<number, number>; // { [productId]: quantity } — это один объект вида { 84: 1, 89: 2 }
export type TRecentlyViewedProducts = Record<number, number>; // { [productId]: timestamp } — это один объект вида { 84: 123456789, 89: 123456790 }

export interface UserDataState {
    cart                  : TCart;
    favorites             : number[];
    orders                : string[];
    recentlyViewedProducts: TRecentlyViewedProducts;
    cartTotal             : number; 
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

    // Заказы
    reloadOrders?: () => Promise<void>;

    // Статус загрузки
    isLoading: boolean;
    error: string | null;

    // Недавно просмотренные товары
    addRecentlyViewedProd: ( productId: number ) => Promise<{  
        error?: string;     
    }>;
}

export const UserDataContext = createContext<UserDataContextType | null>(null);

