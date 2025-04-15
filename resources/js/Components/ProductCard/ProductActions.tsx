// resources/js/Components/ProductCard/ProductActions.tsx
import React from 'react';
import { IProductCardResponse } from '@/Types/prodcard';
import { useUserDataContext } from '@/Hooks/useUserDataContext';
import { useCallback } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';

import { motion } from 'framer-motion';

interface IProductActions {
    prodInfo: IProductCardResponse['prodInfo']; 
}

const ProductActions: React.FC<IProductActions> = ({ prodInfo }) => {
    
    const toastConfig = {
        position: "top-right" as const,
        autoClose: 3000, // Уведомление закроется через секунду
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        transition: Bounce, // Используем Slide, Zoom, Flip, Bounce для этого тоста
    }

    const { addToFavorites } = useUserDataContext();
    const handleFavoriteClick = async () => {
        const result = await addToFavorites(prodInfo.id);
        if (result.error) {
            toast.error(result.error, toastConfig);
        } else {
            toast.success('Товар успешно добавлен в Избранное...', toastConfig);
        }
    };

    const { cart, addToCart } = useUserDataContext();
    const handleAddToCartClick = useCallback(async (productId: number, quantity: number = 1, on_sale: number = 0) => {
        // если добавляемый пользователем товар уже есть в корзине, смотрим его количество в корзине и сравниваем с тем, сколько единиц товара есть в продаже:
        try {
            // Проверяем доступное количество
            const currentQty = cart[productId] || 0;
            const newQty = currentQty + quantity;

            if (newQty > on_sale) {
                // toast.error('Нельзя добавить в корзину количество товара больше, чем его есть в наличии ' + '(' + on_sale + ')', toastConfig)
                throw new Error(`В корзине уже максимально доступное количество товара: ${on_sale} шт.!`);
            }

            // Добавляем в корзину
            const result = await addToCart(productId, quantity);

            if (result.error) {
                toast.error(result.error, toastConfig);
                throw new Error(result.error);
            }

            toast.success(
                currentQty > 0 
                    ? `Количество товара обновлено (${newQty} шт.)`
                    : 'Товар успешно добавлен в корзину',
                toastConfig
            );
        } catch (error) {
            toast.error(
                error instanceof Error 
                    ? error.message 
                    : 'Произошла ошибка при добавлении в корзину',
                toastConfig
                );
        }       
    }, [addToCart, cart]);

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
                    className='cursor-pointer'
                    src="/storage/icons/favorite.png" 
                    onClick={handleFavoriteClick}
                    alt="favorite-logo" 
                    title="Добавить в избранное">
                    </img>
                </motion.div>
            )}

            {(prodInfo.productReport.on_sale !== undefined && prodInfo.productReport.on_sale > 0) && (
                <motion.button 
                    whileHover={{ scale: 1.05, rotate: [0, 5, -5, 0] }}
                    whileTap={{ scale: 0.9 }}
                    id="buttonFromProductCardPutProductForBasket" 
                    className="card-product__basket-button" 
                    onClick={() => handleAddToCartClick(prodInfo.id, 1, prodInfo.productReport.on_sale)}
                >
                    В корзину
                </motion.button>
            )}
        </>
    );
};

export default ProductActions;