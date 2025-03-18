// resources/js/Components/AssortimentCards.tsx
import React from "react";
import { Link } from '@inertiajs/react';
import { IProductsResponse } from "../Types/types";

interface AssortimentCardsProps {
    products: IProductsResponse;
}

const AssortimentCards: React.FC<AssortimentCardsProps> = ({products}) => {
    console.log('Products:', products.data); // Выводим продукты в консоль

    // Функция для форматирования цены
    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };


    return (
        <>
            {products.data.length > 0 ? (
                products.data.map(product => (
                    <div key={product.id} className="assortiment-card__block">
                        <div className="assortiment-card__block-productImg">
                            <Link href={`/products/card/${product.prod_url_semantic}`}><img src={`/storage/${product.img_link}`} alt={`${product.category} ${product.brand} 
                            ${product.model} ${product.marka}`} title={`${product.category} ${product.brand} ${product.model} ${product.marka}`} /></Link>
                        </div>
                        <div className="assortiment-card__block-productInfo">
                            <div className="assortiment-card_productName">
                                <Link href={`/products/card/${product.prod_url_semantic}`}>{product.title}</Link>
                            </div>
                            <div className="assortiment-card_productPrice">
                                {product.prod_status !== 2 ? (
                                    product.price_actual !== product.price_regular ? (
                                        <>
                                            {product.price_actual !== null && product.price_actual !== undefined ? (
                                                <p className="priceCurrentSale">
                                                    <span className="nobr">
                                                        {formatPrice(product.price_actual)} <sup>&#8381;</sup>
                                                    </span>
                                                </p>
                                            ) : (
                                                <p>Цена не указана</p>
                                            )}
                                            
                                            {product.price_regular !== null && product.price_regular !== undefined ? (
                                                <p className="priceBeforSale">
                                                    <span className="nobr">
                                                        {formatPrice(product.price_regular)} <sup>&#8381;</sup>
                                                    </span>
                                                </p>
                                            ) : (
                                                <p>Цена не указана</p>
                                            )}

                                            {product.price_regular !== null && product.price_regular !== undefined && product.price_actual !== null && product.price_actual !== undefined ? (
                                                <p className="priceDiscountInPercentage">
                                                    <span className="nobr">
                                                        - {Math.ceil(100 - (product.price_actual / product.price_regular) * 100)}%
                                                    </span>
                                                </p>
                                            ) : (
                                                <p></p>
                                            )}
                                        </>
                                    ) : (
                                        product.price_regular !== null && product.price_regular !== undefined ? (
                                        <p className="priceCurrent"><span className="nobr">{formatPrice(product.price_regular)}</span><sup>&#8381;</sup></p>
                                        ) : (
                                            <p>Цена не указана</p>
                                        )
                                    )              
                                ) : (
                                    <p></p>
                                )}
                            </div>
                        </div>
                    </div>             
                ))
            ) : (
                <p>Товары не найдены.</p>
            )}
        </>
    );   
};

export default AssortimentCards;

// @for ($i = 0; $i < $prodQuantity; $i++)
//     <div class="assortiment-card__block">
//         <div class="assortiment-card__block-productImg">
//             <a href = "/products/card/{{ $productsArr[$i]['prod_url_semantic'] }}"><img src="/storage/{{ $productsArr[$i]['img_link'] }}" alt="{{ $productsArr[$i]['category'] }} {{ $productsArr[$i]['brand'] }}
//             {{ $productsArr[$i]['model'] }} {{ $productsArr[$i]['marka'] }}" title="{{ $productsArr[$i]['category'] }} {{ $productsArr[$i]['brand'] }} {{ $productsArr[$i]['model'] }} {{ $productsArr[$i]['marka'] }}"></a>
//         </div>
//         <div class="assortiment-card__block-productInfo">   
//             <div class="assortiment-card_productName"><a href = "/products/card/{{ $productsArr[$i]['prod_url_semantic'] }}">{{ $productsArr[$i]['title'] }}</a></div>
//             <div class="assortiment-card_productPrice">
            
//             <?php
//                 /* 
//                 если товар в архиве - цену не показываем
                
//                 если не назначена акция (специальная цена,       
//                 то полный блок цен не выводится, его пропускаем - 
//                 выводится только актуальная цена (следующий блок)*/
//             ?>
            
//             @if($productsArr[$i]['prod_status'] != '2')
//                 @if($productsArr[$i]['price_actual'] != $productsArr[$i]['price_regular'])
//                 <p class="priceCurrentSale"><nobr><?= number_format($price= $productsArr[$i]['price_actual'], 0,",", " " ); ?> <sup>&#8381;</sup></nobr></p>
//                 <p class="priceBeforSale"><nobr><?= number_format($price= $productsArr[$i]['price_regular'], 0,",", " " ); ?> <sup>&#8381;</sup></nobr></p>
//                 <p class="priceDiscountInPercentage"><nobr>- <?= $discount = ceil(100 - ($price= $productsArr[$i]['price_actual']) / ($price= $productsArr[$i]['price_regular']) * 100); ?>&#37;</nobr></p>
//                 @else
//                 <p class="priceCurrent"><nobr><?= number_format($price= $productsArr[$i]['price_regular'], 0,",", " " ); ?> <sup>&#8381;</sup></nobr></p>
//                 @endif
//             @endif
//             </div>
//         </div>
//     </div>
// @endfor