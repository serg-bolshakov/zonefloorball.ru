// resources/js/Hooks/useLocalStorageData.ts
import axios from "axios";
import { useEffect, useState } from "react";

type LocalData = {
    cart: Array<{id: number; quantity: number}>;
    favorites: number[];
    guestOrders: number[];
}

export const useLocalStorageData = () => {
    const [data, setData] = useState<LocalData>({
        cart: [],
        favorites: [],
        guestOrders: []
    });

    // Загрузка при инициализации
    useEffect(() => {
        const saveData = localStorage.getItem('userData');
        if (saveData) {
            try {
                setData(JSON.parse(saveData));
            } catch {
                localStorage.removeItem('userData');
            }
        }
    }, []);

    // Проверка наличия товаров
    const verifyCart = async () => {
        const response = await axios.post('/api/verify-cart', {ids: data.cart.map(i => i.id)});
        const availableItems = data.cart.filter(item =>
            response.data.availableIds.includes(item.id)
        );

        if (availableItems.length !== data.cart.length) {
            const movedToFavorites = data.cart
                .filter(item => !response.data.availableIds.includes(item.id))
                .map(item => item.id);

            setData(prev => ({
                ...prev,
                cart: availableItems,
                favorites: [...new Set([...prev.favorites, ...movedToFavorites])]
            }));
        }
    };

    return {
        ...data,
        verifyCart,
        updateData: (newData: Partial<LocalData>) => {
            setData(prev => {
                const updated = { ...prev, ...newData };
                localStorage.setItem('userData', JSON.stringify(updated));
                return updated;
            });
        }
    };

};