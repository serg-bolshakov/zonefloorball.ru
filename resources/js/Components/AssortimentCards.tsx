// resources/js/Components/AssortimentCards.tsx
import React from "react";
import { Link, usePage } from '@inertiajs/react';
import { IProductsResponse } from "../Types/types";
// import { useId } from 'react';      // useId доступен только в React 18 и выше

interface AssortimentCardsProps {
    products: IProductsResponse;
}

const AssortimentCards: React.FC<AssortimentCardsProps> = ({products}) => {
    // const generateId = useId(); // Используем useId
     console.log('Products:', products); // Выводим продукты в консоль
    
    const totalPages = products.meta.last_page;
    const currentPage = products.meta.current_page;
    const maxPagesToShow = 3; // Максимальное количество отображаемых страниц
    console.log('currentPage', currentPage);
    //console.log(Math.floor(maxPagesToShow / 2));
    //console.log(Math.max(2, currentPage - Math.floor(maxPagesToShow / 2)));
    //console.log('startPage: ', Math.max(2, currentPage - Math.floor(maxPagesToShow / 2)));
    //console.log('endPage', Math.min(totalPages - 1, (Math.max(2, currentPage - Math.floor(maxPagesToShow / 2))) + maxPagesToShow - 1));

    // Получаем текущие query-параметры из URL
    const { url } = usePage();
    // console.log('url:', url); // Отладочное сообщение: url: /products/sticks?page=9&sortBy=actual_price&sortOrder=desc

    // Создаем абсолютный URL на основе текущего местоположения
    const absoluteUrl = new URL(window.location.origin + url);
    // console.log('absoluteUrl:', absoluteUrl); // Отладочное сообщение: absoluteUrl: объект: URL {origin: 'http://127.0.0.1:8000', protocol: 'http:', username: '', password: '', host: '127.0.0.1:8000', …}

    const searchParams = new URLSearchParams(absoluteUrl.search);
    // console.log('Object.fromEntries(searchParams.entries()):', Object.fromEntries(searchParams.entries())); // Отладочное сообщение: Object.fromEntries(searchParams.entries()): {hook[0]: 'neutral'}

    // Функция для формирования пагинации страниц
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

        return (totalPages > 1) ? pages : [];   // пагинацию возвращаем, если количество страниц больше одной...
    };


    // Функция для форматирования цены
    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

    // Функция для формирования URL с учетом параметров сортировки
    const getPageUrl = (page: number | string) => {
        const params = new URLSearchParams({
            ...Object.fromEntries(searchParams.entries()), // Передаем все существующие параметры 
            page: page.toString(),
        });

        return `?${params.toString()}`;
    };

    return (
        <>
            {/* Рендерим товары */}
            {products.data.length > 0 ? (
                <>
                    {products.data.map(product => (
                        <div key={product.id} className="assortiment-card__block">
                            <div className="assortiment-card__block-productImg">
                                <Link href={`/products/card/${product.prod_url_semantic}`}><img src={`/storage/${product.img_link}`} 
                                alt={[product.category, product.brand, product.model, product.marka].filter(Boolean).join(' ')} 
                                title={[product.category, product.brand, product.model, product.marka].filter(item => Boolean(item) && item !== "NoName").join(' ')} /></Link>
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
                        <Link href={getPageUrl(currentPage - 1)} className="pagination-link">
                            &lt;&lt;
                        </Link>
                    )}
                    
                    {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                            <span key={index + 'page-span' + page} className="pagination-link">...</span>
                        ) : (
                            <Link
                                key={'page' + page}
                                href={getPageUrl(page)}
                                className={`pagination-link ${currentPage === page ? 'activeProduct' : ''}`}
                                preserveScroll // Сохраняет позицию скролла
                                preserveState // Сохраняет состояние компонента
                            >
                                {page}
                            </Link>
                        )
                    ))}

                    {products.links.next && (
                        <Link href={getPageUrl(currentPage + 1)} className="pagination-link">
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