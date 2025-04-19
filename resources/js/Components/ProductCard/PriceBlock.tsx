// resources/js/Components/ProductCard/PriceBlock.tsx
import React from 'react';
import { IProductCardResponse } from '@/Types/prodcard';

interface IPriceBlock {
    actualPrice:    IProductCardResponse['prodInfo']['actualPrice'];
    regularPrice:   IProductCardResponse['prodInfo']['regularPrice'];
}

const PriceBlock: React.FC<IPriceBlock> = ({ actualPrice, regularPrice }) => {
  
    // Функция для форматирования цены
    /*     const formatPrice = (price: number): string => {
            return price.toLocaleString('ru-RU', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            });
        };
    */
    const formatPrice = (price: number) => price.toLocaleString('ru-RU');

    return (
        <section className="cardProduct-productPrice__block">
            <div>Лучшая цена:</div>
            {actualPrice?.price_value && regularPrice?.price_value ? (
                actualPrice.price_value < regularPrice.price_value ? (    
                    <>
                        <div className="cardProduct-priceCurrentSale nobr">
                            {formatPrice(actualPrice.price_value)} <sup>&#8381;</sup>
                        </div>
                        <div className="cardProduct-priceBeforSale nobr">
                            {formatPrice(regularPrice.price_value)} <sup>&#8381;</sup>
                        </div>
                        <div className="cardProduct-priceDiscountInPercentage nobr">
                            - {Math.ceil(100 - (actualPrice.price_value / regularPrice.price_value) * 100)}%
                        </div>
                    </>
                ) : (
                        <div className="cardProduct-priceCurrent nobr">{formatPrice(regularPrice.price_value)} <sup>&#8381;</sup></div>
                )
                ) : <div className="cardProduct-priceCurrent nobr">К сожалению, цена не актуальна</div>
            }

            { actualPrice.date_end && ( 
                <div className="cardProduct-priceValidPeriod nobr">действует до: { actualPrice.date_end }</div>
            )}
        </section>
    );
};

export default PriceBlock;