// resources/js/contexts/AppContext.ts
// Создадим контекст для хранения данных, которые будут использоваться на всех страницах.

import { createContext } from "react";
import { TUser } from "../Types/types";
import { ICategoriesMenuArr, ICategoryItemFromDB } from "../Types/types";
import { TCart } from "./UserData/UserDataContext";
import { IOrder } from "@/Pages/Orders";

// Экспортируем тип, чтобы его можно было использовать в других файлах
export interface IAppContextType {
    user: TUser | null;
    categoriesMenuArr: ICategoriesMenuArr | null;
    authBlockContentFinal: string;
    categoriesInfo: ICategoryItemFromDB[] | null;            // массив категорий. categoriesInfo может быть null или undefined (например, данные ещё не загружены), пропишем это в типе:

    setUser: (user: TUser | null) => void;
    setCategoriesMenuArr: (categoriesMenuArr: ICategoriesMenuArr | null) => void;
    setAuthBlockContentFinal: (authBlockContentFinal: string) => void;
    setCategoriesInfo: (categoriesInfo: ICategoryItemFromDB[] | null) => void;       // setCategoriesInfo: Dispatch<SetStateAction<ICategoryInfoItem[]>>;

    cart           : TCart | {};
    preorder       : TCart | {};
    favorites      : number[] | [];
    cartTotal      : number | 0;
    preorderTotal  : number | 0; 
    favoritesTotal : number | 0; 
    orders         : number[] | [];     // здесь мы подразумеваем не массив объектов IOrder[], а именно массив id-шников!
    ordersTotal    : number | 0; 

    setCart          : (cart: TCart | {}) => void;
    setPreorder      : (preorder: TCart | {}) => void;
    setFavorites     : (favorites: number[] | []) => void;
    setCartTotal     : (cartTotal: number | 0) => void;
    setPreorderTotal : (preorderTotal: number | 0) => void;
    setFavoritesTotal: (favoritesTotal: number | 0) => void;
    setOrders        : (orders: number[] | []) => void;
    setOrdersTotal   : (ordersTotal: number | 0) => void;
}

const AppContext = createContext<IAppContextType | null>(null);

export default AppContext;