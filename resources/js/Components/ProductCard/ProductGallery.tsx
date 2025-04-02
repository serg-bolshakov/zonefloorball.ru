// resources/js/Components/ProductCard/ProductGallerytion.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { IProductCardResponse } from '@/Types/prodcard';

interface IProductGallery {
    promoImgs: IProductCardResponse['prodInfo']['productPromoImages']; 
    category : IProductCardResponse['prodInfo']['category']['category'];
    model    : IProductCardResponse['prodInfo']['model'];
    marka    : IProductCardResponse['prodInfo']['marka'];
}

const ProductGallery: React.FC<IProductGallery> = ({ promoImgs, category, model, marka }) => {

    return (
        <section className="cardProduct-imgPromo">  
            { Object.values(promoImgs).map((link, index) => (
            <Link key={index} href={`/storage/${ link.img_link }`}>
                <img src={`/storage/${ link.img_link }`} 
                    alt={[category, model, marka].filter(item => Boolean(item) && item !== "NoName").join(' ')}
                    title ="Кликни на изображение, чтобы посмотреть его на всём экране." />
            </Link>
            ))}
        </section>
    );
};

export default ProductGallery;