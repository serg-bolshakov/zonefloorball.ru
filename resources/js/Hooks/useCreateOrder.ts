// hooks/useCreateOrder.ts
import { useCallback, useState } from 'react';
import axios from 'axios';
import { IDeliverySelectionData } from '@/Types/delivery';
import { TCustomer } from '@/Types/types';
import { isGuest, isIndividual, isLegal } from '@/Types/types';
import { getCookie } from '@/Utils/cookies';
import { API_ENDPOINTS } from '@/Constants/api';

//type CustomerData = IGuestCustomerData | TCustomer;

interface OrderData<T extends TCustomer> {
    products: Array<{
      id: number;
      quantity: number;
      price: number;
    }>;
    customer: T;
    delivery: IDeliverySelectionData;
    total: number;
    paymentMethod?: 'online' | 'invoice';
}

const useCreateOrder = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const createOrder = useCallback(async <T extends TCustomer>(
        orderData: OrderData<T>,
        options: {
            isReserve?: boolean;
            paymentMethod?: 'online' | 'invoice';
            onSuccess?: (orderId: string) => void;
          }
    ) => {
        // Создаём AbortController для управления отменой запроса
        // создаёт объект, который позволяет отменить асинхронные операции (например, HTTP-запросы).
        const controller = new AbortController();       // AbortController - встроенный браузерный API для отмены операций (запросов, таймеров и т.д.)

        try {
          setIsLoading(true);
          setError(null);
    
          const endpoint = options.isReserve 
            ? API_ENDPOINTS.ORDER_CREATE
            : API_ENDPOINTS.ORDER_CREATE;
    
            console.log('Sending POST to:', endpoint, 'with data:', {
                ...orderData,
                _token: getCookie('XSRF-TOKEN')
            });

          const response = await axios.post(endpoint, {
            ...orderData,
            paymentMethod: options.paymentMethod,
            _token: getCookie('XSRF-TOKEN')
          }, {
            signal: controller.signal,                  // controller.signal - это объект AbortSignal, который передаётся в axios (или fetch).
            headers: {
                'Content-Type': 'application/json',     // Явно указываем тип - без этого не работало изначально... в том числе...
                'X-Requested-With': 'XMLHttpRequest',
            }
          }).catch(error => {
            console.error('Full error:', {
                config: error.config,
                response: error.response?.data
            });
            throw error;
          });
    
          console.log(response);

          if (!controller.signal.aborted) {
            options.onSuccess?.(response.data.orderId);
            return response.data;
          }
        } catch (err) {
          if (!axios.isCancel(err)) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err; // Пробрасываем ошибку для обработки в компоненте
          }
        } finally {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        }
    }, []);

    return { createOrder, isLoading, error };
    
};

export default useCreateOrder;