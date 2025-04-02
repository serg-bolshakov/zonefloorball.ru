// resources/js/Pages/ProductCard.tsx

import React, { useState, useEffect, useContext } from 'react';
import { Link } from '@inertiajs/react';
import { Helmet } from 'react-helmet';
import MainLayout from '../Layouts/MainLayout';
import NavBarBreadCrumb from '@/Components/NavBarBreadCrumb';
import { IProductCardResponse } from '@/Types/prodcard';
import ProductHeader from '@/Components/ProductCard/ProductHeader';
import PriceBlock from '@/Components/ProductCard/PriceBlock';
import StatusBlock from '@/Components/ProductCard/StatusBlock';
import ProductDetails from '@/Components/ProductCard/ProductDetails';
import ProductDescription from '@/Components/ProductCard/ProductDescription';
import ProductActions from '@/Components/ProductCard/ProductActions';
import ProductGallery from '@/Components/ProductCard/ProductGallery';
import PropVariants from '@/Components/ProductCard/PropVariants';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { AnimatePresence, motion } from 'framer-motion';

const ProductCard: React.FC<IProductCardResponse> = ({title, robots, description, keywords, prodInfo, propVariants}) => {

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
                        key={`motion_div_${prodInfo.id}`} // Ключ для анимации при смене товара
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                <main>
                <NavBarBreadCrumb />
                    <ProductHeader title={ prodInfo.title } article={ prodInfo.article } brand_id={ prodInfo.brand_id } brand={ prodInfo.brand } />

                    <section className="cardProduct-line__block">
                        <section>
                            { prodInfo.productMainImage.img_link && (
                                <Link href={`/storage/${ prodInfo.productMainImage.img_link }`}>
                                    <LazyLoadImage
                                        className={`cardProduct__mainImg--${ prodInfo.productCardImgOrients.img_orient }`} 
                                        src={`/storage/${ prodInfo.productMainImage.img_link }`} 
                                        alt={[prodInfo.category.category, prodInfo.brand.brand_view, prodInfo.model, prodInfo.marka].filter(item => Boolean(item) && item !== "NoName").join(' ')} 
                                        title="Кликни на изображение, чтобы посмотреть его на всём экране."
                                        
                                    />
                                </Link>
                            )}
                        </section>

                        <section className="cardProduct-props">
                            <PropVariants propVariants={propVariants} />
                            
                            {prodInfo.actualPrice && (
                                <PriceBlock actualPrice={prodInfo.actualPrice} regularPrice={prodInfo.regularPrice} />
                            )}
                                
                            <div className="card-product__detail-status-block">
                                {prodInfo.actualPrice ? (
                                    <StatusBlock productReport={prodInfo.productReport} productUnit={prodInfo.productUnit} />
                                ) : (
                                    <div className="card-product__detail-status">В архиве</div>
                                )}

                                <ProductActions prodInfo={prodInfo} />
                            </div>
                        </section>
                    </section>
                    
                    <section className="cardProduct-descDetails__block">                        
                        <ProductDescription prodInfo={prodInfo} />
                        <ProductDetails     prodInfo={prodInfo} />
                    </section>

                    {prodInfo?.productPromoImages && (
                        <ProductGallery promoImgs={prodInfo.productPromoImages} category={prodInfo.category.category} model={prodInfo.model} marka={prodInfo.marka} />
                    )}
                    
                </main>
                    </motion.div>
                </AnimatePresence>
            </MainLayout>    
        );
    } catch(error) {
        console.error('Error in ProductCard:', error);
        return <div>Произошла ошибка при загрузке карточки товара</div>;
    }
};

export default ProductCard;