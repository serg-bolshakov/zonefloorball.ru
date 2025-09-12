//resources/js/Components/OrderProcessing/PriceBlockOrderProcessing.tsx
import React from 'react';
import { IProduct } from '@/Types/types';
import { formatPrice } from '@/Utils/priceFormatter';
import { TMode } from './OrderProcess';
import { useCallback } from 'react';
import { getFinalProductPriceByMode } from '@/Utils/priceCalculations';

interface IPriceBlock {
    product: IProduct & {
        id: number;
        quantity?: number;
        price_regular?: number;
        price_actual?: number;
        price_special?: number;
        price_with_rank_discount?: number;
        price_preorder?: number | null;
    };
    mode: TMode;
}

const PriceBlockOrderProcessing: React.FC<IPriceBlock> = ({product, mode}) => {
    const getFinalProductAmount = useCallback(() => {
        const price = getFinalProductPriceByMode(product, mode);
        // console.log('price', price);
        return price * (product.quantity ?? 0);
    }, [mode, product]); // Зависимости явные

    return (
        <div className="d-flex aline-items-center">
            {formatPrice(getFinalProductAmount())}&nbsp;₽
        </div>
    );
};

// export default PriceBlockOrderProcessing;

export default React.memo(PriceBlockOrderProcessing, (prev, next) => 
  prev.product.id === next.product.id && 
  prev.mode === next.mode &&
  prev.product.quantity === next.product.quantity
);

/** Добавление React.memo
 *  Предотвращает лишние рендеры при одинаковых пропсах
 */