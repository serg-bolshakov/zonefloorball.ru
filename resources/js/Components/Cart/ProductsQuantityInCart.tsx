//resources/js/Components/Cart/ProductsQuantityInCart.tsx
import React from 'react';

interface CartQuantityProp {
  cartTotal: number;
}

const ProductsQuantityInCart: React.FC<CartQuantityProp> = ({ cartTotal }) => {
    
    // Функция для склонения слова "товар"
    const getProductWord = (quantity: number): string => {
      const lastDigit = quantity % 10;
      const lastTwoDigits = quantity % 100;
  
      if (quantity === 0) return 'товаров';
      if (lastDigit === 1 && lastTwoDigits !== 11) return 'товар';
      if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) return 'товара';
      return 'товаров';
    };
  
    // Форматирование числа (добавляем пробелы между разрядами)
    const formattedQuantity = new Intl.NumberFormat('ru-RU').format(cartTotal);
  
    return (
      <h3>Всего в корзине: <strong>{formattedQuantity}</strong> {getProductWord(cartTotal)},</h3>
    );
  };
  
  export default ProductsQuantityInCart;

/* let basketPriceNoDeliveryBlockH3elemQuantity = document.createElement('h3');
    if((basketProductQuantityTotal == 1 || basketProductQuantityTotal % 10 == 1) && basketProductQuantityTotal != 11) {
        basketPriceNoDeliveryBlockH3elemQuantity.innerHTML = 'Всего в корзине:  ' + '<b>' + new Intl.NumberFormat('ru-RU').format(basketProductQuantityTotal) + '</b>' +' товар, ' ;
    } else if((basketProductQuantityTotal == 2 || basketProductQuantityTotal % 10 == 2 || basketProductQuantityTotal == 3 || basketProductQuantityTotal % 10 == 3 || basketProductQuantityTotal == 4 || basketProductQuantityTotal % 10 == 4) && basketProductQuantityTotal != 12 && basketProductQuantityTotal != 13  && basketProductQuantityTotal != 14) {
        basketPriceNoDeliveryBlockH3elemQuantity.innerHTML = 'Всего в корзине:  ' + '<b>' + new Intl.NumberFormat('ru-RU').format(basketProductQuantityTotal) + '</b>' +' товара, ' ;
    } else {
        basketPriceNoDeliveryBlockH3elemQuantity.innerHTML = 'Всего в корзине:  ' + '<b>' + new Intl.NumberFormat('ru-RU').format(basketProductQuantityTotal) + '</b>' +' товаров, ' ;
} */