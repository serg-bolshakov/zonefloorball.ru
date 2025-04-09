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

interface IHomeProps {
    title: string;
    robots: string;
    description: string;
    keywords: string;
}

const fetchFavoriteProducts = async (ids: number[]) => {
    console.log(ids);
    try {
        const response = await axios.post('/api/products/favorites', {
            ids,
            _token: getCookie('XSRF-TOKEN') // Автоматически добавляется в Laravel
        }, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

const FavoritesPage: React.FC<IHomeProps> = ({title, robots, description, keywords}) => {
    const { user } = useAppContext();
    const { favorites } = useUserDataContext();
    const [favoriteProducts, setFavoriteProducts] = useState<IProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (favorites.length === 0) {
            setFavoriteProducts([]);
            return;
        }
        
        const load = async () => {
            setIsLoading(true);

            try {
                const data = await fetchFavoriteProducts(favorites);
                console.log('Raw response:', data.favoriteProducts.data);
                setFavoriteProducts(data.favoriteProducts?.data || []);
            } catch (error) {
                console.error('Ошибка загрузки:', getErrorMessage(error));
            } finally {
                setIsLoading(false);
            }
        };
        
        load();

    }, [favorites]); // Зависимость от favorites

    const memoizedProducts = useMemo(() => favoriteProducts, [favoriteProducts]);

    // Функция для форматирования цены
    /*
    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };
    */

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