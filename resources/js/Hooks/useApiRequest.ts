// Hooks/useApiRequest.ts       -   универсальный хук для запросов:

import axios from 'axios';
import { ApiError, NetworkError } from '@/Types/error';


export const useApiRequest = () => {
    const makeRequest = async <T>(                                                          // Исходный endpoint с плейсхолдером: '/stick-properties/save-step2/{productId}'
        endpoint: string,
        data: any,
        params?: Record<string, string>                                                     // Параметры URL: { productId: '123' } // → /stick-properties/save-step2/123
    ): Promise<T> => {
        try {
            // Заменяем плейсхолдеры в URL
            let formattedEndpoint = endpoint;                                               // Исходный endpoint с плейсхолдером: '/stick-properties/save-step2/{productId}'
            if (params) {                                                                   // Параметры для замены: const params = { productId: '123' };
                Object.entries(params).forEach(([key, value]) => {                          // Object.entries превращает объект в массив пар [ключ, значение]: [ ['productId', '123'] ]
                    const placeholder = `{${key}}`;
                    if (formattedEndpoint.includes(placeholder)) {
                        formattedEndpoint = formattedEndpoint.replace(placeholder, value);  // formattedEndpoint.replace('{productId}', '123')
                    } else {
                        console.warn(`Плейсхолдер ${placeholder} не найден в URL`);
                    }    
                });                                                                         // Результат: '/stick-properties/save-step2/123'
            }

            const response = await axios.post<T>(formattedEndpoint, data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw {
                    type: 'api',
                    status: error.response?.status,
                    data: error.response?.data
                } as ApiError;
            }
            throw {
                type: 'network',
                message: 'Ошибка сети'
            } as NetworkError;
        }
    };

    return { makeRequest };
};
