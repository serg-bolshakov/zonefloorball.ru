// resources/js/Components/OrderCheckoutModals/OrderConfirmation.tsx
import { IProduct } from "@/Types/types";
import { IDeliverySelectionData } from "@/Types/delivery";
import { TCartCustomer, TCartGuestCustomer, TCartIndividualCustomer, TCartLegalCustomer } from "@/Types/cart";
import useAppContext from "@/Hooks/useAppContext";
import { formatPrice } from '@/Utils/priceFormatter';
import ProductItem from "@/Components/Cart/ProductItem";
import { motion } from 'framer-motion';
// import { isGuest, isIndividual, isLegal } from '@/Types/types';
import { isIndividualUser, isLegalUser } from "@/Types/types";
import { GuestCustomerInfo } from "../Cart/OrderConfirmation/GuestCustomerInfo";
import { IndividualCustomerInfo } from "../Cart/OrderConfirmation/IndividualCustomerInfo";
import { LegalCustomerInfo } from "../Cart/OrderConfirmation/LegalCustomerInfo";
import { useState } from "react";

interface IOrderConfirmationProps {
    products: IProduct[];
    deliveryData: IDeliverySelectionData;
    currentDeliveryAddress: string;
    customerData: TCartCustomer;
    cartTotal: number;
    cartAmount: number;
    regularTotal: number;
    onReserve: () => Promise<void>;
    onPay: () => Promise<void>;
    onPreorder: () => Promise<void>;
    onBack: () => void;
    onCancel: () => void;
}

