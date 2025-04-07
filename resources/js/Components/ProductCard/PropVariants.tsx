// resources/js/Components/ProductCard/PropVariants.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { IPropVariants } from '@/Types/prodcard';
import { motion } from 'framer-motion';

interface Props {
    propVariants: IPropVariants;
}

const PropVariants: React.FC<Props> = ({ propVariants }) => {
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
                            whileHover={{ scale: 1.05, rotate: [0, 5, -5, 0] }}
                            whileTap={{ scale: 0.95, rotate: [0, 15, -15, 0] }}
                        >
                            <Link href={propVariants.resultpossibleHookForProductCard.prod_url_semantic} preserveScroll preserveState>
                                {propVariants.resultpossibleHookForProductCard.prop_value_view}
                            </Link>
                        </motion.div>
                    ) : propVariants.propHook === 'Левый' ? (
                        <motion.div 
                            className="cardStick-props__item-hook-active"
                            whileHover={{ scale: 1.05, rotate: [0, 5, -5, 0] }}    // rotate: [0, 10, -10, 0] // Лёгкое "дрожание"
                            whileTap={{ scale: 0.95, rotate: [0, 15, -15, 0] }}
                        >
                            {propVariants.propHook}
                        </motion.div>
                    ) : null}

                    {/* Правый хват */}
                    {((propVariants.propHook !== 'Правый' && propVariants.resultpossibleHookForProductCard) || 
                     (propVariants.resultpossibleHookForProductCard && propVariants.resultpossibleHookForProductCard.prop_value === 'right')) ? (
                        <motion.div 
                            className="cardStick-props__item-hook"
                            whileHover={{ scale: 1.05, rotate: [0, 5, -5, 0] }}
                            whileTap={{ scale: 0.95, rotate: [0, 15, -15, 0] }}
                        >
                            <Link href={propVariants.resultpossibleHookForProductCard.prod_url_semantic}  preserveScroll preserveState>
                                {propVariants.resultpossibleHookForProductCard.prop_value_view}
                            </Link>
                        </motion.div>
                    ) : propVariants.propHook === 'Правый' ? (
                        <motion.div 
                            className="cardStick-props__item-hook-active"
                            whileHover={{ scale: 1.05, rotate: [0, 5, -5, 0] }}
                            whileTap={{ scale: 0.95, rotate: [0, 15, -15, 0] }}
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
                        whileHover={{ scale: 1.05, rotate: [0, 5, -5, 0] }}
                        whileTap={{ scale: 0.95, rotate: [0, 15, -15, 0] }}
                        >
                        {propVariants.propHook}
                    </motion.div>
                </>
            ) : null}

            {/* Длина рукоятки */}
            {propVariants.possibleShaftLengthForProductCard && propVariants.possibleShaftLengthForProductCard.length > 0 && (
                <div className="cardProduct-props__item">
                    <div className="cardStick-props__item-shaftLength-title fs12">
                        Длина рукоятки (см):
                    </div>
                    
                    {propVariants.possibleShaftLengthForProductCard.map(possibleShaftLength => (
                        <motion.div 
                            key={possibleShaftLength.prod_url_semantic} 
                            className={possibleShaftLength.classCurrent || ''}
                            whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                            whileTap={{ scale: 0.95, rotate: [0, 15, -15, 0] }}
                        >
                            <Link href={possibleShaftLength.prod_url_semantic}  preserveScroll preserveState>
                                {possibleShaftLength.size_value}
                            </Link>
                        </motion.div>
                    ))}

                    {/* {propVariants.possibleShaftLengthForProductCard
                    ?.filter((item, index, self) => 
                        index === self.findIndex((t) => (
                        t.size_value === item.size_value && 
                        t.prod_url_semantic === item.prod_url_semantic
                        ))
                    )
                    .map((item) => (
                        <div key={`${item.size_value}-${item.prod_url_semantic}`} 
                            className={item.classCurrent || ''}>
                        <Link href={item.prod_url_semantic} preserveScroll preserveState>
                            {item.size_value}
                        </Link>
                        </div>
                    ))} */}

                </div>
            )}
        </section>
    );
};

export default PropVariants;