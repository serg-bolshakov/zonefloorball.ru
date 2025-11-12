// resources/js/Components/ProductCard/ProductDescription.tsx
import React from 'react';
import { IProductCardResponse } from '@/Types/prodcard';

interface IProductDescription {
    prodInfo: IProductCardResponse['prodInfo']; 
}

const ProductDescription: React.FC<IProductDescription> = ({ prodInfo }) => {

    return (
        <section className="cardProduct-props">  
 {/* НОВЫЙ БЛОК: Одобрение федерации - ТОЛЬКО ДЛЯ BRAND_ID = 3 */}
            {prodInfo.brand_id === 3 && (
                <div className="cardProduct-approval">
                    <div className="cardProduct-approvalContent">
                        <img 
                            src="/storage/icons/nffr-logo.webp" 
                            alt="Логотип Национальной федерации флорбола России"
                            title='Логотип Национальной федерации флорбола России' 
                            className="cardProduct-approvalLogo" 
                        />
                        <div className="cardProduct-approvalText">
                            <p className=''>Продукция АЛЕТЕРС одобрена Национальной федерацией флорбола России для использования в соревнованиях всех уровней.</p>
                            <p className="text-align-right"><a href="https://xn--m1agla.xn--p1ai/wp-content/uploads/2025/11/PRIKAZ.pdf" target="_blank" rel="noopener noreferrer">Текст приказа (на сайте федерации в новой складке).</a>.</p>
                        </div>
                    </div>
                </div>
            )}
            {/* КОНЕЦ НОВОГО БЛОКА */}

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