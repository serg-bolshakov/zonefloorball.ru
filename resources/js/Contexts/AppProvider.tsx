// resources/js/Contexts/AppProvider.tsx
// этот файл содержит провайдер и логику управления состоянием...

import React, { useState, useEffect, ReactNode, useMemo } from "react";
import axios from "axios";
import AppContext, { IAppContextType } from "./AppContext";
import { TUser, ICategoriesMenuArr, ICategoryItemFromDB } from "../Types/types";
import { TCart } from "./UserData/UserDataContext";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface IAppProviderProps {
    children: ReactNode;
    initialData?: Partial<IAppContextType>; // Добавляем опциональные начальные данные
}

/*export const AppProvider: React.FC<IAppProviderProps> = ({ children, initialData = {} }) => {
    // Инициализируем состояние с initialData или null
    const [user, setUser] = useState<TUser | null>(initialData.user || null);
    const [categoriesMenuArr, setCategoriesMenuArr] = useState<ICategoriesMenuArr | null>(initialData.categoriesMenuArr || null);
    const [authBlockContentFinal, setAuthBlockContentFinal] = useState<string>(initialData.authBlockContentFinal || '');
    const [categoriesInfo, setCategoriesInfo] = useState<ICategoryItemFromDB[] | null>(initialData.categoriesInfo || null);
    const [cart, setCart] = useState<TCart>(initialData.cart || {});
    const [favorites, setFavorites] = useState<number[]>(initialData.favorites || []);
    const [cartTotal, setCartTotal] = useState<number>(initialData.cartTotal || 0);
    const [favoritesTotal, setFavoritesTotal] = useState<number>(initialData.favoritesTotal || 0);
    const [orders, setOrders] = useState<number[]>(initialData.orders || []);
    const [ordersTotal, setOrdersTotal] = useState<number>(initialData.ordersTotal || 0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    // Флаг для проверки, нужно ли загружать данные
    const shouldFetchData = !initialData.user && !isLoading && !error;

    // Загрузка данных
    useEffect(() => {
        if (!shouldFetchData) return;

        const loadData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await axios.get('/api/initial-data');
                console.log('Initial data loaded:', response.data);

                setUser(response.data.user);
                setCategoriesMenuArr(response.data.categoriesMenuArr);
                setAuthBlockContentFinal(response.data.authBlockContentFinal);
                setCategoriesInfo(response.data.categoriesInfo);
                setCart(response.data.cart);
                setFavorites(response.data.favorites);
                setOrders(response.data.orders);
                setCartTotal(response.data.cartTotal || 0);
                setFavoritesTotal(response.data.favoritesTotal || 0);
                setOrdersTotal(response.data.ordersTotal || 0);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError(err as Error);
                toast.error('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [shouldFetchData]);

    // Обновляем данные пользователя
    const updateUserData = async () => {
        try {
            const response = await axios.get('/api/user');
            setUser(response.data.user);
            return response.data.user;
        } catch (err) {
            console.error('Ошибка при обновлении пользователя:', err);
            throw err;
        }
    };

    // Мемоизируем контекст, чтобы избежать лишних ререндеров
    const contextValue = useMemo<IAppContextType>(() => ({
        user, setUser,
        categoriesMenuArr, setCategoriesMenuArr,
        authBlockContentFinal, setAuthBlockContentFinal,
        categoriesInfo, setCategoriesInfo,
        cart, setCart,
        favorites, setFavorites,
        cartTotal, setCartTotal,
        favoritesTotal, setFavoritesTotal,
        orders, setOrders,
        ordersTotal, setOrdersTotal,
        isLoading,
        error,
        updateUserData
    }), [
        user, categoriesMenuArr, authBlockContentFinal, categoriesInfo,
        cart, favorites, cartTotal, favoritesTotal, orders, ordersTotal,
        isLoading, error
    ]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

*/

export const AppProvider: React.FC<IAppProviderProps> = ({ children }) => {
    const [user, setUser] = useState<TUser | null>(null);
    const [categoriesMenuArr, setCategoriesMenuArr] = useState<ICategoriesMenuArr | null>(null);
    const [authBlockContentFinal, setAuthBlockContentFinal] = useState<string>('');
    const [categoriesInfo, setCategoriesInfo] = useState<ICategoryItemFromDB[]  | null>(null);    // массив категорий. categoriesInfo может быть null или undefined (например, данные ещё не загружены), пропишем это в типе:
    const [cart, setCart] = useState<TCart>({});
    const [favorites, setFavorites] = useState<number[]>([]);
    const [cartTotal, setCartTotal] = useState<number>(0);
    const [favoritesTotal, setFavoritesTotal] = useState<number>(0);
    const [orders, setOrders] = useState<number[]>([]);
    const [ordersTotal, setOrdersTotal] = useState<number>(0);

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        // console.log('APPProvider, useEffect: user', user);
        const loadData = async () => {
            axios.get('/api/initial-data')
                .then(response => {
                    // console.log(response.data.cart_changes.new_arrivals);
                    setUser(response.data.user);
                    setCategoriesMenuArr(response.data.categoriesMenuArr);
                    setAuthBlockContentFinal(response.data.authBlockContentFinal);
                    setCategoriesInfo(response.data.categoriesInfo);
                    setCart(response.data.cart);
                    setFavorites(response.data.favorites);
                    setOrders(response.data.orders);
                })
                .catch(error => {
                    // console.error('Ошибка при загрузке данных в AppProvider.tsx: ', error);
                    // Добавляем уведомление об ошибке
                    toast.error('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
                });
        };
        
        loadData();
        
    }, []);

    // console.log('APPProvider: user', orders);

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
