// resources/js/Pages/ProductCard.tsx

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import MainLayout from '../Layouts/MainLayout';
import NavBarBreadCrumb from '@/Components/NavBarBreadCrumb';
import { IProductCardResponse } from '@/Types/prodcard';
import ProductHeader from '@/Components/ProductCard/ProductHeader';
import PriceBlock from '@/Components/ProductCard/PriceBlock';
import PricePreorderBlock from '@/Components/ProductCard/PricePreorderBlock';
import StatusBlock from '@/Components/ProductCard/StatusBlock';
import ProductDetails from '@/Components/ProductCard/ProductDetails';
import ProductDescription from '@/Components/ProductCard/ProductDescription';
import ProductActions from '@/Components/ProductCard/ProductActions';
import ProductGallery from '@/Components/ProductCard/ProductGallery';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { AnimatePresence, motion } from 'framer-motion';
import PropVariants from '@/Components/ProductCard/PropVariants';
import RecentlyViewedProducts from '@/Components/ProductCard/RecentlyViewedProducts';
import useAppContext from '@/Hooks/useAppContext';
import { useUserDataContext } from '@/Hooks/useUserDataContext';
import { PRODUCT_STATUSES } from '@/Constants/productStatuses';
import ProductVideos from '@/Components/ProductCard/ProductVideos';

