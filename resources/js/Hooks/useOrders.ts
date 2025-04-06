// resources/js/Hooks/useOrders.ts
import axios from "axios";
import { useEffect, useState } from "react"

export const useOrders = (userId?: number) => {
    const [orders, setOrders] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadOrders = async () => {
            setIsLoading(true);
            try {
                if (userId) {
                    const { data } = await axios.get(`/api/users/${userId}/orders`);
                    setOrders(data.orderIds);
                } else {
                    const localData = localStorage.getItem('userData');
                    if (localData) {
                        const parsed = JSON.parse(localData);
                        setOrders(parsed.guestOrders || []);
                    }
                }
            } finally {
                setIsLoading(false);
            }
        }; 
        loadOrders(); 
    }, [userId]);

    return { orders, isLoading };
};