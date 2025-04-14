// resources/js/contexts/AppContext.ts
// Создадим контекст для хранения данных, которые будут использоваться на всех страницах.

import { createContext } from "react";
import { User } from "../Types/types";
import { ICategoriesMenuArr, ICategoryItemFromDB } from "../Types/types";
import { TCart } from "./UserData/UserDataContext";

// Экспортируем тип, чтобы его можно было использовать в других файлах
export interface IAppContextType {
    user: User | null;
    categoriesMenuArr: ICategoriesMenuArr | null;
    authBlockContentFinal: string;
    categoriesInfo: ICategoryItemFromDB[] | null;            // массив категорий. categoriesInfo может быть null или undefined (например, данные ещё не загружены), пропишем это в типе:

    setUser: (user: User | null) => void;
    setCategoriesMenuArr: (categoriesMenuArr: ICategoriesMenuArr | null) => void;
    setAuthBlockContentFinal: (authBlockContentFinal: string) => void;
    setCategoriesInfo: (categoriesInfo: ICategoryItemFromDB[] | null) => void;       // // setCategoriesInfo: Dispatch<SetStateAction<ICategoryInfoItem[]>>;

    cart           : TCart | {};
    favorites      : number[] | [];
    cartTotal      : number | 0; 
    favoritesTotal : number | 0; 
    orders         : string[] | [];
    ordersTotal    : number | 0; 

    setCart: (cart: TCart | {}) => void;
    setFavorites: (favorites: number[] | []) => void;
    setCartTotal: (cartTotal: number | 0) => void;
    setFavoritesTotal: (favoritesTotal: number | 0) => void;
    setOrders: (orders: string[] | []) => void;
    setOrdersTotal: (ordersTotal: number | 0) => void;
}

const AppContext = createContext<IAppContextType | null>(null);

export default AppContext;