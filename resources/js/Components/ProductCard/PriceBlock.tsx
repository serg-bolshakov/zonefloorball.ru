// resources/js/Components/ProductCard/PriceBlock.tsx
import React from 'react';
import { IProductCardResponse } from '@/Types/prodcard';
import useAppContext from '@/Hooks/useAppContext';

interface IPriceBlock {
    actualPrice             : IProductCardResponse['prodInfo']['actualPrice'];
    regularPrice            : IProductCardResponse['prodInfo']['regularPrice'];
    price_regular           : number | null;
    price_with_rank_discount: number | null;
    percent_of_rank_discount: number | null;
}

const PriceBlock: React.FC<IPriceBlock> = ({ actualPrice, regularPrice, price_regular, price_with_rank_discount, percent_of_rank_discount }) => {
    
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
    const { user } = useAppContext();

    console.log(user);
    console.log(user && price_with_rank_discount && price_regular);
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

            { user && price_with_rank_discount && price_regular && (
                <>    
                    <p className="margin-tb12px">
                    { user.client_type_id === 1
                        ? "(  но для меня цена лучше: "
                        : "(  но для нас цена лучше: "}
                        
                    </p>
                    
                    <div className="d-flex padding-left16px">
                        <div className="basket-favorites__priceCurrentSale">{formatPrice(price_with_rank_discount)}</div>
                        <div className="cardProduct-priceBeforSale">{formatPrice(price_regular)} <sup>&#8381;</sup></div>
                        <div className="basket-favorites__priceDiscountInPercentage">- { percent_of_rank_discount }&#37;</div>
                        )
                    </div>
                </>
            )} 
        </section>
    );
};

export default PriceBlock;