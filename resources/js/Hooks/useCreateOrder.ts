// hooks/useCreateOrder.ts
import { useCallback, useState } from 'react';
import axios from 'axios';
import { IDeliverySelectionData } from '@/Types/delivery';
import { TCustomer } from '@/Types/types';
import { getCookie } from '@/Utils/cookies';
import { API_ENDPOINTS } from '@/Constants/api';
import { toast } from 'react-toastify';
import { useRef } from 'react';

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

interface ValidationErrors {
  [field: string]: string[];
}

const useCreateOrder = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    //const [error, setError] = useState<string | null>(null);
    const controllerRef = useRef<AbortController | null>(null);

    const createOrder = useCallback(async <T extends TCustomer>(
        orderData: OrderData<T>,
        options: {
            isReserve?: boolean;
            paymentMethod?: 'online' | 'invoice';
            onSuccess?: (orderId: string) => void;
            //onValidationError?: (errors: Record<string, string[]>) => void;
          }
    ) => {

        // Отменяем предыдущий запрос, если он есть
        controllerRef.current?.abort();

        // Создаём AbortController для управления отменой запроса
        // создаёт объект, который позволяет отменить асинхронные операции (например, HTTP-запросы).
        const controller = new AbortController();       // AbortController - встроенный браузерный API для отмены операций (запросов, таймеров и т.д.)
        controllerRef.current = controller;

        try {
          setIsLoading(true);
          //setError(null);
    
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
          });
    
          if (!controller.signal.aborted) {
            options.onSuccess?.(response.data.orderId);
            return response.data;
          }
        } catch (err) {
          if (axios.isAxiosError(err)) {
            if (err.response?.status === 422) {
              const errors = err.response.data.errors as ValidationErrors;
              Object.values(errors).forEach(msg => toast.error(msg[0]));
            } else {
              toast.error(err.response?.data.message || 'Ошибка сервера');
            }
          } else {
            toast.error('Неизвестная ошибка');
          }
          throw err; // Пробрасываем ошибку для обработки в компоненте
        } finally {
            setIsLoading(false);
            controllerRef.current = null;
        }
    }, []);

    return { createOrder, isLoading };
    
};

export default useCreateOrder;