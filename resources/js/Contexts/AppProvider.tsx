// resources/js/Contexts/AppProvider.tsx
// этот файл содержит провайдер и логику управления состоянием...

import React, { useState, useEffect, ReactNode} from "react";
import axios from "axios";
import AppContext, { IAppContextType } from "./AppContext";
import { User, ICategoriesMenuArr } from "../Types/types";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface IAppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<IAppProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [categoriesMenuArr, setCategoriesMenuArr] = useState<ICategoriesMenuArr | null>(null);
    const [authBlockContentFinal, setAuthBlockContentFinal] = useState<string>('');

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        axios.get('/api/initial-data', {
            withCredentials: true,
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            }
        })
            .then(response => {
                setUser(response.data.user);
                setCategoriesMenuArr(response.data.categoriesMenuArr);
                setAuthBlockContentFinal(response.data.authBlockContentFinal);
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
        setUser,
        setCategoriesMenuArr,
        setAuthBlockContentFinal,
    }

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}
