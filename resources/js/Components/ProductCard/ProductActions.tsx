// resources/js/Components/ProductCard/ProductDescription.tsx
import React from 'react';
import { IProductCardResponse } from '@/Types/prodcard';

interface IProductActions {
    prodInfo: IProductCardResponse['prodInfo']; 
}

const ProductActions: React.FC<IProductActions> = ({ prodInfo }) => {

    return (
        <>  
            {prodInfo.actualPrice && (
                <img id="buttonFromProductCardPutProductForFavorites" src="/storage/icons/favorite.png" alt="favorite-logo" title="Добавить в избранное"></img>
            )}

            {(prodInfo.productReport.on_sale !== undefined && prodInfo.productReport.on_sale > 0) ? (
                <button id="buttonFromProductCardPutProductForBasket" className="card-product__basket-button" value="В корзину">В корзину</button>
                ) : (
                    null
                ) 
            }
        </>
    );
};

export default ProductActions;