//resources/js/Components/Cart/PriceBlock.tsx
import React from 'react';
import { IProduct } from '@/Types/types';
import { formatPrice } from '@/Utils/priceFormatter';

interface IPriceBlock {
    product: IProduct & {
        quantity: number;
        price_regular: number;
        price_actual: number;
    };
}

const PriceBlock: React.FC<IPriceBlock> = ({product}) => {
   
    // Деструктуризация с значениями по умолчанию
    const {
        id,
        quantity,
        price_regular,
        price_actual,
        price_with_rank_discount,
        percent_of_rank_discount,
        summa_of_action_discount
    } = product;

    // Вычисляем значения
    const getPriceData = () => {
        if (percent_of_rank_discount && price_with_rank_discount) {
          return {
            amount: price_with_rank_discount * quantity,
            discount: (price_regular - price_with_rank_discount) * quantity,
            showPrice: price_with_rank_discount
          };
        }
    
        if (summa_of_action_discount) {
          return {
            amount: price_actual * quantity,
            discount: summa_of_action_discount * quantity,
            showPrice: price_actual
          };
        }
    
        return {
          amount: price_actual * quantity,
          discount: 0,
          showPrice: price_actual
        };
    };

    const { amount, discount, showPrice } = getPriceData();

    return (
        <div 
        id={`basketProductRowTotalAmount_${id}`}
        className="d-flex aline-items-center"
        data-discount={discount}
        data-amount={amount}
        >
        {formatPrice(amount)}&nbsp;₽
        </div>
    );

};

export default PriceBlock;