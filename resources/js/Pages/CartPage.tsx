// resources/js/Pages/CartPage.tsx
import useAppContext from "@/Hooks/useAppContext";
    import { useUserDataContext } from "@/Hooks/useUserDataContext";
    import axios from "axios";
    import { getCookie } from "@/Utils/cookies";                        // Хелпер для получения CSRF-токена
    import MainLayout from "@/Layouts/MainLayout";
    import { Helmet } from "react-helmet";
    import { useEffect, useState, useMemo, useRef } from "react";
    import { getErrorMessage } from "@/Utils/error";
    import { IProduct } from "@/Types/types";
    import { Link, usePage } from '@inertiajs/react';
    import { InertiaLink } from "@inertiajs/inertia-react";
    import { AnimatePresence, motion } from 'framer-motion';
    import { formatPrice } from "@/Utils/priceFormatter";
    import { toast } from 'react-toastify';
    import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
    import { useCallback } from "react";
    import NavBarBreadCrumb from "@/Components/NavBarBreadCrumb";
    import { API_ENDPOINTS } from "@/Constants/api";
    import PriceBlock from "@/Components/Cart/PriceBlock";
    import { QuantityControl } from "@/Components/Cart/QuantityControl";
    import ProductsQuantityInCart from "@/Components/Cart/ProductsQuantityInCart";
    import DiscountSummary from "@/Components/Cart/DiscountSummary";
    import DeliverySelector from "@/Components/Cart/DeliverySelector";
    import useModal from "@/Hooks/useModal";
    import AuthWarningModal from '../Components/OrderCheckoutModals/AuthWarningModal'; 
    import { TCartCustomer } from "@/Types/cart";
    import { TCartLegalCustomer } from "@/Types/cart";
    import { TCartIndividualCustomer } from "@/Types/cart";
    import { TUser } from "@/Types/types";
    import GuestCustomerDataModalForm from "@/Components/OrderCheckoutModals/GuestCustomerDataModalForm";
    import { ITransport, IDeliverySelectionData } from "@/Types/delivery";
    import OrderConfirmation from "@/Components/OrderCheckoutModals/OrderConfirmation";
    import { IIndividualUser, IOrgUser } from "@/Types/types";
    import useCreateOrder from "@/Hooks/useCreateOrder";
    import { router } from '@inertiajs/react';
    import { useForm } from '@inertiajs/react';
    import IndividualCustomerDataModalForm from "@/Components/OrderCheckoutModals/IndividualCustomerDataModalForm";
    import { isIndividualUser } from "@/Types/types";
    import { IGuestCustomer } from "@/Types/types";
    import { isLegalUser } from "@/Types/types";
    import LegalCustomerDataModalForm from "@/Components/OrderCheckoutModals/LegalCustomerDataModalForm";

interface IHomeProps {  
    title: string;
    robots: string;
    description: string;
    keywords: string;
    transports: ITransport[];
}

