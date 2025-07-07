// Hooks/useSafeLocation.ts
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

/**
 * Хук для безопасного получения текущего пути
 * Работает даже вне Router (использует window.location как fallback)
 */

export default function useSafeLocation() {
    const [pathname, setPathname] = useState(window.location.pathname);
    
    try {
        // Пытаемся использовать стандартный хук
        const location = useLocation();
        return location;
    } catch (e) {
        // Fallback: отслеживаем изменения пути вручную
        useEffect(() => {
            const handlePopstate = () => {
                setPathname(window.location.pathname);
            };
        
            window.addEventListener('popstate', handlePopstate);                    // Событие popstate ловит изменения при навигации (вперед/назад), поддержка истории браузера
            return () => window.removeEventListener('popstate', handlePopstate);    // Чистая отписка: removeEventListener предотвращает утечки памяти.
        }, []);
        
        return { pathname };
    }
}