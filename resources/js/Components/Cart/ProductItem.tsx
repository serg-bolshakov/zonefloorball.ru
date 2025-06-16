// Компонент товара при варификации заказа
import { IProduct, TUser } from "@/Types/types";
import ProductPrice from "./ProductPrice";
import { formatPrice } from '@/Utils/priceFormatter';

const ProductItem = ({ product, user, index }: { product: IProduct; user: TUser; index: number }) => (
    <div className="order-confirmation__product">
      <h3 className="product__title">
        {index + 1}. {product.title}
      </h3>
      
      <ProductPrice 
        user={ user }
        actual={product.price_actual ?? 0}
        regular={product.price_regular ?? 0}
        special={product.price_special ?? 0}
        action={product.price_with_action_discount ?? 0}
        rank_discount={product.price_with_rank_discount ?? 0}
      />
      
      <div className="basket-order__product-clearance">
        {product.price_with_rank_discount && product.price_with_rank_discount > 0 ? (
          <>
            <span>{product.quantity} шт. по цене: {product.price_with_rank_discount} на сумму: </span>
            <span>{formatPrice((product.quantity ?? 0) * (product.price_with_rank_discount))}&nbsp;<sup>₽</sup></span>
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

  export default ProductItem;