const CartPage: React.FC<IHomeProps> = ({title, robots, description, keywords, transports}) => {
    const { openModal, closeModal } = useModal();
    
    const { user } = useAppContext();
    const { cart, cartTotal, updateCart, addToFavorites, removeFromCart, clearCart, addOrder } = useUserDataContext();
    const [cartProducts, setCartProducts] = useState<IProduct[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [cartAmount, setCartAmount] = useState<number>(0);
    const [regularAmount, setRegularAmount] = useState<number>(0); // Сумма без скидок

    const initialDeliveryData: IDeliverySelectionData = {        // initialDeliveryData можно переиспользовать (например, для сброса)...
        transportId: 0,
        address: '',
        price: 0,
        time: '',
        metadata: {}
    };
    
    // Данные об адресе доставки товара:
    const [deliveryData, setDeliveryData] = useState<IDeliverySelectionData>(initialDeliveryData);
    const [selectedTransportId, setSelectedTransportId] = useState(0);

    // Проверка типа покупателя
    const getInitialCustomerData = (
        user: TUser | null,
        deliveryData: { address?: string } = {}
    ): TCartCustomer => {
      
        if (isIndividualUser(user)) {       // Теперь TS знает, что user - IIndividualUser
            return {
                type: 'individual',
                firstName: user.name,
                lastName: user.pers_surname || '',
                phone: user.pers_tel || '',
                email: user.pers_email || user.email || '',
                deliveryAddress: user.delivery_addr_on_default || '',
                // bonuses: (user as IIndividualUser).bonuses || undefined
                bonuses: user.bonuses                       // isIndividualUser уже гарантирует тип
            };
        }
       
        if(isLegalUser(user)) {
            return {
                type: 'legal',
                orgname: user.name,
                phone: user.org_tel || '',
                inn: user.org_inn || '',
                kpp: user.org_kpp || '',
                deliveryAddress: user.delivery_addr_on_default || '',
                legalAddress: user.org_addr || '',
                email: user.email || ''
            }
        }

        return {                            // if(!user)...
            type: 'guest',
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            deliveryAddress: deliveryData.address || ''
        };
    };
      
    const [customerData, setCustomerData] = useState<TCartCustomer>(getInitialCustomerData(user));
    // console.log('CartPage customerData', customerData);
    const toastConfig = {
        position: "top-right" as const,
        autoClose: 1500, // Уведомление закроется через секунду-другую...
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        transition: Zoom, // Используем Slide, Zoom, Flip, Bounce для этого тоста
    };

    const { props } = usePage();
    const returnBack = () => {
        const comeFrom = props.from || '/catalog'; // Получаем сохранённый URL
        window.history.back(); // Или явный редирект:
        // Inertia.visit(comeFrom);
    };

    useEffect(() => {
        const controller = new AbortController; // AbortController - встроенный браузерный API для отмены операций (запросов, таймеров и т.д.)
        // создаёт объект, который позволяет отменить асинхронные операции (например, HTTP-запросы).
        const signal = controller.signal;       // это объект AbortSignal, который передаётся в axios (или fetch).

        if(cartTotal === 0) {
            setCartProducts([]);
            return;
        }

        const loadCart = async () => {
            if(!cartTotal) {
                setCartProducts([]);
                return;
            }
            setIsLoading(true);
            setError(null);

            try {
                // console.log(cart);
                const response = await axios.post(API_ENDPOINTS.CART, {
                    products: cart, // Отправляем текущую корзину
                }, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json'
                    },
                    signal, // Передаём signal в конфиг axios
                });

                // Проверяем, не был ли запрос отменён
                if (!signal.aborted) {
                    setCartProducts(response.data.products?.data || []);
                }
            } catch (error) {
                // Игнорируем ошибку, если запрос был отменён
                if (!axios.isCancel(error)) {
                    setError(getErrorMessage(error));
                    toast.error('Ошибка загрузки:' + getErrorMessage(error), toastConfig);
                }
            } finally {
                if (!signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        loadCart();

        // Функция очистки: отменяем запрос при размонтировании или изменении cart
        return () => {
            controller.abort();
        };

    }, [cart]);

    useEffect(() => {
        if (cartProducts.length > 0) {
          const regular = cartProducts.reduce((sum, p) => sum + (p.price_regular ?? 0) * (p.quantity ?? 0), 0);
          const discounted = calculateCartTotalAmount(cartProducts);
          
          setRegularAmount(regular);
          setCartAmount(discounted);
        }
    }, [cartProducts]);

    useEffect(() => {
        const newCustomerData = getInitialCustomerData(user);
        setCustomerData(newCustomerData);
    }, [user]);

    const handleFavoriteClick = useCallback(async (productId: number) => {
        try {
            const result = await addToFavorites(productId);    
            if (result.error) {
                toast.error(result.error, toastConfig);
            } else {
                toast.success('Товар успешно добавлен в Избранное...', toastConfig);
            }
        } catch(error) {
            toast.error('Не удалось добавить в Избранное', toastConfig);
        }
    }, [addToFavorites]);

    const handleRemoveFromCartClick = useCallback(async (productId: number) => {
        openModal(null, 'confirm', {
            title: "Удалить из Корзины?",
            onConfirm: async () => {
                try {
                    const result = await removeFromCart(productId);    
                    if (result.error) {
                        toast.error(result.error, toastConfig);
                    } else {
                        toast.success('Товар успешно удалён из Корзины...', toastConfig);
                    }
                } catch(error) {
                    toast.error('Не удалось удалить из Корзины', toastConfig);
                }
            },
            onCancel: () => {
                toast.success('Товар оставлен в Корзине', toastConfig);
            }
        });
    }, [removeFromCart]);

    const calculateCartTotalAmount = useCallback((products: IProduct[]): number => {
        // console.log(products);
        return products.reduce((total, product) => {
            // Выбираем минимальную цену из доступных (акционная, ранговые скидки и т.д.)
            const effectivePrice = Math.min(
                product.price_special ?? Infinity,
                product.price_with_rank_discount ?? Infinity,
                product.price_actual ?? Infinity,
                product.price_regular ?? Infinity
            );
            // console.log(effectivePrice);
            return total + (effectivePrice * (product.quantity ?? 0));
        }, 0);
    }, []);
    
    const handleTransportSelect = useCallback((data: IDeliverySelectionData) => {
        // setDeliveryData(data);   - можно и так... но так лучше:
        setDeliveryData(prev => 
            JSON.stringify(prev) === JSON.stringify(data) ? prev : data
        );
        setSelectedTransportId(data.transportId); // Обновляем ID транспорта
    }, []);

    // Использование:
    // console.log(cartProducts);
    // console.log(calculateCartTotalAmount(cartProducts));
    const memoizedcartAmount = useMemo(() => calculateCartTotalAmount(cartProducts), [cartProducts]);   // это уже излишество, наверное...
    const formattedAmount = useMemo(() => formatPrice(cartAmount), [cartAmount]);                       // это уже излишество, наверное...
    const memoizedProducts = useMemo(() => cartProducts, [cartProducts]);

    // Создаем ref для хранения актуальных данных Покупателя
    const customerDataRef = useRef<TCartCustomer>(customerData);
    customerDataRef.current = customerData; // Всегда актуальное значение

    const deliveryAddressRef = useRef<string>(deliveryData.address);
    deliveryAddressRef.current = deliveryData.address;

    const deliveryDataRef = useRef<IDeliverySelectionData>(deliveryData);
    deliveryDataRef.current = deliveryData;    

    // При продолжении без регистрации: Модалка с формой данных гостя
    const handleContinueAsGuest = () => {
        closeModal();
        openModal(
            <GuestCustomerDataModalForm 
                initialDeliveryAddress={deliveryData.address}
                initialCustomerData={customerData  as IGuestCustomer}
                onSubmit={(data) => {       //  при сабмите формы гостя обновляем:
                    
                    // 3. Обновляем ref-ы (чтобы модалка получила актуальные данные)
                    customerDataRef.current = data;
                    deliveryAddressRef.current = data.deliveryAddress;
                    
                    // Обновляем стейты (асинхронно)
                    // 1. стейт данных пользователя:
                    setCustomerData(data);

                    // 2. Обновляем стейт доставки (если изменился адрес)
                    if (deliveryData.address !== data.deliveryAddress) {
                        setDeliveryData(prev => ({
                        ...prev,
                        address: data.deliveryAddress, // только адрес
                        }));
                    }

                    // 3. Теперь deliveryDataRef.current тоже актуален
                    deliveryDataRef.current = {
                        ...deliveryDataRef.current,
                        address: data.deliveryAddress,
                    };
                    
                    // 4. Открываем модалку подтверждения
                    openOrderConfirmationModal();   // Вызываем без параметров
                }}
                onCancel={() => handleCancelClick()}
            />
        )
    };

    // При оформлении заказа авторизованным физическим лицом: Модалка с формой данных авторизованного физического лица
    const handleContinueAsIndividual = () => {
        closeModal();
        openModal(
            <IndividualCustomerDataModalForm 
                initialDeliveryAddress={deliveryData.address}
                initialCustomerData={customerData as TCartIndividualCustomer}
                onSubmit={(data) => {       //  при сабмите формы физлица обновляем:
                    
                    // 3. Обновляем ref-ы (чтобы модалка получила актуальные данные)
                    customerDataRef.current = data;
                    deliveryAddressRef.current = data.deliveryAddress;
                    
                    // Обновляем стейты (асинхронно)
                    // 1. стейт данных пользователя:
                    setCustomerData(data);

                    // 2. Обновляем стейт доставки (если изменился адрес)
                    if (deliveryData.address !== data.deliveryAddress) {
                        setDeliveryData(prev => ({
                        ...prev,
                        address: data.deliveryAddress, // только адрес
                        }));
                    }

                    // 3. Теперь deliveryDataRef.current тоже актуален
                    deliveryDataRef.current = {
                        ...deliveryDataRef.current,
                        address: data.deliveryAddress,
                    };
                    
                    // 4. Открываем модалку подтверждения
                    openOrderConfirmationModal();   // Вызываем без параметров
                }}
                onCancel={() => handleCancelClick()}
            />
        )
    };

    // При оформлении заказа авторизованным юридическим лицом: Модалка с формой данных авторизованного юридического лица
    const handleContinueAsLegal = () => {
        closeModal();
        // console.log('Customer Data', customerData);
        // console.log('deliveryData.address', deliveryData.address);
        openModal(
            <LegalCustomerDataModalForm 
                initialDeliveryAddress={deliveryData.address}
                initialCustomerData={customerData as TCartLegalCustomer}
                onSubmit={(data) => {       //  при сабмите формы юрлица обновляем:
                    
                    // 3. Обновляем ref-ы (чтобы модалка получила актуальные данные)
                    customerDataRef.current = data;
                    deliveryAddressRef.current = data.deliveryAddress;
                    
                    // Обновляем стейты (асинхронно)
                    // 1. стейт данных пользователя:
                    setCustomerData(data);

                    // 2. Обновляем стейт доставки (если изменился адрес)
                    if (deliveryData.address !== data.deliveryAddress) {
                        setDeliveryData(prev => ({
                        ...prev,
                        address: data.deliveryAddress, // только адрес
                        }));
                    }

                    // 3. Теперь deliveryDataRef.current тоже актуален
                    deliveryDataRef.current = {
                        ...deliveryDataRef.current,
                        address: data.deliveryAddress,
                    };
                    
                    // 4. Открываем модалку подтверждения
                    openOrderConfirmationModal();   // Вызываем без параметров
                }}
                onCancel={() => handleCancelClick()}
            />
        )
    };

    const openOrderConfirmationModal = () => {
        
        openModal(
          <OrderConfirmation
            products={cartProducts}
            deliveryData={deliveryDataRef.current}
            currentDeliveryAddress={deliveryAddressRef.current}
            customerData={customerDataRef.current} // Берем из ref
            cartTotal={cartTotal}
            cartAmount={cartAmount}
            regularTotal={regularAmount}
            onReserve={() => handleOrderAction('reserve', customerData)}
            onPay={() => handleOrderAction('pay', customerData)}
            onBack={() => handleContinueAsGuest()} // Возврат к редактированию
            onCancel={() => handleCancelClick()}
          />
        );
    };
    
    // Обработчик кнопки "Оформить заказ"
    const handleCheckoutClick = () => {
        if (user) {                         // Авторизованный пользователь
            if (isIndividualUser(user)) { 
                handleContinueAsIndividual(); 
            } else if (isLegalUser(user)) {
                handleContinueAsLegal();
            }
        } else {
          // Гость
          openModal(
            <AuthWarningModal 
              onContinueAsGuest={handleContinueAsGuest}
            />
          );
        }
    };    

    // Обработчик кнопки "Отмена"
    const handleCancelClick = () => {
        closeModal();
        setDeliveryData(initialDeliveryData);   // нужно удалить выбранный способ доставки, чтобы пропали кнопки Оформить заказ
        setSelectedTransportId(0);              // Сбрасываем явно
    };        

    const { createOrder, isLoading: isOrderCreating } = useCreateOrder();

    const submittingRef = useRef<boolean>(false);
    
    const handleOrderAction = async (
        actionType: 'reserve' | 'pay',
        customerData: TCartCustomer
    ) => {
        
        if (submittingRef.current) return; // Защита от повторного нажатия
        submittingRef.current = true;

        try {
            const orderData = {
                products: cartProducts.map(p => ({
                    id: p.id,
                    quantity: p.quantity ?? 0,
                    price: p.price_actual ?? 0,
                    price_regular: p.price_regular ?? 0,
                    price_with_rank_discount: p.price_with_rank_discount ?? 0,      // имеет значение только у авторизованных пользователей, если применена скидка согласно рангу
                    price_with_action_discount: p.price_with_action_discount ?? 0,  // имеет значение только у авторизованных пользователей, если применена скидка согласно рангу
                    percent_of_rank_discount: p.percent_of_rank_discount ?? 0,      // имеет значение только у авторизованных пользователей: размер скидки в процентах (int) согласно рангу пользователя
                    summa_of_action_discount: p.summa_of_action_discount ?? 0,      // имеет значение только у авторизованных пользователей, если применена скидка на товар (не скидка по рангу)
                    price_special: p.price_special ?? 0,                            // price_special есть только у авторизованных пользователей и равна = price: p.price_actual для гостей и всех, всех, всех
                })),
                customer: {
                    ...customerDataRef.current,
                },
                delivery: deliveryDataRef.current,
                products_amount: cartAmount,
                total: cartAmount + deliveryData.price
            };

            console.log('orderData', orderData);
    
            await createOrder(orderData, {
                isReserve: actionType === 'reserve',
                paymentMethod: actionType === 'pay' ? 'online' : 'bank_transfer',

                onSuccess: (res) => {
                
                    // 1. Закрываем модалку
                    closeModal();
                    toast.success(`Заказ успешно ${actionType === 'pay' ? 'оплачен' : 'оформлен'}`);
                        // Не сбрасываем isSubmitting тут - форма уже закрыта

                    // 2. Выбираем данные нового заказа для обновления состояния:
                    const newOrder = {

                    };    

                    // 3. Редирект через 1.5 || 2 секунды + Очистка корзины...
                    setTimeout(() => {
                        router.visit(res?.redirect || '/'); // Редирект через Inertia
                        addOrder(res.orderId);
                        clearCart();                        // Обновляем стейт. Очищаем корзину
                    }, 2000);
                }
            });
        } catch (error) {
            toast.error(`Ошибка при ${actionType === 'pay' ? 'оплате' : 'резервировании'}`);
        } finally {
            submittingRef.current = false;
        }
    };

    // console.log('cartAmount', cartAmount);

    return (    
        <MainLayout>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords} />
                <meta name="robots" content={robots} />
            </Helmet>

            <NavBarBreadCrumb />

            <div className="basket-wrapper">
                <h1 className="basketTitle padding-top24px">Корзина покупок ({ cartTotal }) .</h1>
                
                {error && (
                    <div className="error-message">
                        Ошибка: {error}. Попробуйте обновить страницу.
                    </div>
                )}

                {isLoading ? (
                    <div></div>
                ) : cartTotal > 0 ? (
                    <>
                        <div id="basketproductsblock">
                            {memoizedProducts.map(product => (
                                <div key={product.id} className="basket-row__product">
                                    <div className="basket-row__block">
                                        <div className="basket-row__new-block-line"></div>
                                        <Link href={`/products/card/${ product.prod_url_semantic }`}><img src={`/storage/${ product.img_link }`} alt={ product.title } title="Кликните, чтобы перейти в карточку товара" /></Link> 
                                    </div>
                                    <div className="basket-row__block">
                                        <h3>{ product.title }</h3>
                                    </div>
                                    <div className="basket-row__block basket-block__price" data-removefrombasket={ product.id } data-basketpriceblockisproductallowed={ product.on_sale }>
                                        <div className="basket-res__total">
                                            <p>сегодня в продаже: <span className="basket-quantity__span-tag" data-soldprodid={ product.id }>{ product.on_sale }</span> шт.</p>
                                            <div className="basket-delete__product-div">
                                                <img className="basket-img__remove cursor-pointer"  onClick={() => handleRemoveFromCartClick(product.id)} data-removefrombasket={ product.id } src="/storage/icons/icon-trash.png" alt="icon-trash" title="Удалить товар из корзины" />
                                                <img className="basket-img__addtofavorites cursor-pointer"  onClick={() => handleFavoriteClick(product.id)} data-addtofavoritesfrombasketid={ product.id } src="/storage/icons/favorite.png" alt="icon-favorites" title="Добавить выбранный товар в Избранное" />
                                            </div> 
                                        </div>
                                        <p>по лучшей цене: </p>
                                        <div className="basket-row__priceValue d-flex">
                                        {product.price_special && product.price_regular && product.price_actual ? (
                                            <>
                                                <div className="basket-favorites__priceCurrentSale nobr">{formatPrice(product.price_special)} <sup>&#8381;</sup></div>
                                                <div className="cardProduct-priceBeforSale nobr">{formatPrice(product.price_regular)} <sup>&#8381;</sup></div>
                                                <div className="basket-favorites__priceDiscountInPercentage nobr">- {Math.ceil(100 - (product.price_special / product.price_regular) * 100)}%</div>
                                            </>
                                        ) : product.price_regular && product.price_actual && product.price_actual < product.price_regular ? (
                                            <>
                                                <div className="basket-favorites__priceCurrentSale nobr">{formatPrice(product.price_actual)} <sup>&#8381;</sup></div>
                                                <div className="cardProduct-priceBeforSale nobr">{formatPrice(product.price_regular)} <sup>&#8381;</sup></div>
                                                <div className="basket-favorites__priceDiscountInPercentage nobr">- {Math.ceil(100 - (product.price_actual / product.price_regular) * 100)}%</div>
                                            </>
                                        ) : product.price_regular && (
                                                <div className="basket-favorites__priceCurrent nobr">{formatPrice(product.price_regular)} <sup>&#8381;</sup></div>
                                        )}            
                                    </div>

                                    { product.date_end && ( 
                                        <div className="cardProduct-priceValidPeriod">акция действует до: { product.date_end }</div>
                                    )}

                                    { user && product.price_with_rank_discount && product.price_regular && (
                                    <>    
                                        <p className="margin-tb12px">
                                        { user.client_type_id === 1
                                            ? "но для меня цена лучше: "
                                            : "но для нас цена лучше: "}
                                            
                                        </p>
                                        
                                        <div className="d-flex padding-left16px">
                                            <div className="basket-favorites__priceCurrentSale">{formatPrice(product.price_with_rank_discount)}</div>
                                            <div className="cardProduct-priceBeforSale">{formatPrice(product.price_regular)} <sup>&#8381;</sup></div>
                                            <div className="basket-favorites__priceDiscountInPercentage">- { product.percent_of_rank_discount }&#37;</div>
                                        </div>
                                    </>
                                    )} 
                                        <div className="basket-row__product">
                                            <p className="basket-Pelem__text-inbasket">В корзине сейчас:</p>
                                            { product.percent_of_rank_discount && (
                                            <div className="d-flex">
                                                <p className="padding-left16px margin-bottom8px">по спеццене со скидкой -  </p>
                                                <p className="margin-bottom8px">{ product.percent_of_rank_discount }&#37;</p>
                                            </div>
                                            )}

                                            <div className="basket-row__priceCount">
                                                <QuantityControl
                                                    prodId={product.id}
                                                    prodTitle={ product.title }
                                                    value={product.quantity ?? 0}
                                                    on_sale={product.on_sale ?? 0}
                                                    updateCart={ updateCart }
                                                    addToFavorites={ addToFavorites }
                                                    removeFromCart={ removeFromCart }
                                                />
                                                <a className="basket-row__priceValue">&nbsp;&nbsp;шт.,&nbsp;&nbsp;</a>
                                                <a className="basket-row__priceValue">&nbsp;&nbsp;на сумму:&nbsp;&nbsp;</a>
                                                <PriceBlock 
                                                    key={`price-${product.id}`}
                                                    product={{ 
                                                        ...product,
                                                        quantity: product.quantity ?? 0,
                                                        price_regular: product.price_regular ?? 0,
                                                        price_actual: product.price_actual ?? 0
                                                    }}
                                                />
                                                
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {regularAmount > cartAmount && (
                            <DiscountSummary 
                                regularTotal={regularAmount}
                                discountedTotal={cartAmount}
                            />
                        )}
                        
                        {/* Рисуем блок расчёта стоимости корзины без учёта стоимости доставки */}
                        <div className="basket-res__no-delivery">
                            <ProductsQuantityInCart cartTotal={cartTotal} />
                            <h3 className="basketPriceNoDeliveryBlockH3elemTotalAmount">на сумму: {formatPrice(cartAmount)} <sup>₽</sup></h3>
                        </div>
                        <DeliverySelector
                            transports={transports}
                            selectedTransportId={selectedTransportId}
                            onTransportChange={(id) => setSelectedTransportId(id)}  // Вот так передаём функцию
                            onSelect={(data) => {handleTransportSelect(data);}}     // Здесь сохраняем в состояние корзины
                        />

                        {/* заводим блок расчёта итоговой суммы к оплате: */}
                        {deliveryData.price >= 0 && deliveryData.transportId > 0 && (
                        <>
                        <section>
                            {cartAmount < regularAmount ? (
                                <>
                                    {(!(deliveryData.price === 0 && deliveryData.transportId === 3)) && (
                                        <>
                                            <h3 className=''>Итого к оплате за заказ: </h3>
                                            <div className='basket-res__total'>
                                                <h3 className='basketTotalAmountBlockH3elem2 line-through'>
                                                {formatPrice(deliveryData.price + regularAmount)}
                                                </h3>
                                                <h3 className="color-red">{formatPrice(deliveryData.price + cartAmount)}&nbsp;<sup>&#8381;</sup></h3>
                                            </div>
                                        </>
                                    )
                                }</>
                            ) : (
                                <>
                                    {(!(deliveryData.price === 0 && deliveryData.transportId === 3)) && (
                                        <div className='basket-res__total'>
                                            <h3 className=''>Итого к оплате за заказ: </h3>
                                            <h3>{formatPrice(deliveryData.price + regularAmount)}&nbsp;<sup>&#8381;</sup></h3>
                                        </div>
                                    )}
                                </>
                            )}
                        </section>
                        {(!(deliveryData.price === 0 && deliveryData.transportId === 3)) && (    
                        <section> {/* заводим блок кнопок для оплаты заказа или получения счёта: */}
                            <div className='basket-res__total'>
                                <motion.button onClick={returnBack} className="basket-button" whileHover={{ scale: 1.1 }}  
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {isLegalUser(user) ? 'Назад' : 'Ещё подумаю'} 
                                </motion.button>
                                <motion.button 
                                    className="basket-button" 
                                    whileHover={{ scale: 1.1 }}  
                                    whileTap={{ scale: 0.9 }}
                                    animate={{
                                        scale: [1, 1.03, 1], // Пульсация
                                        transition: { 
                                        repeat: Infinity, 
                                        repeatDelay: 2,
                                        duration: 1.1 
                                        }
                                    }}
                                    onClick={handleCheckoutClick}
                                >
                                    Оформить заказ
                                </motion.button>
                            </div>
                        </section>
                        )}
                        </>
                        )}
                    </>

                ) : (
                    <div className="empty-cart">
                        Корзина пока пустая
                    </div>
                )}
            </div>

        </MainLayout>
    );      
};

export default CartPage;