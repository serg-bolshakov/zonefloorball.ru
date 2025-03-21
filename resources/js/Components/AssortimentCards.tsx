// resources/js/Components/AssortimentCards.tsx
import React from "react";
import { Link } from '@inertiajs/react';
import { IProductsResponse } from "../Types/types";
// import { useId } from 'react';      // useId доступен только в React 18 и выше

interface AssortimentCardsProps {
    products: IProductsResponse;
}

const AssortimentCards: React.FC<AssortimentCardsProps> = ({products}) => {
    // const generateId = useId(); // Используем useId
    // console.log('Products:', products.meta); // Выводим продукты в консоль
    
    const totalPages = products.meta.last_page;
    const currentPage = products.meta.current_page;
    const maxPagesToShow = 3; // Максимальное количество отображаемых страниц
    console.log('currentPage', currentPage);
    console.log(Math.floor(maxPagesToShow / 2));
    console.log(Math.max(2, currentPage - Math.floor(maxPagesToShow / 2)));
    console.log('startPage: ', Math.max(2, currentPage - Math.floor(maxPagesToShow / 2)));
    console.log('endPage', Math.min(totalPages - 1, (Math.max(2, currentPage - Math.floor(maxPagesToShow / 2))) + maxPagesToShow - 1));


    const getPageNumbers = () => {
        const pages = [];
        let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

        // Добавляем первую страницу
        pages.push(1);

        // Добавляем многоточие, если текущий блок страниц не начинается с 3
        if (startPage > 2) {
            if(startPage === 3) {
                pages.push(2);    
            } else {
                pages.push('...');
            }
        }

        // Добавляем страницы вокруг текущей
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Добавляем многоточие, если текущий блок страниц не заканчивается на totalPages - 1
        if (endPage < totalPages - 1) {
            pages.push('...');
        }

        // Добавляем последнюю страницу, если totalPages > 1
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };


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
            {/* Рендерим товары */}
            {products.data.length > 0 ? (
                <>
                    {products.data.map(product => (
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
                                    {/* Логика отображения цены */}
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
                    ))}
                
                    {/* Пагинация */}
                    <div className="pagination-products">
                        {products.links.prev && (
                            <Link href={products.links.prev} className="pagination-link">
                                &lt;&lt;
                            </Link>
                        )}

                    {/* {Array.from({ length: products.meta.last_page }, (_, i) => i + 1).map(page => (
                        <Link
                            key={page}
                            href={`?page=${page}`}
                            className={`pagination-link ${products.meta.current_page === page ? 'activeProduct' : ''}`}
                        >
                            {page}
                        </Link>
                    ))} */}

                        {getPageNumbers().map((page, index) => (
                            page === '...' ? (
                                <span key={index + 'page-span' + page} className="pagination-link">...</span>
                            ) : (
                                <Link
                                    key={'page' + page}
                                    href={`?page=${page}`}
                                    className={`pagination-link ${currentPage === page ? 'activeProduct' : ''}`}
                                >
                                    {page}
                                </Link>
                            )
                        ))}

                        {products.links.next && (
                            <Link href={products.links.next} className="pagination-link">
                                &gt;&gt;
                            </Link>
                        )}
                    </div>
                </>
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