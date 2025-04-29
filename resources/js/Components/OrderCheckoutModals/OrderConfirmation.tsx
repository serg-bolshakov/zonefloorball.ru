// resources/js/Components/OrderCheckoutModals/OrderConfirmation.tsx
import { IProduct } from "@/Types/types";
import { DeliverySelectionData } from "@/Types/delivery";
import { IGuestCustomerData } from "@/Types/orders";
import useAppContext from "@/Hooks/useAppContext";
import useModal from "@/Hooks/useModal";
import { formatPrice } from '@/Utils/priceFormatter';
import ProductItem from "@/Components/Cart/ProductItem";

interface IOrderConfirmationProps {
    products: IProduct[];
    deliveryData: DeliverySelectionData;
    customerData: IGuestCustomerData;
    cartTotal: number;
    cartAmount: number;
    regularTotal: number;
    onReserve: () => void;
    onPay: () => void;
    onBack: () => void;
  }

  const OrderConfirmation: React.FC<IOrderConfirmationProps> = ({
    products,
    deliveryData,
    customerData,
    cartTotal,
    cartAmount,
    regularTotal,
    onReserve,
    onPay,
    onBack
  }) => {
    const { user } = useAppContext();
    const deliveryText = deliveryData.transportId === 1 
    ? `Самовывоз (${deliveryData.address})` 
    : `Доставка: ${deliveryData.address}`;

    console.log('cartAmount:', cartAmount);

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
                <p className="order-form__total-price-p">Всего товаров на сумму: {formatPrice(cartAmount)}&nbsp;<sup>&#8381;</sup></p>
                {
                 /*       {user && (
                            <>
                                <div className="d-flex flex-sb margin-tb12px">
                                    <span className="basket-order__product-clearance-span">Обычная стоимость этой корзины:</span>
                                    <span id="orderTotalRegular" className="basket-order__product-clearance-span line-through"></span>
                                </div>

                                <div className="d-flex flex-sb margin-tb12px">
                                    <span className="basket-order__product-clearance-span">Моя скидка на товары в заказе:</span>
                                    <span id="orderTotalDiscount" className="basket-order__product-clearance-span color-green"></span>
                                </div>
                            </>
                        )} */}

                        {/* Выбранный способ доставки заказа: */}
                        {/* <p className="registration-form__input-item">
                            <div className="basket-order__product-item basket-order__delivery-way"></div>
                        </p>
                        <p id="basketpreorderedproductscheckingdeliverycostpelem" className="order-form__delivery-cost-p"></p>

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