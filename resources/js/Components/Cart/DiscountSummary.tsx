//resources/js/Components/Cart/DiscountSummary.tsx
import React from 'react';
import { formatPrice } from '@/Utils/priceFormatter';

interface DiscountSummaryProps {
    regularTotal: number;
    discountedTotal: number;
}
  
const DiscountSummary: React.FC<DiscountSummaryProps> = ({ regularTotal, discountedTotal }) => {
    const discountAmount = regularTotal - discountedTotal;
    const discountPercent = Math.round((discountAmount / regularTotal) * 100);
  
    return (
      <div className="fs12 basket-res__no-delivery">
        <p className="">Скидка на товары составила: &nbsp; <span className="color-red">
          {/* {new Intl.NumberFormat('ru-RU').format(discountAmount)} ₽ ({discountPercent}%) */}
          {formatPrice(discountAmount)}<sup>₽</sup> (или {discountPercent}%)</span>
        </p>
      </div>
    );
};

export default DiscountSummary;