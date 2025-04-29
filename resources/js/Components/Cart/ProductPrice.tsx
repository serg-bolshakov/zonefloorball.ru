// Компонент цены при варификации заказа
import { formatPrice } from '@/Utils/priceFormatter';

const ProductPrice = ({ 
    actual, 
    regular, 
    showTotal = true 
  }: { 
    actual: number; 
    regular: number; 
    showTotal?: boolean 
  }) => (
    <div className="product__price margin-tb4px fs12">
      {actual < regular ? (
        <>
          <div>сегодня супер цена: <span className="color-red">{formatPrice(actual)}&nbsp;<sup>₽</sup></span>
          {showTotal && (
            <span className="price--original line-through"> ({formatPrice(regular)})</span>
          )}</div>
        </>
      ) : (
            <div> сегодня отличная цена: <span className='color-green'>{formatPrice(regular)}&nbsp;<sup>₽</sup></span></div>
      )}
    </div>
  );

  export default ProductPrice;