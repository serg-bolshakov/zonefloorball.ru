// resources/js/Pages/FavoritesPage.tsx
import useAppContext from "@/Hooks/useAppContext";
import { useUserDataContext } from "@/Hooks/useUserDataContext";
import axios from "axios";
import { getCookie } from "@/Utils/cookies";                        // Хелпер для получения CSRF-токена
import MainLayout from "@/Layouts/MainLayout";
import { Helmet } from "react-helmet";
import { useEffect, useState, useMemo } from "react";
import { getErrorMessage } from "@/Utils/error";
import { IProduct } from "@/Types/types";
import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatPrice } from "@/Utils/priceFormatter";
import { toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';

interface IHomeProps {
    title: string;
    robots: string;
    description: string;
    keywords: string;
}

const FavoritesPage: React.FC<IHomeProps> = ({title, robots, description, keywords}) => {
    const { user } = useAppContext();
    const { favorites } = useUserDataContext();
    const [favoriteProducts, setFavoriteProducts] = useState<IProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const toastConfig = {
        position: "top-right" as const,
        autoClose: 3000, // Уведомление закроется через секунду
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        transition: Bounce, // Используем Slide, Zoom, Flip, Bounce для этого тоста
    }

    useEffect(() => {

        // Создаём AbortController для управления отменой запроса
        // создаёт объект, который позволяет отменить асинхронные операции (например, HTTP-запросы).
        const controller = new AbortController();   // AbortController - встроенный браузерный API для отмены операций (запросов, таймеров и т.д.)
        const signal = controller.signal;           // это объект AbortSignal, который передаётся в axios (или fetch).

        if (favorites.length === 0) {
            setFavoriteProducts([]);
            return;
        }
        
        const load = async () => {
            setIsLoading(true);

            try {
                const response = await axios.post('/api/products/favorites', {
                    ids: favorites,
                    _token: getCookie('XSRF-TOKEN') // Автоматически добавляется в Laravel
                }, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json'
                    },
                    signal, // Передаём signal в конфиг axios          
                });

                // Проверяем, не был ли запрос отменён
                if (!signal.aborted) {
                    setFavoriteProducts(response.data.favoriteProducts?.data || []);
                }

            } catch (error) {
                // Игнорируем ошибку, если запрос был отменён
                if (!axios.isCancel(error)) {
                    toast.error('Ошибка загрузки:' + getErrorMessage(error), toastConfig);
                }
            } finally {
                if (!signal.aborted) {
                    setIsLoading(false);
                }
            }
        };
        
        load();

        // Функция очистки: отменяем запрос при размонтировании или изменении favorites
        return () => {
            controller.abort();
        };
        
    }, [favorites]); // Зависимость от favorites // При изменении favorites старый запрос отменяется

    /* Как работает AbortController?
        1. Создание контроллера: 
            - const controller = new AbortController() создаёт объект, который позволяет отменить асинхронные операции (например, HTTP-запросы).
            - controller.signal — это объект AbortSignal, который передаётся в axios (или fetch).
        2. Отмена запроса:
            - Когда вызывается controller.abort(), запрос прерывается.
            - Axios автоматически отклоняет промис с ошибкой CanceledError (можно проверить через axios.isCancel(error)).
        3. Очистка в useEffect:
            - Функция, возвращаемая из useEffect, выполняется:
                a) При размонтировании компонента;
                b) Перед повторным вызовом эффекта (например, при изменении favorites).
            - Это гарантирует, что старый запрос не "висит" в фоне, если пользователь быстро меняет данные.

        AbortController требует привязки к жизненному циклу компонента
            - Контроллер должен создаваться и отменяться в useEffect, иначе он не будет работать правильно.

        Добавление AbortController сделает код более надёжным, особенно если пользователь быстро уходит со страницы или меняет фильтры.
    */

    const memoizedProducts = useMemo(() => favoriteProducts, [favoriteProducts]);

    return (    
        <MainLayout>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords} />
                <meta name="robots" content={robots} />
            </Helmet>

            <div className="basket-wrapper">
                <h1 className="basketTitle">Избранное ({favorites.length})</h1>
                
                {isLoading ? (
                    <div>Загрузка...</div>
                ) : (
                    <div id="favoritesproductsblock">
                        {memoizedProducts.map(product => (
                            <div key={product.id} className="basket-row__product">
                                <div className="basket-row__block">
                                    <div className="basket-row__new-block-line"></div>
                                    <Link href={`/products/card/${ product.prod_url_semantic }`}><img src={`/storage/${ product.img_link }`} alt={ product.title } title="Кликните, чтобы перейти в карточку товара" /></Link> 
                                </div>

                                <div className="basket-row__block">
                                    <h3>{ product.title }</h3>
                                </div>

                                <div className="basket-row__block favorites-block__price" data-removefromfavorites={product.id } data-favoritespriceblockisproductallowed={product.on_sale }>
                                    
                                    <div className="basket-res__total">
                                        <p>сегодня в продаже: <span className="basket-quantity__span-tag">{ product.on_sale }</span> шт.</p>
                                        <div className="basket-delete__product-div">
                                            <img className="favorites-img__remove" data-removefromfavorites={ product.id } src="/storage/icons/icon-trash.png" alt="icon-trash" title="Удалить товар из Избранного" />
                                            <motion.div 
                                                whileHover={{ scale: 1.1 }}  
                                                whileTap={{ scale: 0.9 }}
                                                animate={{
                                                    scale: [1, 1.15, 1.05], // Пульсация
                                                    transition: { 
                                                    repeat: Infinity, 
                                                    repeatDelay: 1,
                                                    duration: 0.9 
                                                    }
                                                }}
                                            >
                                            <img className="favorites-img__addtobasket" data-addtobasketfromfavoritesid={ product.id } 
                                                data-addtobasketfromfavoritesarticle={ product.article }
                                                data-addtobasketfromfavoritesname={ product.title }
                                                data-addtobasketfromfavoritesprice={ product.price_regular }
                                                data-addtobasketfromfavoritesurl={ product.prod_url_semantic }
                                                data-addtobasketfromfavoritesimglink={ product.img_link }
                                                data-addtobasketfromfavoritesallowed={ product.on_sale }
                                                src="/storage/icons/icon-shoppingcart.png" alt="icon-shoppingcart" title="Добавить выбранный товар в Корзину для покупок"
                                            />
                                            </motion.div>
                                        </div> 

                                    </div>

                                    <p>по лучшей цене: </p>

                                    <div className="basket-row__priceValue d-flex">
                                        {product.price_special && product.price_regular && product.price_actual ? (
                                            <>
                                                <div className="basket-favorites__priceCurrentSale nobr">{formatPrice(product.price_special)} <sup>&#8381;</sup></div>
                                                <div className="cardProduct-priceBeforSale nobr">{formatPrice(product.price_regular)} <sup>&#8381;</sup></div>
                                                <div className="basket-favorites__priceDiscountInPercentage nobr">- {Math.ceil(100 - (product.price_actual / product.price_regular) * 100)}%</div>
                                            </>
                                        ) : ( product.price_regular && (
                                                <div className="basket-favorites__priceCurrent nobr">{formatPrice(product.price_regular)} <sup>&#8381;</sup></div>
                                            ) 
                                        )}           
                                    </div>

                                    { product.date_end && ( 
                                        <div className="cardProduct-priceValidPeriod">акция действует до: { product.date_end }</div>
                                    )}

                                    { user && product.price_with_rank_discount && product.price_regular && (
                                    <>    
                                        <p className="margin-tb12px">
                                        { user.client_type_id === 1
                                            ? "но для меня цена лучше: "
                                            : "но для нас цена лучше: "}
                                            
                                        </p>
                                        
                                        <div className="d-flex padding-left16px">
                                            <div className="basket-favorites__priceCurrentSale">{formatPrice(product.price_with_rank_discount)}</div>
                                            <div className="cardProduct-priceBeforSale">{formatPrice(product.price_regular)} <sup>&#8381;</sup></div>
                                            <div className="basket-favorites__priceDiscountInPercentage">- { product.percent_of_rank_discount }&#37;</div>
                                        </div>
                                    </>
                                    )} 
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>

        </MainLayout>    
    );
};

export default FavoritesPage;