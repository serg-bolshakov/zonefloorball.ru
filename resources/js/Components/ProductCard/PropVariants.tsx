// resources/js/Components/ProductCard/PropVariants.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { IPropVariants } from '@/Types/prodcard';

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
                        <div className="cardStick-props__item-hook">
                            <Link href={propVariants.resultpossibleHookForProductCard.prod_url_semantic}>
                                {propVariants.resultpossibleHookForProductCard.prop_value_view}
                            </Link>
                        </div>
                    ) : propVariants.propHook === 'Левый' ? (
                        <div className="cardStick-props__item-hook-active">
                            {propVariants.propHook}
                        </div>
                    ) : null}

                    {/* Правый хват */}
                    {((propVariants.propHook !== 'Правый' && propVariants.resultpossibleHookForProductCard) || 
                     (propVariants.resultpossibleHookForProductCard && propVariants.resultpossibleHookForProductCard.prop_value === 'right')) ? (
                        <div className="cardStick-props__item-hook">
                            <Link href={propVariants.resultpossibleHookForProductCard.prod_url_semantic}  preserveScroll preserveState>
                                {propVariants.resultpossibleHookForProductCard.prop_value_view}
                            </Link>
                        </div>
                    ) : propVariants.propHook === 'Правый' ? (
                        <div className="cardStick-props__item-hook-active">
                            {propVariants.propHook}
                        </div>
                    ) : null}
                </>
            ) : propVariants.propHook ? (
                <>
                    <div className="cardProduct-props__item-hook-title fs12">
                        Хват (игровая сторона): 
                    </div>
                    <div className="cardStick-props__item-hook-active">
                        {propVariants.propHook}
                    </div>
                </>
            ) : null}

            {/* Длина рукоятки */}
            {propVariants.possibleShaftLengthForProductCard && propVariants.possibleShaftLengthForProductCard.length > 0 && (
                <div className="cardProduct-props__item">
                    <div className="cardStick-props__item-shaftLength-title fs12">
                        Длина рукоятки (см):
                    </div>
                    
                    {propVariants.possibleShaftLengthForProductCard.map(possibleShaftLength => (
                        <div key={'possibleShaftLength' + possibleShaftLength.id} className={possibleShaftLength.classCurrent || ''}>
                            <Link href={possibleShaftLength.prod_url_semantic}  preserveScroll preserveState>
                                {possibleShaftLength.size_value}
                            </Link>
                        </div>
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