// resources/js/Components/Cart/ProductPrice.tsx - Компонент цены при верификации заказа

import { formatPrice } from '@/Utils/priceFormatter';
import { IProduct, TUser } from '@/Types/types';
// import { calculateFinalPrice, getPriceDescription } from '@/Utils/priceCalculations';
import { calculateProductPrice, getPriceDescription } from '@/Utils/priceCalculations';

interface IProductPriceProps {
  user: TUser;
  isLegalUser: boolean;
  isIndividualUser: boolean;
  // price_actual: number;
  // price_regular: number;
  // price_special: number | null;
  // price_with_action_discount: number | null;
  // price_with_rank_discount: number | null;
  product: IProduct;
  showTotal?: boolean;
  mode: 'cart' | 'preorder';
}

const ProductPrice = (props: IProductPriceProps) => {
  const {
    user,
    isLegalUser,
    isIndividualUser,
    // price_actual,
    // price_regular,
    // price_with_action_discount,
    // price_with_rank_discount,
    product,
    showTotal = true,
    mode
  } = props;

  /*const finalPrice = calculateFinalPrice({
    price_regular,
    price_actual,
    price_with_action_discount,
    price_with_rank_discount,
    isLegalUser
  });*/

  const finalPrice = calculateProductPrice({
    product: props.product, 
    user: props.user,
    mode: props.mode
  });

  const { message, className } = getPriceDescription(
    finalPrice,
    product.price_regular!,
    product.price_with_rank_discount ?? null,
    isLegalUser,
    isIndividualUser
  );

  return (
    <div className="product__price margin-tb4px fs12">
      <div>
        {message}: <span className={className}>{formatPrice(finalPrice)}&nbsp;<sup>₽</sup></span>
        {product.price_regular && showTotal && finalPrice < product.price_regular && (
          <span className="price--original line-through"> ({formatPrice(product.price_regular)})</span>
        )}
      </div>
    </div>
  );
};

export default ProductPrice;

  /* const ProductPrice = ({ 
      user,
      isLegalUser,
      isIndividualUser,
      price_actual, 
      price_regular, 
      price_special,
      price_with_action_discount,
      price_with_rank_discount,
      showTotal = true 
    }: { 
      user: TUser;
      isLegalUser: boolean;
      isIndividualUser: boolean;
      price_actual: number; 
      price_regular: number; 
      price_special: number | null;
      price_with_action_discount: number | null;
      price_with_rank_discount: number | null
      showTotal?: boolean 
    }) => {
      console.log('price_actual', price_actual);
      console.log('price_regular', price_regular);
      console.log('price_special', price_special);
      console.log('price_with_action_discount', price_with_action_discount);
      console.log('price_with_rank_discount', price_with_rank_discount);

      const getProductPrice = (price_regular: number, price_with_rank_discount: number | null, price_with_action_discount: number | null, price_actual: number) => {
        // Определяем базовую цену в зависимости от типа товара
        let finalPrice = price_regular;
                  
        // Для товаров в корзине (не предзаказ)
            if (isLegalUser && !price_with_rank_discount && price_with_action_discount) {
                // Для юр. лиц со скидкой
                finalPrice = price_with_action_discount - 
                        Math.ceil(price_with_action_discount * ACQUIRING_PERCENTAGE);
            } else if (price_with_rank_discount) {
                // Ранговая скидка
                finalPrice = price_with_rank_discount;
            } else if (price_with_action_discount) {
                // Акционная скидка
                finalPrice = price_with_action_discount;
            } else if (price_actual) {
                // Акционная скидка для гостей
                finalPrice = price_actual;
            } 

        // Для предзаказов обычно используется price_actual или специальная цена
        return finalPrice;
      };

      return (
        <div className="product__price margin-tb4px fs12">
          {price_actual < price_regular ? (
            <>
              <div>сегодня супер цена: <span className="color-red">{formatPrice(price_actual)}&nbsp;<sup>₽</sup></span>
              {showTotal && (
                <span className="price--original line-through"> ({formatPrice(price_regular)})</span>
              )}</div>
            </>
          ) : (
                <div> сегодня отличная цена: <span className='color-green'>{formatPrice(price_regular)}&nbsp;<sup>₽</sup></span></div>
          )}

          {user && price_with_rank_discount && (price_with_rank_discount < price_actual) && (
              isIndividualUser ? (        
                <div>а моя цена лучше: <span className='color-red'>{formatPrice(price_with_rank_discount)}&nbsp;<sup>₽</sup></span></div>
              ) : (
                <div>а наша цена лучше: <span className='color-red'>{formatPrice(price_with_rank_discount)}&nbsp;<sup>₽</sup></span></div>
              )
          )}

          {isLegalUser && !price_with_rank_discount && price_with_action_discount && (
              <div className='text-align-right'>но для цена ещё лучше!: <span className='color-red'>{formatPrice(price_with_action_discount - 
                        Math.ceil(price_with_action_discount * ACQUIRING_PERCENTAGE))}&nbsp;<sup>₽</sup></span>
              </div>
          )}

        </div>
      );
    };
  

    export default ProductPrice;
  */