// resources/js/Components/ProductCard/ProductDescription.tsx
import React from 'react';
import { IProductCardResponse } from '@/Types/prodcard';

interface IProductDescription {
    prodInfo: IProductCardResponse['prodInfo']; 
}

const ProductDescription: React.FC<IProductDescription> = ({ prodInfo }) => {

    return (
        <section className="cardProduct-props">  
            {prodInfo.prod_desc && (
                <div className="cardProduct-description" dangerouslySetInnerHTML={{ __html: prodInfo.prod_desc }} />
            )}
            {prodInfo?.size?.size_recommendation && (
            <div className="cardProduct-productTarget">   
                <span> {prodInfo.size.size_recommendation }</span>
            </div>
            )}
        </section>
    );
};

export default ProductDescription;