// resources/js/Components/Cart/ProductItem.tsx - Компонент товара при верификации заказа

import { IProduct, TUser } from "@/Types/types";
import ProductPrice from "./ProductPrice";
import { formatPrice } from '@/Utils/priceFormatter';
import { isLegalUser, isIndividualUser } from "@/Types/types";
// import { calculateFinalPrice, getRealPreorderPrice } from '@/Utils/priceCalculations';
import { calculateProductPrice } from "@/Utils/priceCalculations";

interface IProductItemProps {
  product: IProduct;
  user: TUser;
  index: number;
  mode: 'cart' | 'preorder';
}

const ProductItem = ({ product, user, index, mode = 'cart' }: IProductItemProps) => {
  
  // console.log('ProductItem, mode', mode);
  
  /*const finalPrice = mode == 'preorder' ? getRealPreorderPrice(product) :
  
  calculateFinalPrice({
      price_regular: product.price_regular ?? 0,
      price_actual: product.price_actual ?? 0,
      price_with_action_discount: product.price_with_action_discount ?? null,
      price_with_rank_discount: product.price_with_rank_discount ?? null,
      isLegalUser: isLegalUser(user)
  });*/

  const finalPrice = calculateProductPrice({ product, user, mode });
  const total = (product.quantity ?? 0) * finalPrice;

  return (
    <div className="order-confirmation__product">
      <h3 className="product__title">
        {index + 1}. {product.title}
      </h3>
      
      {/* <ProductPrice 
        user={user}
        isLegalUser={isLegalUser(user)}
        isIndividualUser={isIndividualUser(user)}
        price_actual={product.price_actual ?? 0}
        price_regular={product.price_regular ?? 0}
        price_special={product.price_special ?? null}
        price_with_action_discount={product.price_with_action_discount ?? null}
        price_with_rank_discount={product.price_with_rank_discount ?? null}
        mode={mode}
      /> */}

      <ProductPrice 
        user={user}
        isLegalUser={isLegalUser(user)}
        isIndividualUser={isIndividualUser(user)}
        product={product}
        mode={mode}
      />
      
      <div className="basket-order__product-clearance">
        <span>
          {product.quantity} шт. по цене: {formatPrice(finalPrice)} на сумму: 
        </span>
        <span>{formatPrice(total)}&nbsp;<sup>₽</sup></span>
      </div>
    </div>
  );
};

export default ProductItem;



/*const ProductItem = ({ product, user, index }: { product: IProduct; user: TUser; index: number }) => (
    <div className="order-confirmation__product">
      <h3 className="product__title">
        {index + 1}. {product.title}
      </h3>
      
      <ProductPrice 
        user={ user }
        isLegalUser={isLegalUser(user)}
        isIndividualUser={isIndividualUser(user)}
        price_actual={product.price_actual ?? 0}
        price_regular={product.price_regular ?? 0}
        price_special={product.price_special ?? null}
        price_with_action_discount={product.price_with_action_discount ?? null}
        price_with_rank_discount={product.price_with_rank_discount ?? null}
      />
      
      <div className="basket-order__product-clearance">
        {product.price_with_rank_discount && product.price_with_rank_discount > 0 ? (
          <>
            <span>{product.quantity} шт. по цене: {product.price_with_rank_discount} на сумму: </span>
            <span>{formatPrice((product.quantity ?? 0) * (product.price_with_rank_discount))}&nbsp;<sup>₽</sup></span>
          </>
        ) : isLegalUser(user) && !product.price_with_rank_discount && product.price_with_action_discount ? ( 
          <>
            <span>{product.quantity} шт. по цене: {formatPrice(product.price_with_action_discount - Math.ceil(product.price_with_action_discount * ACQUIRING_PERCENTAGE))} на сумму: </span>
            <span>{formatPrice((product.quantity ?? 0) * (product.price_with_action_discount - Math.ceil(product.price_with_action_discount * ACQUIRING_PERCENTAGE)))}&nbsp;<sup>₽</sup></span>
          </>
        ) : (
          <>
            <span>{product.quantity} шт. по цене: {product.price_actual} на сумму: </span>
            <span>{formatPrice((product.quantity ?? 0) * (product.price_actual ?? 0))}&nbsp;<sup>₽</sup></span>
          </>
        )}
        

      </div>
    </div>
  );

  export default ProductItem;*/