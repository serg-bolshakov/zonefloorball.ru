// resources/js/Contexts/AppProvider.tsx
// этот файл содержит провайдер и логику управления состоянием...

import React, { useState, useEffect, ReactNode} from "react";
import axios from "axios";
import AppContext, { IAppContextType } from "./AppContext";
import { TUser, ICategoriesMenuArr, ICategoryItemFromDB } from "../Types/types";
import { TCart } from "./UserData/UserDataContext";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface IAppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<IAppProviderProps> = ({ children }) => {
    const [user, setUser] = useState<TUser | null>(null);
    const [categoriesMenuArr, setCategoriesMenuArr] = useState<ICategoriesMenuArr | null>(null);
    const [authBlockContentFinal, setAuthBlockContentFinal] = useState<string>('');
    const [categoriesInfo, setCategoriesInfo] = useState<ICategoryItemFromDB[]  | null>(null);    // массив категорий. categoriesInfo может быть null или undefined (например, данные ещё не загружены), пропишем это в типе:
    const [cart, setCart] = useState<TCart>({});
    const [favorites, setFavorites] = useState<number[]>([]);
    const [cartTotal, setCartTotal] = useState<number>(0);
    const [favoritesTotal, setFavoritesTotal] = useState<number>(0);
    const [orders, setOrders] = useState<string[]>([]);
    const [ordersTotal, setOrdersTotal] = useState<number>(0);

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        // console.log('APPProvider, useEffect: user', user);
        const loadData = async () => {
            axios.get('/api/initial-data')
                .then(response => {
                    console.log(response.data.cart_changes.new_arrivals);
                    setUser(response.data.user);
                    setCategoriesMenuArr(response.data.categoriesMenuArr);
                    setAuthBlockContentFinal(response.data.authBlockContentFinal);
                    setCategoriesInfo(response.data.categoriesInfo);
                    setCart(response.data.cart);
                    setFavorites(response.data.favorites);
                    setOrders(response.data.orders);
                })
                .catch(error => {
                    console.error('Ошибка при загрузке данных в AppProvider.tsx: ', error);
                    // Добавляем уведомление об ошибке
                    toast.error('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
                });
        };
        
        loadData();
        
    }, []);

    // console.log('APPProvider: user', user);

    const contextValue: IAppContextType = {
        user, setUser,
        categoriesMenuArr, setCategoriesMenuArr,
        authBlockContentFinal, setAuthBlockContentFinal,
        categoriesInfo, setCategoriesInfo,
        cart, favorites, cartTotal, favoritesTotal, orders, ordersTotal,
        setCart, setFavorites, setCartTotal, setFavoritesTotal, setOrders, setOrdersTotal,
    }

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}
