// resources/js/contexts/AppContext.ts
// Создадим контекст для хранения данных, которые будут использоваться на всех страницах.

import { createContext } from "react";
import { User } from "../Types/types";
import { ICategoriesMenuArr } from "../Types/types";

// Экспортируем тип, чтобы его можно было использовать в других файлах
export interface IAppContextType {
    user: User | null;
    categoriesMenuArr: ICategoriesMenuArr | null;
    authBlockContentFinal: string;
    setUser: (user: User | null) => void;
    setCategoriesMenuArr: (categoriesMenuArr: ICategoriesMenuArr | null) => void;
    setAuthBlockContentFinal: (authBlockContentFinal: string) => void;
}

const AppContext = createContext<IAppContextType | null>(null);

export default AppContext;