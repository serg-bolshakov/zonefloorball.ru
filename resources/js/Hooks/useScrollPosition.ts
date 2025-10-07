// Hooks/useScrollPosition.ts
import { useEffect, useState } from 'react';

export const useScrollPosition = () => {
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        // Функция для обновления позиции
        const updatePosition = () => {
            setScrollPosition(window.scrollY);
        };

        // Сразу получаем текущую позицию
        updatePosition();

        // Подписываемся на события скролла
        window.addEventListener('scroll', updatePosition);

        // Отписываемся при размонтировании компонента
        return () => window.removeEventListener('scroll', updatePosition);
    }, []);

    return scrollPosition;
};