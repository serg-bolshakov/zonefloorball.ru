// Компонент товара при варификации заказа
import { IProduct } from "@/Types/types";
import ProductPrice from "./ProductPrice";
import { formatPrice } from '@/Utils/priceFormatter';

const ProductItem = ({ product, index }: { product: IProduct; index: number }) => (
    <div className="order-confirmation__product">
      <h3 className="product__title">
        {index + 1}. {product.title}
      </h3>
      
      <ProductPrice 
        actual={product.price_actual ?? 0}
        regular={product.price_regular ?? 0}
      />
      
      <div className="basket-order__product-clearance">
        <span>{product.quantity} шт. по цене: {product.price_actual} на сумму: </span>
        <span>{formatPrice((product.quantity ?? 0) * (product.price_actual ?? 0))}&nbsp;<sup>₽</sup></span>
      </div>
    </div>
  );

  export default ProductItem;