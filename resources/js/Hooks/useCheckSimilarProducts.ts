// hooks/useCheckSimilarProduct.ts

import { useCallback, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/Constants/api';
import { toast } from 'react-toastify';
import { useRef } from 'react';


interface ValidationErrors {
  [field: string]: string[];
}

type TRequestSimilarData = {
  categoryId: number,
  brandId: number,
  model: string | null,
  marka: string | null,
  shaftFlexId: number | null,
  colour: string | null
}

// Типы для ответа сервера
interface ISimilarProductResponse {
    status: 'success' | 'error';
    message?: string;
    data?: any;
}

const useCheckSimilarProducts = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const controllerRef = useRef<AbortController | null>(null);

    const checkSimilarProduct = useCallback(
      async (
        requestData: TRequestSimilarData,
        options?: {
          onSuccess?: (response: ISimilarProductResponse) => void;
          onError?: (error: unknown) => void;
        }
      ): Promise<ISimilarProductResponse> => {

        // Отменяем предыдущий запрос, если он есть
        controllerRef.current?.abort();

        // Создаём AbortController для управления отменой запроса
        // создаёт объект, который позволяет отменить асинхронные операции (например, HTTP-запросы).
        const controller = new AbortController();       // AbortController - встроенный браузерный API для отмены операций (запросов, таймеров и т.д.)
        controllerRef.current = controller;

        try {
          setIsLoading(true);
          const endpoint = API_ENDPOINTS.CHECK_SIMILAR_PRODUCTS;
    
          const response = await axios.post<ISimilarProductResponse>(endpoint, {
            ...requestData, 
            action: 'checkSimilarProduct', 
            }, {
              signal: controller.signal,                  // controller.signal - это объект AbortSignal, который передаётся в axios (или fetch).
              headers: {
                  'Content-Type': 'application/json',     // Явно указываем тип - без этого не работало изначально... в том числе...
                  'X-Requested-With': 'XMLHttpRequest',
              }
            }
          );
    
          if (!controller.signal.aborted) {
            console.log('Response', response.data);
            return response.data;
          }

          throw new Error('Request was aborted');
          
        } catch (err) {
          if (axios.isAxiosError(err)) {
            if (err.response?.status === 422) {
              const errors = err.response.data.errors as ValidationErrors;
              Object.values(errors).forEach(msg => toast.error(msg[0]));
            } else if (err.response?.status === 403 && err.response.data.requires_verification) {
              toast.error(err.response?.data.message || 'Ошибка сервера');
              window.location.href = err.response.data.redirect_url;
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

    return { checkSimilarProduct, isLoading };
    
};

export default useCheckSimilarProducts;