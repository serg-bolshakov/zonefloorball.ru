// resources/js/Components/ProductOrderTable/ProductTableRow.tsx - Компонент строки таблицы
import { IProduct } from "@/Types/types";
import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { formatPrice } from "@/Utils/priceFormatter";

export const ProductTableRow: React.FC<{
  product: IProduct;
  isSelected: boolean;
  onSelect: (product: IProduct) => void;
  onQuantityChange: (quantity: number) => void;
  user: any;
}> = ({ product, isSelected, onSelect, onQuantityChange, user }) => {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isSelected) {
      onQuantityChange(quantity);
    }
  }, [quantity, isSelected]);

  const price = user?.price_with_rank_discount || product.price_actual;

  return (
    <tr className={isSelected ? 'selected' : ''}>
      <td className="sticky-col">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(product)}
        />
      </td>
      <td>
        <img 
          src={`/storage/${product.img_link}`} 
          alt={product.title}
          className="product-thumbnail"
          loading="lazy"
        />
      </td>
      <td>
        <Link href={`/products/card/${product.prod_url_semantic}`}>
          {product.title}
        </Link>
      </td>
      <td>{product.article}</td>
      <td>{formatPrice(price)} ₽</td>
      <td>
        <input
          type="number"
          min="1"
          max={product.on_sale}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          disabled={!isSelected}
          className="quantity-input"
        />
      </td>
      <td>{isSelected ? formatPrice(price * quantity) + ' ₽' : '-'}</td>
    </tr>
  );
};