const ProductCard: React.FC<IProductCardResponse> = ({title, robots, description, keywords, prodInfo, propVariants}) => {
    const { user } = useAppContext();
    const { addRecentlyViewedProd } = useUserDataContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    // работа с событиями: useEffect для управления подпиской на события (Обработчик удаляется при размонтировании компонента)
    // добавляем ESC-закрытие:
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsModalOpen(false);
        };

        if (isModalOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden'; // Блокируем скролл
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = ''; // Восстанавливаем скролл
        };
    }, [isModalOpen]);

    //  Гость (юзер) открывает товар, мы записываем id-просматриваемого товара в localStorage и/или в БД:
    useEffect(() => { 
        if(prodInfo?.id) {                                  // проверка на существование prodInfo.id
            const timer = setTimeout(() => {
                addRecentlyViewedProd(prodInfo.id);
            }, 1000);  
            return () => clearTimeout(timer);               // Задержка для UX - защита от многократных вызовов...
        }
     }, [prodInfo?.id]);                                    // Зависимость только от ID

    // Оптимизация рендеринга: useCallback для функции закрытия (Остановка распространения события для контента модалки)
    const closeModal = useCallback(() => setIsModalOpen(false), []);

    // console.log('prodInfo', prodInfo);
    // console.log('propVariants', propVariants);
    // console.log('prodInfo.category_id', prodInfo.category_id);

    const imagePath = `/storage/${prodInfo.productMainImage.img_link}`;
    const webpPath = imagePath.replace(/\.(jpg|png)$/, '.webp');

    const altText = [prodInfo.category?.category, prodInfo.brand?.brand_view, prodInfo.model, prodInfo.marka]
    .filter(item => Boolean(item) && item !== "NoName")
    .join(' ') || 'Изображение товара';

    console.log('Brand 3 data:', {
        brand: prodInfo.brand,
        images: prodInfo.productMainImage,
        allData: prodInfo
    });


    try {
        
        return (
            <MainLayout>
                <Helmet>
                    <title>{title}</title>
                    <meta name="description" content={description} />
                    <meta name="keywords" content={keywords} />
                    <meta name="robots" content={robots} />
                </Helmet>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={`motion_div_${prodInfo.id}`} // Ключ для анимации при смене товара, когда перезагружается страница...
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.9 }}
                    >
                <main>
                <NavBarBreadCrumb />
                    <ProductHeader title={ prodInfo.title } article={ prodInfo.article } brand_id={ prodInfo.brand_id } brand={ prodInfo.brand } />

                    <section className="cardProduct-line__block">
                        <section>
                            {/* { prodInfo.productMainImage.img_link && (                         
                                <LazyLoadImage
                                    className={`cardProduct__mainImg--${ prodInfo.productCardImgOrients.img_orient }`} 
                                    onClick={() => setIsModalOpen(true)}
                                    src={`/storage/${ prodInfo.productMainImage.img_link }`} 
                                    alt={[prodInfo.category.category, prodInfo.brand.brand_view, prodInfo.model, prodInfo.marka].filter(item => Boolean(item) && item !== "NoName").join(' ')} 
                                    title="Кликни на изображение, чтобы посмотреть его на всём экране."
                                />
                            )} */}
                            
                            {/* {prodInfo.productMainImage.img_link && (
                                <picture>
                                    <source 
                                        srcSet={`/storage/${prodInfo.productMainImage.img_link.replace(/\.(jpg|png)$/, '.webp')}`} 
                                        type="image/webp" 
                                    />
                                    <source 
                                        srcSet={`/storage/${prodInfo.productMainImage.img_link}`} 
                                        type={prodInfo.productMainImage.img_link.endsWith('.png') ? 'image/png' : 'image/jpeg'} 
                                    <img
                                        src={`/storage/${prodInfo.productMainImage.img_link}`}
                                        className={`cardProduct__mainImg--${ prodInfo.productCardImgOrients.img_orient }`} 
                                        onClick={() => setIsModalOpen(true)}
                                        alt={[prodInfo.category.category, prodInfo.brand.brand_view, prodInfo.model, prodInfo.marka].filter(item => Boolean(item) && item !== "NoName").join(' ')} 
                                        title="Кликни на изображение, чтобы посмотреть его на всём экране."
                                    />
                                </picture>
                            )} */}

                            {prodInfo.productMainImage?.img_link && (
                                <picture>
                                    {/* Проверяем существование WebP версии */}
                                    {prodInfo.productMainImage.img_link.replace(/\.(jpg|png)$/, '.webp') !== prodInfo.productMainImage.img_link && (
                                        <source 
                                            srcSet={`/storage/${prodInfo.productMainImage.img_link.replace(/\.(jpg|png)$/, '.webp')}`} 
                                            type="image/webp" 
                                        />
                                    )}
                                    <source 
                                        srcSet={`/storage/${prodInfo.productMainImage.img_link}`} 
                                        type={prodInfo.productMainImage.img_link.endsWith('.png') ? 'image/png' : 'image/jpeg'} 
                                    />
                                    {/* Финальный фолбэк */}
                                    <img
                                        src={`/storage/${prodInfo.productMainImage.img_link}`}
                                        className={`cardProduct__mainImg--${ prodInfo.productCardImgOrients.img_orient }`} 
                                        onClick={() => setIsModalOpen(true)}
                                        alt={altText}
                                        title="Кликни на изображение, чтобы посмотреть его на всём экране."
                                    />
                                </picture>
                            )}

                            <AnimatePresence>
                            {isModalOpen && (
                                <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.9 }}
                                className="prodcard-img_block"
                                onClick={closeModal}
                                >
                            <>
                                <div className="prodcard-img_block" onClick={closeModal}>
                                    <div 
                                        className="modal-img" 
                                        onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике на контент
                                    >
                                        <span 
                                            className="modal-close" 
                                            onClick={closeModal}
                                            role="button"
                                            aria-label="Закрыть модальное окно"
                                            tabIndex={0}
                                        >
                                            &times;
                                        </span>
                                        <img 
                                            loading="lazy" 
                                            src={`/storage/${ prodInfo.productMainImage.img_link }`} 
                                            alt="Увеличенное изображение товара" 
                                        />
                                    </div>
                                </div>
                            </>
                            </motion.div>
                            )}
                            </AnimatePresence>
                        </section>

                        <section className="cardProduct-props">
                        
                            {propVariants && prodInfo.category_id && (
                                <PropVariants 
                                    propVariants={propVariants} 
                                    categoryId={prodInfo.category_id} // Передаём категорию
                                />
                            )}
                            
                            {prodInfo.actualPrice && (prodInfo.product_status_id === PRODUCT_STATUSES.ACTIVE) && ((prodInfo.productReport.on_sale ?? 0) > 0 || (prodInfo.productReport.reserved ?? 0) > 0 || (prodInfo.productReport.on_preorder ?? 0) > 0) &&(
                                <PriceBlock 
                                    actualPrice={prodInfo.actualPrice} 
                                    regularPrice={prodInfo.regularPrice}
                                    price_regular={prodInfo.price_regular ?? null}
                                    price_with_rank_discount={prodInfo.price_with_rank_discount ?? null}
                                    percent_of_rank_discount={prodInfo.percent_of_rank_discount ?? null}
                                />
                            )}
                                
                            <div className="card-product__detail-status-block">
                                {prodInfo.actualPrice && (prodInfo.product_status_id === PRODUCT_STATUSES.ACTIVE) ? (
                                    <StatusBlock productReport={prodInfo.productReport} productUnit={prodInfo.productUnit} />
                                ) : (
                                    <div className="card-product__detail-status">В продаже больше не будет. Модель в архиве.</div>
                                )}

                                {(prodInfo.product_status_id === PRODUCT_STATUSES.ACTIVE) && (
                                    <ProductActions prodInfo={prodInfo} />
                                )}
                            </div>
                            <div>
                                {prodInfo.actualPrice && (prodInfo.product_status_id === PRODUCT_STATUSES.ACTIVE) && ((prodInfo.productReport.on_sale ?? 0) > 0 || (prodInfo.productReport.reserved ?? 0) > 0 || (prodInfo.productReport.on_preorder ?? 0) > 0) &&(
                                <PricePreorderBlock 
                                    preorderPrice={prodInfo.preorderPrice} 
                                    regularPrice={prodInfo.regularPrice}
                                    price_regular={prodInfo.price_regular ?? null}
                                    price_with_rank_discount={prodInfo.price_with_rank_discount ?? null}
                                    percent_of_rank_discount={prodInfo.percent_of_rank_discount ?? null}
                                />
                            )}
                            </div>
                        </section>
                    </section>
                    
                    <section className="cardProduct-descDetails__block">                    
                        <ProductDescription prodInfo={prodInfo} />
                        <ProductDetails     prodInfo={prodInfo} />
                        <ProductVideos videos={prodInfo.videos} />    
                    </section>

                    {prodInfo?.productPromoImages && (
                        <ProductGallery promoImgs={prodInfo.productPromoImages} category={prodInfo.category.category} model={prodInfo.model} marka={prodInfo.marka} />
                    )}
                    
                </main>
                    </motion.div>
                </AnimatePresence>
                <RecentlyViewedProducts />
            </MainLayout>    
        );
    } catch(error) {
        console.error('Error in ProductCard:', error);
        return <div>Произошла ошибка при загрузке карточки товара</div>;
    }
};

export default ProductCard;