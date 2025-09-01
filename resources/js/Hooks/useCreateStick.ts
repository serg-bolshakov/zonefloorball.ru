// resources/js/Hooks/useCreateStick.ts

import axios from 'axios';
import { API_ENDPOINTS } from '@/Constants/api';
import { toast } from 'react-toastify';
import { ApiError, NetworkError } from '@/Types/error';


interface ValidationErrors {
  [field: string]: string[];
}

export type TRequestStickData = {
  article     : string       ;
  categoryId  : number       ;
  brandId     : number       ;
  model       : string | null;
  marka       : string | null;
  shaftFlexId : number       ;
  colour      : string | null;
  material    : string | null;
  stickSizeId : number       ;
  weight      : string | null;
  prod_desc   : string | null;
  hookId      : number       ; 
  iffId       : number       ;
}

// Типы для ответа сервера
interface ICreateStickResponse {
    success: boolean;
    productId?: number;
    title?: string;
    message?: string;
    imgSrcBaseName?: string;
}

const useCreateStick = () => {
    const createStick = async (requestData: TRequestStickData): Promise<ICreateStickResponse> => {
        try {
            const response = await axios.post<ICreateStickResponse>(
                API_ENDPOINTS.CREATE_STICK, 
                requestData
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Обрабатываем только сетевые/HTTP ошибки
                if (error.response?.status === 422) {
                    const errors = error.response.data.errors as ValidationErrors;
                    Object.values(errors).forEach(msg => toast.error(msg[0]));
                }
                // Пробрасываем структурированную ошибку
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

    return { createStick };
};

export default useCreateStick;