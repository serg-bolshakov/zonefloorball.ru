// resources/js/contexts/AppContext.ts
// Создадим контекст для хранения данных, которые будут использоваться на всех страницах.

import { createContext } from "react";
import { User } from "../Types/types";
import { ICategoriesMenuArr, ICategoryItemFromDB } from "../Types/types";

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
}

const AppContext = createContext<IAppContextType | null>(null);

export default AppContext;