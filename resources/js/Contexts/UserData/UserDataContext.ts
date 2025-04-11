// resources/js/Сontexts/UserData/Context.tsx

import { createContext } from 'react';

/*export interface CartItem {
    productId: number;
    quantity: number;
    addedAt?: Date; // Полезно для сортировки
}*/
type TCart = Record<number, number>; // { [productId]: quantity } — это один объект вида { 84: 1, 89: 2 }


export interface UserDataState {
    cart          : TCart;
    favorites     : number[];
    orders        : number[];
    cartTotal     : number; 
    favoritesTotal: number; 
    ordersTotal   : number; 
    isLoading     : boolean;        // Статус загрузки
    error         : string | null;
}

/*export interface AddToCartParams {
    productId: number; 
    quantity: number;
    options?: {             // Опциональность (?:) — методы будем добавлять постепенно...
        silent?: boolean;   // Часто нужно передавать флаги (например, для мгновенного обновления UI):
        merge? : boolean;   // Совмещать с существующим количеством
    };    
}*/

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
    
    updateCartItem?: (productId: number, quantity: number) => void;
    removeFromCart?: (productId: number) => void;
    clearCart?: () => Promise<void>;

    // Заказы
    reloadOrders?: () => Promise<void>;

    // Статус загрузки
    isLoading: boolean;
    error: string | null;
}

export const UserDataContext = createContext<UserDataContextType | null>(null);

