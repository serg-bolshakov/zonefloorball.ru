// resources/js/Components/OrderCheckoutModals/OrderConfirmation.tsx
import { IProduct } from "@/Types/types";
import { IDeliverySelectionData } from "@/Types/delivery";
import { TCustomer } from "@/Types/types";
import useAppContext from "@/Hooks/useAppContext";
import { formatPrice } from '@/Utils/priceFormatter';
import ProductItem from "@/Components/Cart/ProductItem";
import { motion } from 'framer-motion';
import { isGuest, isIndividual, isLegal } from '@/Types/types';
import { GuestCustomerInfo } from "../Cart/OrderConfirmation/GuestCustomerInfo";
import { useState } from "react";

interface IOrderConfirmationProps {
    products: IProduct[];
    deliveryData: IDeliverySelectionData;
    currentDeliveryAddress: string;
    customerData: TCustomer;
    cartTotal: number;
    cartAmount: number;
    regularTotal: number;
    onReserve: () => void;
    onPay: () => Promise<void>;
    onBack: () => void;
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
    onBack
  }) => {
    
    const [currentAction, setCurrentAction] = useState<'pay' | 'reserve' | null>(null); // Локальный isProcessing управляет UI

    const handleAction = async (type: 'pay' | 'reserve') => {
        if (currentAction) return;
        setCurrentAction(type);
        try {
            await (type === 'pay' ? onPay() : onReserve());
        } finally {
            setCurrentAction(null);
        }
    };

    // Отдельные флаги для кастомизации UI
    const isProcessing = currentAction !== null;
    const isPaying = currentAction === 'pay';
    const isReserving = currentAction === 'reserve';

    // console.log(currentDeliveryAddress);
    const { user } = useAppContext();
    // console.log('OrderConfirmation user', user);
    // console.log('OrderConfirmation customerData', customerData);
    
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
        hover: { scale: 1.1 },
        tap: { scale: 0.9 }
    };
      
    const pulseAnimation = {
        animate: {
            scale: [1, 1.03, 1],
            transition: { 
                repeat: Infinity, 
                repeatDelay: 2,
                duration: 1.1 
            }
        }
    };

    return (
        <>
            <div className="basket-order__confirmation">
                <h2 className="registration-form__input-item"><span className="registration-form__title">Проверяем и фиксируем заказ:</span></h2>
                        
                {/* Перечень товаров в заказе: */}
                <div className="basket-order__product-items">
                    {products.map((product, index) => (
                        <ProductItem 
                            key={product.id}
                            product={product}
                            index={index}
                        />
                    ))}                    
                </div>
                <p className="order-form__total-price-p">Всего товаров ({cartTotal}) на сумму: {formatPrice(cartAmount)}&nbsp;<sup>&#8381;</sup></p>
                {cartAmount < regularTotal && (
                    <>
                        <div className="fs12 basket-res__no-delivery">
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
                {isGuest(customerData) ? (
                    <GuestCustomerInfo 
                        customer={customerData} 
                        deliveryData={deliveryData}
                    />
                ) : isIndividual(customerData) ? (
                    <IndividualCustomerInfo customer={customerData} />
                ) : (
                    <LegalCustomerInfo customer={customerData} />
                )}

                {/* Итог */}
                <div className="d-flex flex-sb margin-tb12px">
                    <span className="basket-order__product-clearance-span">Итого к оплате:</span>
                    <span className="basket-order__product-clearance-span">{formatPrice(cartAmount + deliveryData.price)}&nbsp;<sup>₽</sup></span>
                </div>

                {/* Кнопки действий */}
                <div className="d-flex flex-sa">
                    <motion.button 
                    whileHover={buttonAnimation.hover}  
                    whileTap={buttonAnimation.tap}
                    onClick={onBack}
                    className="registration-form__submit-btn"
                    >
                    Назад
                    </motion.button>
                    
                    { user && (
                        <motion.button 
                        disabled={isProcessing}
                        whileHover={buttonAnimation.hover}  
                        whileTap={buttonAnimation.tap}
                        onClick={onReserve}
                        className="registration-form__submit-btn"
                        >
                            Зарезервировать
                        </motion.button>
                    )}
                    
                    <motion.button 
                        disabled={isProcessing}     // хотя... Framer Motion автоматически игнорирует анимации при disabled
                        {...(!isProcessing && {
                            ...pulseAnimation,
                            whileHover: buttonAnimation.hover,
                            whileTap: buttonAnimation.tap
                        })}
                        onClick={() => handleAction('pay')}
                        className="registration-form__submit-btn  primary"
                    >
                        {isPaying ? 'Оплачиваем...' : 'Оплатить'}
                    </motion.button>
                </div>
                

                {/* 
                <div className="order-form__total-price-p d-flex flex-sb margin-tb12px">
                    <span className="basket-order__product-clearance-span">Получатель: </span>
                    <span id="orderBuyerNames" className="basket-order__product-clearance-span">{user.pers_surname ?? ''}&nbsp;{user.name ?? ''}</span>
                </div>     
                
                <div className="order-form__total-price-p d-flex flex-sb margin-tb12px">
                    <span className="basket-order__product-clearance-span">Телефон получателя: </span>
                    <span id="orderBuyerTelNum" className="basket-order__product-clearance-span">{user.pers_tel ?? ''}}</span>
                </div>           
            
                <p className="order-form__delivery-cost-p">Адрес доставки/получения заказа:</p>
                <div id="basketCheckRecipientInfoAddr" className ="basket-order__product-item" name="address"></div>
            
                <div className="d-flex flex-sb margin-tb12px">
                    <span className="basket-order__product-clearance-span">Итоговая стоимость заказа:</span>
                    <span id="orderTotalAmount" className="basket-order__product-clearance-span"></span>
                </div> 

                <div id='basketdivforhiddeninputsmakingneworder' className="d-none"></div> */}

                {/* Этот инпут будет хранить значение нажатой кнопки. */}
                {/* <input type="hidden" id="actionButton" name="actionButton" value="" />

                <div className="d-flex flex-sa">
                    { !user ? ( 
                        <button id="idmakereserveinbasket" type="" class="registration-form__submit-btn" name="namemakereserveinbasket" value="1">Зарезервировать</button>
                    ) : ( 
                        <button id="idmakereserveinbasket" type="submit" className="registration-form__submit-btn" name="namemakereserveinbasket" value="1">Зарезервировать</button>
                    )}
                    <button id="idpayfororderinbasket" type="submit" className="registration-form__submit-btn" name="idpayfororderinbasket" value="1">Оплатить</button>
                </div> */}
                
            </div>
        </>
    );
};

export default OrderConfirmation;