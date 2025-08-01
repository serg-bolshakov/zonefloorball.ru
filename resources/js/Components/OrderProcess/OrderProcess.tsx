// components/OrderProcess/OrderProcess.tsx
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
    import PriceBlockOrderProcessing from "./PriceBlockOrderProcessing";
    import { QuantityOrderProcessingControl } from "./QuantityOrderProcessingControl";
    import DeliverySelector from "@/Components/Cart/DeliverySelector";
    import useModal from "@/Hooks/useModal";
    import AuthWarningModal from '@/Components/OrderCheckoutModals/AuthWarningModal'; 
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
    import { dateRu, formatServerDate } from "@/Utils/dateFormatter";
    import CheckoutOrderProcessButton from "./CheckoutOrderProcessButton";
    import Toast from "@/Components/Cart/Toast";
    import { TOrderAction } from "@/Types/orders";

export type TMode = 'cart' | 'preorder';

interface IOrderProcessProps {  
    title: string;
    robots: string;
    description: string;
    keywords: string;
    transports: ITransport[];
    mode: TMode;
}

export const OrderProcess = ({ mode, title, robots, description, keywords, transports }: IOrderProcessProps) => {
  // Всё, что можно обобщить

    // Функция для склонения слова "товар"
    const getProductWord = (quantity: number): string => {
    const lastDigit = quantity % 10;
    const lastTwoDigits = quantity % 100;

    if (quantity === 0) return 'товаров';
    if (lastDigit === 1 && lastTwoDigits !== 11) return 'товар';
    if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) return 'товара';
    return 'товаров';
    };

    // Форматирование числа (добавляем пробелы между разрядами)
    const formatQuantity = (quantity: number): string => {return new Intl.NumberFormat('ru-RU').format(quantity)};

    const { cart, cartTotal, updateCart, addToFavorites, removeFromCart, clearCart, addOrder, preorder, preorderTotal, updatePreorder, removeFromPreorder, clearPreorder, addToPreorder} = useUserDataContext();
    const { openModal, closeModal } = useModal();
    const { user } = useAppContext(); 

    const [cartProducts, setCartProducts] = useState<IProduct[]>([]);
    const [preorderProducts, setPreorderProducts] = useState<IProduct[]>([]);
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [cartAmount, setCartAmount]         = useState<number>(0);
    const [preorderAmount, setPreorderAmount] = useState<number>(0);
    const [regularAmount, setRegularAmount]   = useState<number>(0); // Сумма без скидок
    
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
    
    // const [isAgreed, setIsAgreed] = useState(!!user);
    const [isAgreed, setIsAgreed] = useState(!!user && !user.needReconfirm);
    const [isNeedReconfirm, setIsNeedReconfirm] = useState(user?.needReconfirm || false);
    
    const getAgreementLabel = () => {
        if (user) {
            return isNeedReconfirm 
            ? 'Требуется подтверждение новых условий'
            : `Согласие подтверждено ${formatServerDate(user.privacy_policy_agreed_at)}`;
        }
        return 'Прочитано. Понятно. Согласие подверждаю.';
    };

    const renderStatusMessage = () => {
        if (!isAgreed) {
            return (
            <div className="registration-error margin-tb8px text-align-center">
                {user
                ? 'Для продолжения необходимо подтвердить согласие'
                : 'Необходимо ознакомиться и подтвердить согласие'
                }
            </div>
            );
        }

        if (isNeedReconfirm && isAgreed) {
            return (
            <div className="registration-success margin-tb8px text-align-center">
                Новые условия успешно подтверждены!
            </div>
            );
        }

        return null;
    };

    const handleAgreementChange = () => {
        const newValue = !isAgreed;
    
        if (newValue && isNeedReconfirm) {
            // При подтверждении новых условий
            // updateUserAgreement(); // Отправка на сервер
            setIsNeedReconfirm(false);
        }
    
        setIsAgreed(newValue);
    };

    // Выбираем данные в зависимости от режима
        const currentItems = mode === 'cart' ? cart           : preorder;
        const currentTotal = mode === 'cart' ? cartTotal      : preorderTotal;
        const currentAmount= mode === 'cart' ? cartAmount     : preorderAmount;
        const updateItems  = mode === 'cart' ? updateCart     : updatePreorder;
        const removeItem   = mode === 'cart' ? removeFromCart : removeFromPreorder;
        const clearAll     = mode === 'cart' ? clearCart      : clearPreorder;
        const tableLink    = mode === 'cart' ? clearCart      : clearPreorder;

    // Выносим тексты в константы для удобства
        const MODE_TEXTS = {
            cart: {
                removeTitle: "Удалить из Корзины?",
                successRemove: "Товар успешно удалён из Корзины",
                errorRemove: "Не удалось удалить из Корзины",
                remainText: "Товар оставлен в Корзине",
                availability: "сегодня в продаже"
            },
            preorder: {
                removeTitle: "Удалить из Предзаказа?",
                successRemove: "Товар успешно удалён из Предзаказа",
                errorRemove: "Не удалось удалить из Предзаказа",
                remainText: "Товар оставлен в Предзаказе",
                availability: "доступно в предзаказ"
            }
        };

    const calculateTotalAmount = (products: IProduct[], mode: TMode): number => {
        
        return products.reduce((total, product) => {
            const quantity = product.quantity ?? 0;
            if (quantity <= 0) return total;

            const price = mode === 'preorder' 
            ? getPreorderPrice(product)
            : getCartPrice(product);

            return total + (price * quantity);
        }, 0);
    };
    
    // Вынесем логику определения цены в отдельные функции
    const getPreorderPrice = (product: IProduct): number => {
        if (product.price_preorder && product.price_with_rank_discount && product.price_preorder < product.price_with_rank_discount) {
            return product.price_preorder;
        } 
        return (product.price_regular ?? 0) * 0.9; // Дефолтная скидка 10%
    };

    const getCartPrice = (product: IProduct): number => {
        const prices = [
            product.price_special,
            product.price_with_rank_discount,
            product.price_actual,
            product.price_regular
        ].filter((p): p is number => p !== undefined);

        return prices.length > 0 ? Math.min(...prices) : 0;
    };

    const handleTransportSelect = useCallback((data: IDeliverySelectionData) => {
        // setDeliveryData(data);   - можно и так... но так лучше:
        setDeliveryData(prev => 
            JSON.stringify(prev) === JSON.stringify(data) ? prev : data
        );
        setSelectedTransportId(data.transportId); // Обновляем ID транспорта
    }, []);

    useEffect(() => {
        const controller = new AbortController; // AbortController - встроенный браузерный API для отмены операций (запросов, таймеров и т.д.)
        // создаёт объект, который позволяет отменить асинхронные операции (например, HTTP-запросы).
        const signal = controller.signal;       // это объект AbortSignal, который передаётся в axios (или fetch).

        if(preorderTotal === 0) {
            setPreorderProducts([]);
            return;
        }

        const loadPreorder = async () => {
            if(!preorderTotal) {
                setPreorderProducts([]);
                return;
            }
            setIsLoading(true);
            setError(null);

            try {
                // console.log(preorder);
                const response = await axios.post(API_ENDPOINTS.PREORDER, {
                    products: preorder, // Отправляем текущий предзаказ
                }, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json'
                    },
                    signal, // Передаём signal в конфиг axios
                });

                // Проверяем, не был ли запрос отменён
                if (!signal.aborted) {
                    setPreorderProducts(response.data.products?.data || []);
                }
                // console.log('OrderProcess.tsx, useEffect, response', response.data);
            } catch (error) {
                // Игнорируем ошибку, если запрос был отменён
                if (!axios.isCancel(error)) {
                    setError(getErrorMessage(error));
                    toast.error('Ошибка загрузки товаров предзаказа:' + getErrorMessage(error), toastConfig);
                }
            } finally {
                if (!signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        loadPreorder();

        // Функция очистки: отменяем запрос при размонтировании или изменении cart
        return () => {
            controller.abort();
        };

    }, [preorder]);

    useEffect(() => {
        if (preorderProducts.length > 0) {

          const regular = preorderProducts.reduce((sum, p) => sum + (p.price_regular ?? 0) * (p.quantity ?? 0), 0);
          const discounted = calculateTotalAmount(preorderProducts, mode);
          console.log('OrderProcess.tsx, useEffect, preorderProducts', preorderProducts);
          console.log('OrderProcess.tsx, useEffect, discounted', discounted);
          setRegularAmount(regular);
          setPreorderAmount(discounted);
        }
    }, [preorderProducts]);

    useEffect(() => {
        const newCustomerData = getInitialCustomerData(user);
        setIsAgreed(!!user && !user.needReconfirm);
        setIsNeedReconfirm(user?.needReconfirm || false);
        setCustomerData(newCustomerData);
    }, [user]);

    // Создаем ref для хранения актуальных данных Покупателя
    const customerDataRef = useRef<TCartCustomer>(customerData);
    customerDataRef.current = customerData; // Всегда актуальное значение

    const deliveryAddressRef = useRef<string>(deliveryData.address);
    deliveryAddressRef.current = deliveryData.address;

    const deliveryDataRef = useRef<IDeliverySelectionData>(deliveryData);
    deliveryDataRef.current = deliveryData;    

    // Удаление товарной позиции из Корзины / Предзаказа
    const handleRemoveClick = useCallback(async (productId: number) => {
        const modeTexts = MODE_TEXTS[mode];

        openModal(null, 'confirm', {
            title: modeTexts.removeTitle,
            onConfirm: async () => {
                try {
                    const result = await removeItem(productId);    
                    toast[result.error ? 'error' : 'success'](
                        result.error || modeTexts.successRemove, 
                        toastConfig
                    );
                } catch(error) {
                    toast.error(modeTexts.errorRemove, toastConfig);
                }
            },
            onCancel: () => {
                toast.success(modeTexts.remainText, toastConfig);
            }
        });
    }, [mode, removeItem]);

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
            onPreorder={() => handleOrderAction('preorder', customerData)}
            onBack={() => handleContinueAsGuest()} // Возврат к редактированию
            onCancel={() => handleCancelClick()}
          />
        );
    };
    

    // Обработчик кнопки "Оформить заказ/Предзаказ"
    const handleCheckoutClick = useCallback(() => {
        if (mode === 'cart') {
            // Логика для обычного заказа
            console.log('Оформление заказа');
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
        } else {
            // Логика для предзаказа
            if (user) {                         // Авторизованный пользователь
                if (isIndividualUser(user)) { 
                    handleContinueAsIndividual(); 
                } else if (isLegalUser(user)) {
                    handleContinueAsLegal();
                }
            } else {
                // Гость - только авторизованные пользователи могут оформить предзаказ...
                handleCancelClick();
            }
        }
    }, [mode]); // Зависимость от mode    

    // Обработчик кнопки "Отмена"
    const handleCancelClick = () => {
        closeModal();
        setDeliveryData(initialDeliveryData);   // нужно удалить выбранный способ доставки, чтобы пропали кнопки Оформить заказ
        setSelectedTransportId(0);              // Сбрасываем явно
    };      

    const { createOrder, isLoading: isOrderCreating } = useCreateOrder();
    const submittingRef = useRef<boolean>(false);

    const handleOrderAction = async (
        actionType: TOrderAction,
        customerData: TCartCustomer
    ) => {
        
        if (submittingRef.current) return; // Защита от повторного нажатия
        submittingRef.current = true;
        
        try {
            const orderData = {
                products: cartProducts.map(p => ({
                    id: p.id,
                    name: p.title,
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
                total: cartAmount + deliveryData.price,
                legal_agreement: isAgreed
            };

            await createOrder(orderData, {
                action: actionType,                     // 'pay' | 'reserve' | 'preorder'
                paymentMethod: customerData.type === 'legal' ? 'bank_transfer' : 'online',

                onSuccess: (res) => {
                
                    // 1. Закрываем модалку
                    closeModal();
                    toast.success(res?.message || `Заказ успешно ${actionType === 'pay' ? 'оплачен' : 'оформлен'}`);
                        // Не сбрасываем isSubmitting тут - форма уже закрыта

                    // 3. Редирект через 1.5 || 2 секунды + Очистка корзины...
                    setTimeout(() => {
                        // router.visit(res?.redirect || '/'); // Редирект через Inertia
                        addOrder(res.orderId);
                        clearCart();                        // Обновляем стейт. Очищаем корзину
                        if(res.redirect) {
                            // Для Robokassa и внешних сервисов
                            window.location.href = res.redirect; 
                        } else {
                            router.visit('/'); // Внутренний переход
                        }
                    }, 2000);
                }
            });
        } catch (error) {
            toast.error(`Ошибка при ${actionType === 'pay' ? 'оплате' : 'резервировании'}`);
        } finally {
            submittingRef.current = false;
        }
    };

    const memoizedProducts = useMemo(() => {
        const products = mode === 'cart' ? cartProducts : preorderProducts;
        return products.filter(p => p != null);                                 // Фильтрация null/undefined
    }, [mode, cartProducts, preorderProducts]);                                 // При изменении mode произойдет пересчет значения.

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
            <h1 className="basketTitle padding-top24px">{mode === 'cart' ? `Корзина (${ cartTotal }) .` : `Предзаказ (${ preorderTotal }) .`}</h1>
            
            {error && (
                <div className="error-message">
                    Ошибка: {error}. Попробуйте обновить страницу.
                </div>
            )}

            {isLoading ? (
                    <div></div>
                ) : currentTotal > 0 ? (
                    <>
                        {/* Рисуем блок расчёта стоимости предзаказа без учёта стоимости доставки */}
                        <div className="basket-res__no-delivery">
                            <h3>Всего {/* в {mode === 'cart' ? 'корзине' : 'предзаказе'} */}: <strong>{formatQuantity(currentTotal)}</strong> {getProductWord(currentTotal)},</h3>
                            <h3 className="basketPriceNoDeliveryBlockH3elemTotalAmount">на сумму: {formatPrice(mode === 'cart' ? cartAmount : preorderAmount)} <sup>₽</sup></h3>
                        </div>
                        
                        {deliveryData.transportId == 0 && (
                            <>
                                <div className="color-green h-28px l-h-24px">Для начала оформления {mode === 'cart' ? 'заказа' : 'предзаказа'} необходимо выбрать способ доставки/получения...</div>
                                <div className="max-w-318px margin-bottom8px">
                                    <Link href="/profile/products-table?tableMode=preorder"><button className="payment-button" data-color="grey">←&nbsp;&nbsp;&nbsp;перейти в режим таблицы</button></Link>
                                </div>
                            </>
                        )}

                        <DeliverySelector
                            transports={transports}
                            selectedTransportId={selectedTransportId}
                            onTransportChange={(id) => setSelectedTransportId(id)}  // Вот так передаём функцию
                            onSelect={(data) => {handleTransportSelect(data);}}     // Здесь сохраняем в состояние предзаказа
                        />

                        {/* заводим блок расчёта итоговой суммы к оплате: */}
                        {deliveryData.price >= 0 && deliveryData.transportId > 0 && (
                            <>
                                <section>
                                {currentAmount < regularAmount ? (
                                    <>
                                        {(!(deliveryData.price === 0 && deliveryData.transportId === 3)) && (
                                            <>
                                                <h3 className=''>Итого к оплате за заказ: </h3>
                                                <div className='basket-res__total'>
                                                    <h3 className='basketTotalAmountBlockH3elem2 line-through'>
                                                    {formatPrice(deliveryData.price + regularAmount)}
                                                    </h3>
                                                    <h3 className="color-red">{formatPrice(deliveryData.price + currentAmount)}&nbsp;<sup>&#8381;</sup></h3>
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

                                <div className="max-w-320px fs12px">
                                    {(user && isNeedReconfirm) && (
                                        <Toast 
                                            type="warning" 
                                            message="Обновились условия оферты. Пожалуйста, подтвердите согласие."
                                        />
                                    )}

                                    {/* Сообщения об ошибках/предупреждениях */}
                                    {renderStatusMessage()}   
                                    
                                    {/* Заголовок с ссылками */}
                                    <div className="text-align-center margin-bottom8px">
                                        <a className='a-text-black' href="/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Политика конфиденциальности
                                        </a> и <a className='a-text-black' href="/legal/offer" target="_blank" rel="noopener noreferrer">оферта</a>.
                                    </div>

                                    {/* Чекбокс и статус согласия */}
                                    <input 
                                        type="checkbox" hidden id="legal_agreement" name="legal_agreement" 
                                        checked={isAgreed}
                                        onChange={handleAgreementChange}
                                    />
                                    
                                    <label htmlFor="legal_agreement" className={`${isAgreed ? 'color-green' : ''}`}>
                                        {getAgreementLabel()}
                                    </label>
                                </div>

                                {(!(deliveryData.price === 0 && deliveryData.transportId === 3)) && (    
                                    <section> {/* заводим блок кнопок для оплаты заказа или получения счёта: */}
                                        <div className='basket-res__total'>
                                            <motion.button onClick={returnBack} className="basket-button" whileHover={{ scale: 1.1 }}  
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                {isLegalUser(user) ? 'Назад' : 'Ещё подумаю'} 
                                            </motion.button>
                                            
                                            {/* Кнопка "оформить заказ/Предзаказ" */}
                                            <CheckoutOrderProcessButton 
                                                disabled={!isAgreed} 
                                                onClick={handleCheckoutClick}
                                                mode={mode}
                                                isPulsing={isAgreed}
                                            />

                                        </div>
                                    </section>
                                )}  

                            </>
                        )}

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
                                    <div className="basket-row__block basket-block__price" data-removefrombasket={ product.id } data-basketpriceblockisproductallowed={ mode === 'cart' ? product.on_sale : product.on_preorder }>
                                        <div className="basket-res__total">
                                            <p>
                                                {MODE_TEXTS[mode].availability}:&nbsp; 
                                                <span className="basket-quantity__span-tag">
                                                    {mode === 'cart' ? product.on_sale : product.on_preorder} шт.
                                                </span>
                                            </p>
                                            <div className="basket-delete__product-div">
                                                <img className="basket-img__remove cursor-pointer"  onClick={() => handleRemoveClick(product.id)} data-removefrombasket={ product.id } src="/storage/icons/icon-trash.png" alt="icon-trash" title={ mode === 'cart' ? 'Удалить товар из корзины' : 'Удалить товар из предзаказа' } />
                                                <img className="basket-img__addtofavorites cursor-pointer"  onClick={() => handleFavoriteClick(product.id)} data-addtofavoritesfrombasketid={ product.id } src="/storage/icons/favorite.png" alt="icon-favorites" title="Добавить выбранный товар в Избранное" />
                                            </div> 
                                        </div>
                                        <p>по лучшей цене: </p>
                                            { mode === 'cart' && (
                                                <>
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
                                                </>
                                            )}

                                            { mode === 'preorder' && (
                                                <div className="basket-row__priceValue d-flex margin-top12px">
                                                    <div className="basket-favorites__priceCurrentSale nobr">{formatPrice(getPreorderPrice(product))} <sup>&#8381;</sup></div>
                                                    <div className="cardProduct-priceBeforSale nobr">{ formatPrice(product.price_regular ?? Infinity )} <sup>&#8381;</sup></div>
                                                    <div className="basket-favorites__priceDiscountInPercentage nobr">- {Math.ceil(100 - (getPreorderPrice(product) / (product.price_regular ?? getPreorderPrice(product)) ) * 100)}%</div>
                                                </div>
                                            )}

                                        <div className="basket-row__product">
                                            <p className="basket-Pelem__text-inbasket">В { mode === 'cart' ? 'корзине' : 'предзаказе' } сейчас:</p>
                                            { product.percent_of_rank_discount && mode === 'cart' && (
                                            <div className="d-flex">
                                                <p className="padding-left16px margin-bottom8px">по спеццене со скидкой -  </p>
                                                <p className="margin-bottom8px">{ product.percent_of_rank_discount }&#37;</p>
                                            </div>
                                            )}

                                            <div className="basket-row__priceCount">
                                                <QuantityOrderProcessingControl
                                                    key={`${mode}-${product.id}`} // Важно для сброса состояния при смене режима
                                                    mode={mode}
                                                    prodId={product.id}
                                                    prodTitle={ product.title }
                                                    value={product.quantity ?? 0}
                                                    on_sale={product.on_sale ?? 0}
                                                    on_preorder={product.on_preorder ?? 0}
                                                    updateItems={mode === 'cart' ? updateCart : updatePreorder}
                                                    removeItem={mode === 'cart' ? removeFromCart : removeFromPreorder}
                                                    addToFavorites={ addToFavorites }
                                                />
                                                <a className="basket-row__priceValue">&nbsp;&nbsp;шт.,&nbsp;&nbsp;</a>
                                                <a className="basket-row__priceValue">&nbsp;&nbsp;на сумму:&nbsp;&nbsp;</a>
                                                <PriceBlockOrderProcessing 
                                                    key={`price-${mode}-${product.id}`}
                                                    mode={mode}
                                                    product={{ 
                                                        ...product,
                                                        // quantity: product.quantity,
                                                        // price_regular: product.price_regular,
                                                        // price_actual: product.price_actual,
                                                        // price_preorder: product.price_preorder
                                                    }}
                                                />
                                                
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                    ) : (
                    <div className="orders-container">
                        <div className="payment-buttons-grid margin-tb12px">
                            <Link 
                                href="/products/catalog" 
                                as="button"
                                className="payment-button"
                                method="get"
                                replace // Важно! Не добавляет новую запись в историю
                            >
                                ← в главное меню
                            </Link>
        
                            <Link href="/profile/products-table?tableMode=preorder"><button className="payment-button">Создать предзаказ</button></Link>
                        </div>
                    </div>
                )
            }
        </div>

    </MainLayout>
  );
};