// resources/js/Components/ProductCard/PropVariants/StickVariants.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { IPropVariants } from '@/Types/prodcard';
import { motion } from 'framer-motion';

interface Props {
    propVariants: IPropVariants;
}

const BladeVariants: React.FC<Props> = ({ propVariants }) => {
    return (
        <section className="cardProduct-props__item">
            {/* Хват (игровая сторона) */}
            {propVariants.resultpossibleHookForProductCard ? (
                <>
                    <div className="cardProduct-props__item-hook-title fs12">
                        Хват (игровая сторона): 
                    </div>

                    {/* Левый хват */}
                    {((propVariants.propHook !== 'Левый' && propVariants.resultpossibleHookForProductCard) || 
                     (propVariants.resultpossibleHookForProductCard && propVariants.resultpossibleHookForProductCard.prop_value === 'left')) ? (
                        <motion.div 
                            className="cardStick-props__item-hook"
                            whileHover={{ scale: 1.05, rotate: [0, 1, -1, 0] }}
                            whileTap={{ scale: 0.95, rotate: [0, 1, -1, 0] }}
                        >
                            <Link href={propVariants.resultpossibleHookForProductCard.prod_url_semantic} preserveScroll preserveState>
                                {propVariants.resultpossibleHookForProductCard.prop_value_view}
                            </Link>
                        </motion.div>
                    ) : propVariants.propHook === 'Левый' ? (
                        <motion.div 
                            className="cardStick-props__item-hook-active"
                            whileHover={{ scale: 1.05, rotate: [0, 1, -1, 0] }}    // rotate: [0, 10, -10, 0] // Лёгкое "дрожание"
                            whileTap={{ scale: 0.95, rotate: [0, 1, -1, 0] }}
                        >
                            {propVariants.propHook}
                        </motion.div>
                    ) : null}

                    {/* Правый хват */}
                    {((propVariants.propHook !== 'Правый' && propVariants.resultpossibleHookForProductCard) || 
                     (propVariants.resultpossibleHookForProductCard && propVariants.resultpossibleHookForProductCard.prop_value === 'right')) ? (
                        <motion.div 
                            className="cardStick-props__item-hook"
                            whileHover={{ scale: 1.05, rotate: [0, 1, -1, 0] }}
                            whileTap={{ scale: 0.95, rotate: [0, 1, -1, 0] }}
                        >
                            <Link href={propVariants.resultpossibleHookForProductCard.prod_url_semantic}  preserveScroll preserveState>
                                {propVariants.resultpossibleHookForProductCard.prop_value_view}
                            </Link>
                        </motion.div>
                    ) : propVariants.propHook === 'Правый' ? (
                        <motion.div 
                            className="cardStick-props__item-hook-active"
                            whileHover={{ scale: 1.05, rotate: [0, 1, -1, 0] }}
                            whileTap={{ scale: 0.95, rotate: [0, 1, -1, 0] }}
                        >
                            {propVariants.propHook}
                        </motion.div>
                    ) : null}
                </>
            ) : propVariants.propHook ? (
                <>
                    <div className="cardProduct-props__item-hook-title fs12">
                        Хват (игровая сторона): 
                    </div>
                    <motion.div 
                        className="cardStick-props__item-hook-active"
                        whileHover={{ scale: 1.05, rotate: [0, 1, -1, 0] }}
                        whileTap={{ scale: 0.95, rotate: [0, 1, -1, 0] }}
                        >
                        {propVariants.propHook}
                    </motion.div>
                </>
            ) : null}

            {/* Отличные модели крюков по цветам */}
            {propVariants.resultotherColourBladeForCard && propVariants.resultotherColourBladeForCard.length > 0 && (
                <div className='card-product__blade-choice'>                    
                    {propVariants.resultotherColourBladeForCard.map(possibleColour => (
                        <motion.div 
                            key={possibleColour.prod_url_semantic} 
                            whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                            whileTap={{ scale: 0.95, rotate: [0, 15, -15, 0] }}
                        >
                            <Link href={`/products/card/${ possibleColour.prod_url_semantic }`} preserveScroll preserveState>
                                <img src={`/storage/${ possibleColour.img_link }`} 
                                    alt={['kryuk dlya florbolnoy klyushki', possibleColour.model, possibleColour.marka].filter(item => Boolean(item) && item !== "NoName").join(' ')}
                                    title ="Кликни на изображение, чтобы посмотреть его на всём экране." />
                            </Link>
                            
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default BladeVariants;