// resources/js/Hooks/useAppContext.ts

/**
 * useAppContext — это кастомный хук, который упрощает использование контекста. Внутри он использует useContext(AppContext),
 * чтобы получить доступ к значениям, переданным в AppContext.Provider.
 * Теперь вместо того чтобы писать useContext(AppContext) в каждом компоненте, мы можем просто использовать useAppContext().
 */
import { useContext } from 'react';
import AppContext from '../Contexts/AppContext'; // Импортируем контекст

const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext должен быть использован внутри AppProvider');
    }
    return context;
};

export default useAppContext;