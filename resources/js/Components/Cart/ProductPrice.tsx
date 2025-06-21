// Компонент цены при варификации заказа
import { formatPrice } from '@/Utils/priceFormatter';
import { TUser } from '@/Types/types';

const ProductPrice = ({ 
    user,
    actual, 
    regular, 
    special,
    action,
    rank_discount,
    showTotal = true 
  }: { 
    user: TUser;
    actual: number; 
    regular: number; 
    special: number;
    action: number;
    rank_discount: number
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

      {user && (rank_discount > 0 && rank_discount < actual) && (
          user.client_type_id === 1 ? (        
            <div>а моя цена лучше: <span className='color-red'>{formatPrice(rank_discount)}&nbsp;<sup>₽</sup></span></div>
          ) : (
            <div>а наша цена лучше: <span className='color-red'>{formatPrice(rank_discount)}&nbsp;<sup>₽</sup></span></div>
          )
      )}
    </div>
  );

  export default ProductPrice;