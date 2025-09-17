import { Link } from '@inertiajs/react';
import { formatPrice } from '@/Utils/priceFormatter';
import { calculateFinalPrice, getPriceDescription } from '@/Utils/priceCalculations';
import { IProduct, TUser, isLegalUser, isIndividualUser } from '@/Types/types';

interface ProductCardProps {
  product: IProduct;
  user: TUser | null;
}

const AssortimentCard = ({ product, user }: ProductCardProps) => {

    const userIsLegal = user ? isLegalUser(user) : false;
    const userIsIndividual = user ? isIndividualUser(user) : false;

    // Рассчитываем финальную цену
    const finalPrice = calculateFinalPrice({
        price_regular: product.price_regular ?? 0,
        price_actual: product.price_actual ?? 0,
        price_with_action_discount: product.price_with_action_discount ?? null,
        price_with_rank_discount: product.price_with_rank_discount ?? null,
        isLegalUser: userIsLegal
    });

    // Получаем описание цены
    const { message, className } = getPriceDescription(
        finalPrice,
        product.price_regular ?? 0,
        product.price_with_rank_discount ?? null,
        userIsLegal,
        userIsIndividual
    );

    // Рассчитываем процент скидки
    const calculateDiscountPercentage = (regular: number, final: number): number => {
        return Math.ceil(100 - (final / regular) * 100);
    };

    const discountPercentage = product.price_regular && finalPrice 
        ? calculateDiscountPercentage(product.price_regular, finalPrice)
        : 0;

    return (
        <div key={product.id} className="assortiment-card__block">
            <div className="assortiment-card__block-productImg">
                <Link href={`/products/card/${product.prod_url_semantic}`}>
                <img 
                    src={`/storage/${product.img_link}`} 
                    alt={[product.category, product.brand, product.model, product.marka].filter(Boolean).join(' ')} 
                    title={[product.category, product.brand, product.model, product.marka]
                    .filter(item => Boolean(item) && item !== "NoName")
                    .join(' ')} 
                />
                </Link>
            </div>
      
            <div className="assortiment-card__block-productInfo">
                <div className="assortiment-card_productName">
                    <Link href={`/products/card/${product.prod_url_semantic}`}>
                        {product.title}
                    </Link>
                </div>
       
                <div className="assortiment-card_productPrice">
                    {product.prod_status !== 2 ? (
                        <>
                            {/* Основная цена */}
                            <p className={finalPrice < (product.price_regular ?? 0) ? "priceCurrentSale" : "priceCurrent"}>
                                <span className="nobr">
                                {formatPrice(finalPrice)} <sup>₽</sup>
                                </span>
                            </p>

                            {/* Старая цена (если есть скидка) */}
                            {finalPrice < (product.price_regular ?? 0) && (
                                <p className="priceBeforSale">
                                <span className="nobr">
                                    {formatPrice(product.price_regular ?? 0)} <sup>₽</sup>
                                </span>
                                </p>
                            )}

                            {/* Процент скидки */}
                            {finalPrice < (product.price_regular ?? 0) && (
                                <p className="priceDiscountInPercentage">
                                <span className="nobr">
                                    - {discountPercentage}%
                                </span>
                                </p>
                            )}

                            {/* Описание цены */}
                            {/* <p className={`fs12  ${className}` }>
                                {message}
                            </p> */}
                        </>
                    ) : (
                        <p>Товар в архиве</p>
                    )}
                </div>

                {/* Информация для пользователя */}
                {user && (
                <p className="fs12">
                    {/* {user.client_type_id === 1
                    ? "... это моя специальная цена..."
                    : "... это наша специальная цена..."} */}
                    {message}
                </p>
                )}

                {/* Цена предзаказа */}
                {product.price_preorder && (
                <p className="catalog-preorder-price">
                    <span className="nobr">
                    (на заказ: {formatPrice(product.price_preorder)}
                    </span>
                    <sup>₽</sup> )
                </p>
                )}
            </div>
        </div>
    );
};

export default AssortimentCard;