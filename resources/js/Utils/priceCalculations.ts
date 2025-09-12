// Вынесем логику определения цены в отдельные функции
import { IProduct } from "@/Types/types";

export const getFinalProductPriceByMode = (
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
};