// resources/js/Contexts/AppProvider.tsx
// этот файл содержит провайдер и логику управления состоянием...

import React, { useState, useEffect, ReactNode} from "react";
import axios from "axios";
import AppContext, { IAppContextType } from "./AppContext";
import { User, ICategoriesMenuArr, ICategoryItemFromDB } from "../Types/types";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface IAppProviderProps {
    children: ReactNode;
}

// Создадим интерфейс для объектов второго уровня меню информации о категориях с числовыми ключами, каждое значение - это объект типа ICategoryItemFromDB:


export const AppProvider: React.FC<IAppProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [categoriesMenuArr, setCategoriesMenuArr] = useState<ICategoriesMenuArr | null>(null);
    const [authBlockContentFinal, setAuthBlockContentFinal] = useState<string>('');
    const [categoriesInfo, setCategoriesInfo] = useState<ICategoryItemFromDB[]  | null>(null);    // массив категорий. categoriesInfo может быть null или undefined (например, данные ещё не загружены), пропишем это в типе:

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        axios.get('/api/initial-data')
            .then(response => {
                setUser(response.data.user);
                setCategoriesMenuArr(response.data.categoriesMenuArr);
                setAuthBlockContentFinal(response.data.authBlockContentFinal);
                setCategoriesInfo(response.data.categoriesInfo);
            })
            .catch(error => {
                console.error('Ошибка при загрузке данных: ', error);
                // Добавляем уведомление об ошибке
                toast.error('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
            });
    }, []);

    const contextValue: IAppContextType = {
        user,
        categoriesMenuArr,
        authBlockContentFinal,
        categoriesInfo,

        setUser,
        setCategoriesMenuArr,
        setAuthBlockContentFinal,
        setCategoriesInfo,      // setCategoriesInfo — это Dispatch<SetStateAction<ICategoryInfoItem[]> (т.е. функция, которая принимает массив категорий),
    }

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}
