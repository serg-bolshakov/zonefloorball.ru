// resources/js/Components/ProductCard/PropVariants/GoailiePantsVariants.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { IPropVariants } from '@/Types/prodcard';
import { motion } from 'framer-motion';

interface Props {
    propVariants: IPropVariants;
}

const GoailiePantsVariants: React.FC<Props> = ({ propVariants }) => {
    console.log('GoailiePantsVariants', propVariants.possiblePantsSizesForProductCard);
    return (
        <section className="cardProduct-props__item">
            {/* Отличные модели мячей по цветам */}
            {propVariants.possiblePantsSizesForProductCard && propVariants.possiblePantsSizesForProductCard.length > 0 && (
                <div className="cardProduct-props__item">
                    <div className="cardStick-props__item-shaftLength-title fs12">
                        Размер:
                    </div>
                    
                    {propVariants.possiblePantsSizesForProductCard.map(possibleSize => (
                        <motion.div 
                            key={possibleSize.prod_url_semantic} 
                            className={possibleSize.classCurrent || ''}
                            whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                            whileTap={{ scale: 0.95, rotate: [0, 15, -15, 0] }}
                        >
                            <Link href={possibleSize.prod_url_semantic}  preserveScroll preserveState>
                               <div dangerouslySetInnerHTML={{ __html: possibleSize.size_value_view! }} />
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

export default GoailiePantsVariants;