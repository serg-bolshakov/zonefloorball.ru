// resources/js/Components/ProductCard/RecentlyViewedProducts.tsx
import { useUserDataContext } from '@/Hooks/useUserDataContext';
import React, { useState, useEffect, useMemo } from 'react';
import { IProduct } from '@/Types/types';
import { toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
import axios from 'axios';
import { API_ENDPOINTS } from '@/Constants/api';
import { getErrorMessage } from '@/Utils/error';
import { Link } from '@inertiajs/react';
import { formatPrice } from '@/Utils/priceFormatter';

interface IRecentlyViewedItem {
    productId: number;
    timestamp: number;
}

const RecentlyViewedProducts: React.FC = () => {
    const { ...state } = useUserDataContext();

    const products = Object.keys(state.recentlyViewedProducts)
    .map(id => ({ productId: Number(id), timestamp: state.recentlyViewedProducts[Number(id)] }))
    .sort((a, b) => b.timestamp - a.timestamp);

    const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<IProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toastConfig = {
        position: "top-right" as const,
        autoClose: 1500, // Уведомление закроется через секунду-другую...
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        transition: Zoom, // Используем Slide, Zoom, Flip, Bounce для этого тоста
    }

    useEffect(() => {
       
        const loadRecentlyViewed = async () => {
            try {
                
                const productIds = Object.entries(state.recentlyViewedProducts)                     // Преобразуем объект в массив пар [key, value]: [['85', 1745084858656], ['23', 1745084834968], ...]
                .map(([productId, timestamp]) => ({ productId: Number(productId), timestamp }))     // Приводим ID к числу и сохраняем структуру: [{productId: 85, timestamp: ...}, {productId: 23, timestamp: ...}]   - явное приведение Number(id) защищает от строковых ключей.
                .sort((a, b) => b.timestamp - a.timestamp)      // Сортировка по времени (новые сначала)
                .slice(0, 6)                                    // Лимит на фронте, берем 6 последних
                .map(item => item.productId)                    // Финальный .map() + .join(): Выбираем только productId из объектов
                .join(',');                                     // Объединяем в строку через запятую

                if (!productIds) return; // Не делать запрос если нет товаров

                const response = await axios.get(`${API_ENDPOINTS.RECENTLY_VIEWED}?ids=${productIds}`);
                console.log('response', response.data.data);
                setRecentlyViewedProducts(response.data?.data);
            } catch (error) {
                // Игнорируем ошибку, если запрос был отменён
                if (!axios.isCancel(error)) {
                    toast.error('Ошибка загрузки:' + getErrorMessage(error), toastConfig);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadRecentlyViewed();

    }, [state.recentlyViewedProducts]);    

    const memoizedProducts = useMemo(() => recentlyViewedProducts, [recentlyViewedProducts]);
    
    return (
        <>
            {error && (
                <div className="error-message">
                    Ошибка: {error}. Попробуйте обновить страницу.
                </div>
            )}

            {isLoading ? (
                <div>Загрузка...</div>
            ) : recentlyViewedProducts?.length > 0 ? (
                    <>
                    <section className="page-products__viewed-content">
                        <h2 className='basketTitle'>Вы недавно смотрели...</h2>
                        <div className="product-card__recently-viewed">
                            {memoizedProducts.map(product => 
                                <div key={product.id} className='assortiment-card__block'>
                                    <div className='assortiment-card__block-productImg'>   
                                        <Link href={`/products/card/${ product.prod_url_semantic }`}><img src={`/storage/${ product.img_link }`} alt={ product.title } title="Кликните, чтобы перейти в карточку товара" /></Link> 
                                    </div>
                                    <div className='assortiment-card__block-productInfo'>
                                        <div className='assortiment-card_productName'>
                                            <Link href={`/products/card/${ product.prod_url_semantic }`}>{ product.title }</Link> 
                                        </div>
                                        <div className='assortiment-card_productPrice'>
                                            {product.price_special && product.price_regular && product.price_actual ? (
                                                <>
                                                    <div className="basket-favorites__priceCurrentSale nobr">{formatPrice(product.price_special)} <sup>&#8381;</sup></div>
                                                    <div className="cardProduct-priceBeforSale nobr">{formatPrice(product.price_regular)} <sup>&#8381;</sup></div>
                                                    <div className="basket-favorites__priceDiscountInPercentage nobr">- {Math.ceil(100 - (product.price_special / product.price_regular) * 100)}%</div>
                                                </>
                                            ) : product.price_regular && product.price_actual && product.price_actual < product.price_regular ? (
                                                <>
                                                    <div className="basket-favorites__priceCurrentSale nobr">{formatPrice(product.price_actual)} <sup>&#8381;</sup></div>
                                                    <div className="cardProduct-priceBeforSale nobr">{formatPrice(product.price_regular)} <sup>&#8381;</sup></div>
                                                    <div className="basket-favorites__priceDiscountInPercentage nobr">- {Math.ceil(100 - (product.price_actual / product.price_regular) * 100)}%</div>
                                                </>
                                            ) : product.price_regular && (
                                                    <div className="basket-favorites__priceCurrent nobr">{formatPrice(product.price_regular)} <sup>&#8381;</sup></div>
                                            )}        
                                        </div>
                                        { product.date_end && ( 
                                            <div className="cardProduct-priceValidPeriod">акция действует до: { product.date_end }</div>
                                        )}  
                                    </div>
                                </div>
                            )}
                        </div> 
                    </section>
                    </>
                ) : (
                    <h2 className='basketTitle'>
                        Это первый товар, который вы просматриваете. Добро пожаловать!
                    </h2>
                )}
        </>
    );
};

export default RecentlyViewedProducts;