// resources/js/Components/ProductCard/PropVariants/BallVariants.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { IPropVariants } from '@/Types/prodcard';
import { motion } from 'framer-motion';

interface Props {
    propVariants: IPropVariants;
}

const BallVariants: React.FC<Props> = ({ propVariants }) => {
    return (
        <section className="cardProduct-props__item">
            {/* Отличные модели мячей по цветам */}
            {propVariants.products && propVariants.products.length > 0 && (
                <div className='card-product__blade-choice'>                    
                    {propVariants.products.map(possibleColour => (
                        <motion.div 
                            key={possibleColour.prod_url_semantic} 
                            whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                            whileTap={{ scale: 0.95, rotate: [0, 15, -15, 0] }}
                        >
                            <Link href={`/products/card/${ possibleColour.prod_url_semantic }`} preserveScroll preserveState>
                                <img src={`/storage/${ possibleColour.img_link }`} 
                                    alt={['florbolnyi myach', possibleColour.model, possibleColour.marka].filter(item => Boolean(item) && item !== "NoName").join(' ')}
                                    title ="Кликни на изображение, чтобы посмотреть его на всём экране." />
                            </Link>
                            
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default BallVariants;