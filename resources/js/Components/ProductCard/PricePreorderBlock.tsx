// resources/js/Components/ProductCard/PricePreorderBlock.tsx
import React from 'react';
import { IProductCardResponse } from '@/Types/prodcard';
import useAppContext from '@/Hooks/useAppContext';
import { formatServerDate } from '@/Utils/dateFormatter';

interface IPricePreorderBlock {
    preorderPrice           : IProductCardResponse['prodInfo']['preorderPrice'];
    regularPrice            : IProductCardResponse['prodInfo']['regularPrice'];
    price_regular           : number | null;
    price_with_rank_discount: number | null;
    percent_of_rank_discount: number | null;
}

const PricePreorderBlock: React.FC<IPricePreorderBlock> = ({ preorderPrice, regularPrice, price_regular, price_with_rank_discount, percent_of_rank_discount }) => {
    
    const formatPrice = (price: number) => price.toLocaleString('ru-RU');
    const { user } = useAppContext();
    // console.log('preorderPrice', preorderPrice);

    return (
        <>  { preorderPrice && ( 
            <section className="cardProduct-productPreorderPrice__block">
                <div  className="preorder-notice">Товар доступен по предварительному заказу (для авторизованных пользователей):</div>
                {preorderPrice?.price_value && regularPrice?.price_value ? (
                    preorderPrice.price_value < regularPrice.price_value ? (    
                        <div>
                            <div className="basket-favorites__priceCurrent nobr">
                                {formatPrice(preorderPrice.price_value)} <sup>&#8381;</sup>
                            </div>
                            <div className="cardProduct-priceBeforSale nobr">
                                {formatPrice(regularPrice.price_value)} <sup>&#8381;</sup>
                            </div>
                            <div className="cardProduct-priceDiscountInPercentage nobr">
                                - {Math.ceil(100 - (preorderPrice.price_value / regularPrice.price_value) * 100)}%
                            </div>
                        </div>
                    ) : (
                            <div className="cardProduct-priceCurrent nobr">{formatPrice(regularPrice.price_value)} <sup>&#8381;</sup></div>
                    )
                    ) : <div className="cardProduct-priceCurrent nobr">К сожалению, цена не актуальна</div>
                }

                { preorderPrice.date_end && ( 
                    <div className="cardProduct-priceValidPeriod nobr">(до { formatServerDate(preorderPrice.date_end) })</div>
                )}

            </section>
         )} </>
    );
};

export default PricePreorderBlock;