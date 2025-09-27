// resources/js/Components/ProductCard/PropVariants/UniversalSizeVariants.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { IPropVariants } from '@/Types/prodcard';
import { motion } from 'framer-motion';

interface Props {
    propVariants: IPropVariants;
    sizeType?: string; // Тип размера для заголовка
}

const UniversalSizeVariants: React.FC<Props> = ({ 
    propVariants, 
    sizeType = "Размер" 
}) => {
    const sizes = propVariants.possibleProductSizesForProductCard || [];

    if (sizes.length === 0) {
        return null;
    }

    return (
        <section className="cardProduct-props__item">
            <div className="cardStick-props__item-shaftLength-title fs12">
                {sizeType}:
            </div>
            
            <div className="cardProduct-sizes__container">
                {sizes.map(size => (
                    <motion.div 
                        key={size.prod_url_semantic} 
                        className={`size-variant ${size.classCurrent || ''}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link 
                            href={size.prod_url_semantic}  
                            preserveScroll 
                            preserveState
                            className="size-variant-link"
                        >
                            <span 
                                className="size-value"
                                dangerouslySetInnerHTML={{ 
                                    __html: size.size_value_view! 
                                }} 
                            />
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default UniversalSizeVariants;