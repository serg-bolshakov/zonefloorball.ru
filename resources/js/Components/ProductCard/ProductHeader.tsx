// resources/js/Components/ProductCard/ProductHeader.tsx
import React from 'react';
import { IProductCardResponse } from '@/Types/prodcard';

interface IProductHeader {
    title:    IProductCardResponse['prodInfo']['title'];
    article:  IProductCardResponse['prodInfo']['article'];
    brand_id: IProductCardResponse['prodInfo']['brand_id'];
    brand:    IProductCardResponse['prodInfo']['brand'];
}

const ProductHeader: React.FC<IProductHeader> = ({ title, article, brand_id, brand }) => {
  
  return (
    <section className="cardProduct-line__block"> 
        <div className="cardProduct-block__title">    
            <h1>{ title }</h1>
        </div>
        <div className="cardProduct-block__logo-article">
            { brand_id  && ( 
                <img className="cardProduct-logo" src={`/storage/${ brand.url }`} alt={` ${brand.brand_view } logo`} title={` ${brand.brand_view} logo`} />
            )}
            <p className="cardProduct-article__title">Артикульный<br />номер:</p>
            <p className="cardProduct-article__number">{ article }</p>
        </div>
    </section>
  );
};

export default ProductHeader;