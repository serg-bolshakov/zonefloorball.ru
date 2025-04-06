// resources/js/Components/ProductCard/ProductActions.tsx
import React from 'react';
import { IProductCardResponse } from '@/Types/prodcard';
import { useUserDataContext } from '@/Hooks/useUserDataContext';

import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';

import { motion } from 'framer-motion';

interface IProductActions {
    prodInfo: IProductCardResponse['prodInfo']; 
}

const ProductActions: React.FC<IProductActions> = ({ prodInfo }) => {

    const { addToFavorites } = useUserDataContext();
    
    const handleFavoriteClick = async () => {
      
        const result = await addToFavorites(prodInfo.id);
        const toastConfig = {
            position: "top-right" as const,
            autoClose: 3000, // Уведомление закроется через секунду
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            transition: Bounce, // Используем Slide, Zoom, Flip, Bounce для этого тоста
        }

      if (result.error) {
        toast.error(result.error, toastConfig);
      } else {
        toast.success('Товар успешно добавлен в Избранное...', toastConfig);
      }

    };

    return (
        <>  
            {prodInfo.actualPrice && (
                <motion.div 
                    whileHover={{ scale: 1.1 }}  
                    whileTap={{ scale: 0.9 }}
                    animate={{
                        scale: [1, 1.05, 0.95], // Пульсация
                        transition: { 
                        repeat: Infinity, 
                        repeatDelay: 1,
                        duration: 0.9 
                        }
                    }}
                >
                    <img
                    id="buttonFromProductCardPutProductForFavorites" 
                    src="/storage/icons/favorite.png" 
                    onClick={handleFavoriteClick}
                    alt="favorite-logo" 
                    title="Добавить в избранное">
                    </img>
                </motion.div>
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