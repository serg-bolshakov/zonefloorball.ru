// Вынесем логику определения цены в отдельные функции
// Utils/priceCalculations.ts

import { IProduct, TUser, isLegalUser, isIndividualUser } from "@/Types/types";
import { ACQUIRING_PERCENTAGE } from '@/Constants/global';

export interface PriceCalculationParams {
  product: IProduct;
  user: TUser;
  mode: 'cart' | 'preorder';
  
}

export const calculateProductPrice = (params: PriceCalculationParams): number => {
  const { product, user, mode = 'cart'} = params;
  
  if (mode === 'preorder') {
    return getRealPreorderPrice(product);
  }
  
  return getRealCartPrice(product, user);
};

export const getRealCartPrice = (product: IProduct, user: TUser): number => {

    const userIsLegal = user ? isLegalUser(user) : false;
  
    // Приоритет 1: Для юрлиц с эквайрингом
    if (userIsLegal && product.price_with_action_discount) {
        return product.price_with_action_discount - 
            Math.ceil(product.price_with_action_discount * ACQUIRING_PERCENTAGE);
    }
    
    // Приоритет 2: Ранговая скидка
    if (product.price_with_rank_discount) {
        return product.price_with_rank_discount;
    }
    
    // Приоритет 3: Акционная скидка
    if (product.price_with_action_discount) {
        return product.price_with_action_discount;
    }
    
    // Приоритет 4: Минимальная из доступных цен
    const prices = [
        product.price_special,
        product.price_actual,
        product.price_regular
    ].filter((p): p is number => p !== undefined && p !== null);
    
    return prices.length > 0 ? Math.min(...prices) : 0;
};

export const getRealPreorderPrice = (product: IProduct): number => {
    // Приоритет 1: Цена предзаказа со скидкой
    if (product.price_preorder && product.price_with_rank_discount) {
        return Math.min(product.price_preorder, product.price_with_rank_discount);
    }
    
    // Приоритет 2: Цена предзаказа
    if (product.price_preorder) {
        return product.price_preorder;
    }
    
    // Приоритет 3: Дефолтная цена (90% от обычной)
    return (product.price_regular ?? 0) * 0.9;
};


// Оставил для уже работающих участков кода, чтобы не посыпалось...
export interface IPriceCalculationParams {
  price_regular: number;
  price_actual: number;
  price_with_action_discount: number | null;
  price_with_rank_discount: number | null;
  isLegalUser: boolean;
}

export const calculateFinalPrice = (params: IPriceCalculationParams): number => {
    const {
        price_regular,
        price_actual,
        price_with_action_discount,
        price_with_rank_discount,
        isLegalUser
    } = params;

    if (isLegalUser && price_with_action_discount) {
        return price_with_action_discount - 
            Math.ceil(price_with_action_discount * ACQUIRING_PERCENTAGE);
    }

    if (price_with_rank_discount) {
        return price_with_rank_discount;
    }

    if (price_with_action_discount) {
        return price_with_action_discount;
    }

    return price_actual ?? price_regular;
};

export const getPriceDescription = (
    
        finalPrice: number,
        price_regular: number,
        price_with_rank_discount: number | null,
        isLegalUser: boolean,
        isIndividualUser: boolean
    
    ): { message: string; className: string } => {
        
        if (price_with_rank_discount && price_with_rank_discount < price_regular) {
            return {
            message: isIndividualUser ? "а моя цена лучше" : "а наша цена лучше",
            className: "color-red"
            };
        }

        if (isLegalUser && finalPrice < price_regular) {
            return {
            message: "но для юр. лиц цена ещё лучше!",
            className: "color-red"
            };
        }

        if (finalPrice < price_regular) {
            return {
            message: "сегодня супер цена",
            className: "color-red"
            };
        }

    return {
        message: "сегодня отличная цена",
        className: "color-green"
    };
};

/* export const getFinalProductPriceByMode = (
    product: IProduct, 
    mode: 'cart' | 'preorder'
    ): number => {
    return mode === 'preorder' 
        ? getRealPreorderPrice(product) 
        : getRealCartPrice(product);
};

export const getRealPreorderPrice = (product: IProduct): number => {
    if (product.price_preorder && product.price_with_rank_discount) {
        return Math.min(product.price_preorder, product.price_with_rank_discount);
    } else if (product.price_preorder && product.price_preorder > 0) {
        return product.price_preorder;
    }
    return (product.price_regular ?? 0) * 0.9; // Дефолтная скидка 10%
};


export const getRealCartPrice = (product: IProduct): number => {
    const prices = [
        product.price_special,
        product.price_with_rank_discount,
        product.price_actual,
        product.price_regular
    ].filter((p): p is number => (p !== undefined && p !== null));

    return prices.length > 0 ? Math.min(...prices) : 0;
};*/