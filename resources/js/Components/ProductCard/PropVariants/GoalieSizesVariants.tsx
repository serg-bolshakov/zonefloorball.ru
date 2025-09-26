// resources/js/Components/ProductCard/PropVariants/GoalieSizesVariants.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { IPropVariants } from '@/Types/prodcard';
import { motion } from 'framer-motion';

interface Props {
    propVariants: IPropVariants;
}

const GoalieSizesVariants: React.FC<Props> = ({ propVariants }) => {

    return (
        <section className="cardProduct-props__item">
            {/* Отличные модели мячей по цветам */}
            {propVariants.possibleGoalieSizesForProductCard && propVariants.possibleGoalieSizesForProductCard.length > 0 && (
                <div className="cardProduct-props__item">
                    <div className="cardStick-props__item-shaftLength-title fs12">
                        Размер:
                    </div>
                    
                    {propVariants.possibleGoalieSizesForProductCard.map(possibleSize => (
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
                </div>
            )}
        </section>
    );
};

export default GoalieSizesVariants;