const OrderConfirmation: React.FC<IOrderConfirmationProps> = ({
    products,
    deliveryData,
    currentDeliveryAddress,
    customerData,
    cartTotal,
    cartAmount,
    regularTotal,
    onReserve,
    onPay,
    onPreorder, 
    onBack,
    onCancel
  }) => {
    
    const [currentAction, setCurrentAction] = useState<'pay' | 'reserve' | 'preorder' | null>(null); // Локальный isProcessing управляет UI

    const handleAction = async (type: 'pay' | 'reserve' | 'preorder') => {
        if (currentAction) return;
        setCurrentAction(type);
        try {
            await (type === 'pay' ? onPay() : onReserve());
        } finally {
            setCurrentAction('preorder');
        }
    };

    // Отдельные флаги для кастомизации UI
    const isProcessing = currentAction !== null;
    const isPaying = currentAction === 'pay';
    const isReserving = currentAction === 'reserve';

    const { user } = useAppContext();
    
    const deliveryText = deliveryData.transportId === 1 
        ? `${currentDeliveryAddress}` 
        : deliveryData.transportId === 2 
            ? `Доставка средствами продавца по городу Нижнему Новгороду по адресу: ${currentDeliveryAddress}`
            : `Доставка: ${currentDeliveryAddress}`
    ;

    const discountAmount = regularTotal - cartAmount;
    const discountPercent = Math.round((discountAmount / regularTotal) * 100);

    // Добавим проверку для deliveryData.price:
    const deliveryPrice = deliveryData?.price ?? 0;

    // Анимации кнопок (вынесем в константы):
    const buttonAnimation = {
        hover: { scale: 0.9 },
        tap: { scale: 0.9 }
    };
      
    const pulseAnimation = {
        animate: {
            scale: [1, 0.95, 1],
            transition: { 
                repeat: Infinity, 
                repeatDelay: 2,
                duration: 1.1 
            }
        }
    };

    // console.log('products', products);

    return (
        <>
            <div className="basket-order__confirmation">
                <h2 className="registration-form__input-item"><span className="registration-form__title">Проверяем и фиксируем заказ:</span></h2>
                        
                {/* Перечень товаров в заказе: */}
                <div className="basket-order__product-items">
                    {products.map((product, index) => (
                        <ProductItem 
                            user={user}
                            key={product.id}
                            product={product}
                            index={index}
                        />
                    ))}                    
                </div>
                <p className="order-form__total-price-p">Всего товаров ({cartTotal}) на сумму: {formatPrice(cartAmount)}&nbsp;<sup>&#8381;</sup></p>
                {cartAmount < regularTotal && (
                    <>
                        <div className="d-flex flex-sb flex-wrap fs12">
                            <p className="">Скидка на товары составила:</p>
                            <p className="color-red">
                            {formatPrice(discountAmount)}<sup>₽</sup> (или {discountPercent}%)
                            </p>
                        </div>
                                        
                    </>
                )}    
                
                {/* Выбранный способ доставки заказа: */}
                <div className="basket-order__product-item basket-order__delivery-way">
                    <span>{deliveryText} ({deliveryData.time}, {deliveryPrice}&nbsp;<sup>₽</sup>)</span>
                </div>
                
                {/* Данные получателя */}
                
                {isIndividualUser(user) ? (
                    <IndividualCustomerInfo customer={customerData  as TCartIndividualCustomer} />
                ) : isLegalUser(user) ? (
                    <LegalCustomerInfo customer={customerData as TCartLegalCustomer} />
                ) : (
                    <GuestCustomerInfo 
                        customer={customerData as TCartGuestCustomer} 
                        deliveryData={deliveryData}
                    />
                )}

                {/* Итог */}
                <div className="d-flex flex-sb margin-tb12px">
                    <span className="basket-order__product-clearance-span">Итого к оплате:</span>
                    <span className="basket-order__product-clearance-span">{formatPrice(cartAmount + deliveryData.price)}&nbsp;<sup>₽</sup></span>
                </div>

                {/* Кнопки действий */}
                <div className="d-flex flex-sa">
                    {!user && (
                        <motion.button 
                            whileHover={buttonAnimation.hover}  
                            whileTap={buttonAnimation.tap}
                            onClick={onBack}
                            className="order-confirmation__submit-btn"
                        >
                        Назад
                        </motion.button>
                    )}

                    {user && (
                        <motion.button 
                            whileHover={buttonAnimation.hover}  
                            whileTap={buttonAnimation.tap}
                            onClick={onCancel}
                            className="order-confirmation__submit-btn"
                        >
                        Отмена
                        </motion.button>
                    )}
                    
                    { isLegalUser(user) && (
                        <motion.button 
                            disabled={isProcessing}
                            whileHover={isProcessing ? {} : buttonAnimation.hover}  
                            whileTap={isProcessing ? {} : buttonAnimation.tap}
                            onClick={() => handleAction('preorder')}
                            className="order-confirmation__submit-btn"
                        >
                            { isLegalUser(user) && ( isReserving ? 'Готовим предзаказ' : 'Получить счёт на предзаказ' )}
                        </motion.button>
                    )}

                    { (isIndividualUser(user) || isLegalUser(user)) && (
                        <motion.button 
                            disabled={isProcessing}
                            whileHover={isProcessing ? {} : buttonAnimation.hover}  
                            whileTap={isProcessing ? {} : buttonAnimation.tap}
                            onClick={() => handleAction('reserve')}
                            className="order-confirmation__submit-btn"
                        >
                            { isIndividualUser(user) && ( isReserving ? 'Создаём резерв' : 'Отложить' )}
                            { isLegalUser(user) && ( isReserving ? 'Готовим счёт' : 'Получить счёт' )}
                        </motion.button>
                    )}
                    { !isLegalUser(user) && (
                        <motion.button 
                            disabled={isProcessing}     // хотя... Framer Motion должен автоматически игнорировать анимации при disabled
                            {...(!isProcessing && {
                                ...pulseAnimation,
                                whileHover: buttonAnimation.hover,
                                whileTap: buttonAnimation.tap
                            })}
                            onClick={() => handleAction('pay')}
                            className="order-confirmation__submit-btn primary"
                        >
                            {isPaying ? 'Оплачиваем...' : 'Оплатить'}
                        </motion.button>
                    )}
                </div>
            </div>
        </>
    );
};

export default OrderConfirmation;