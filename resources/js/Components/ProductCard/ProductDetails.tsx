// resources/js/Components/ProductCard/ProductDetails.tsx
import React from 'react';
import { IProductCardResponse } from '@/Types/prodcard';
import useModal from '@/Hooks/useModal';
import IFF from '@/Components/Articles/IFF';

interface IProductDetails {
    prodInfo: IProductCardResponse['prodInfo']; 
}

const ProductDetails: React.FC<IProductDetails> = ({ prodInfo }) => {
  
    const { openModal } = useModal();

    return (
        <section className="cardProduct-details">
            <div className="cardProduct-details__title">
                <p>Спецификация товара</p>
            </div>

            { prodInfo.weight && ( 
            <>
                <div className="cardProduct-detail__name">Вес (г):</div>
                <div className="cardProduct-detail__value">{ prodInfo.weight }</div>
            </>
            )}

            { prodInfo.material && (
            <>  
                <div className="cardProduct-detail__name">Материал:</div>
                <div className="cardProduct-detail__value">{ prodInfo.material }</div>
            </>
            )}

            { prodInfo.iff_id && (
            <>
                <div className="cardProduct-detail__name pop-up__cardProduct-hint modal-link" onClick={() => openModal(<IFF />)}>Наличие сертификата IFF:</div>
                <div className="cardProduct-detail__value">{ prodInfo.iff_id === 1 ? 'Да' : 'Нет' }</div>
            </>
            )}

            {prodInfo.properties && 
                Object.values(prodInfo.properties).map(prop => (
                    <React.Fragment key={`${prop.prop_title}_${prop.id}`}>
                        <div className="cardProduct-detail__name">{ prop.prop_description }</div>
                        <div className="cardProduct-detail__value">{ prop.prop_value_view }</div>    
                    </React.Fragment>
                ))
            }

            {/* { prodInfo.propSeries && (
            <>
                <div className="cardProduct-detail__name">Специальное направление:</div>
                <div className="cardProduct-detail__value">{ prodInfo.propSerie.prop_value_view }</div>
            </>
            )}

            { prodInfo.propCollection && (
            <>
                <div className="cardProduct-detail__name">Коллекция:</div>
                <div className="cardProduct-detail__value">{ prodInfo.propCollection.prop_value_view }</div>
            </>
            )} */}

        </section>
    );
};

export default ProductDetails;