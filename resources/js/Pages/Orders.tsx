// resources/js/Pages/Orders.tsx - компонент списка заказов
import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from "@/Layouts/MainLayout";
import { Helmet } from "react-helmet";
import NavBarBreadCrumb from "@/Components/NavBarBreadCrumb";
import { dateRu } from "@/Utils/dateFormatter";
import { formatPrice } from "@/Utils/priceFormatter";
import { CompactPagination } from "@/Components/CompactPagination";
import { usePage, router } from '@inertiajs/react';
import { Link } from "@inertiajs/react";


interface IOrdersResponse {
    data: IOrder[]; // Массив заказов
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
        links: [{ url: string | null; label: string; active: boolean }]; 
    };
}

interface IOrdersProps {  
    title: string;
    robots: string;
    description: string;
    keywords: string;
    orders: IOrdersResponse;        // Добавляем заказы - orders обязателен — это не просто массив, а объект с пагинацией...
    sortBy?: string;
    sortOrder?: string;
}

const defaultOrders: IOrdersResponse = {
    data: [],
    links: {
        first: null,
        last: null,
        prev: null,
        next: null,
    },
    meta: {
        current_page: 1,
        from: 1,
        last_page: 1,
        path: '',
        per_page: 10,
        to: 1,
        total: 0,
        links: [{
            url: null, 
            label: '', 
            active: false
        }],
    },
};

interface IOrderDelivery {
    type: string;
    address: string;
    tracking_number?: string;
    estimated_date?: string;
    cost: number;
}

interface IOrderPayment {
    method: {
        code: string;
        label: string;
    };
    status: {
        code: string;
        label: string;
    };
    invoice_url?: string;
}

export interface IOrder {
    id: number;
    number: string;
    order_date: string;
    hash: string;
    status: string;
    is_preorder: boolean;
    cost: number;
    delivery: IOrderDelivery;
    payment: IOrderPayment;
    access_expires_at: string | null;
    payment_status: string;
}

const Orders: React.FC<IOrdersProps> = ({
    title, 
    robots, 
    description, 
    keywords, 
    orders = defaultOrders,
    sortBy = 'order_date',
    sortOrder = 'desc',

}) => {

    // При монтировании компонента
    useEffect(() => {
        if (orders) {
            //
        }
    }, [orders, orders.data]);

    // Сохраняем позицию прокрутки перед обновлением
    useEffect(() => {
        const handleBeforeUnload = () => {
            sessionStorage.setItem('scrollPos', window.scrollY.toString());
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // Восстанавливаем позицию прокрутки после загрузки
    useEffect(() => {
        const savedScrollPos = sessionStorage.getItem('scrollPos');
        if (savedScrollPos) {
            window.scrollTo(0, parseInt(savedScrollPos));
        }
    }, []);

    const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = {
            page: orders.meta.current_page.toString(),
            sortBy,
            sortOrder: e.target.value,
            perPage: orders.meta.per_page
        };

        router.get('/profile/orders', params, {
            preserveScroll: true
        });
    };

    const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = {
            perPage: e.target.value,
            sortBy,       // сохраняем текущую сортировку
            sortOrder,    // сохраняем направление сортировки
            page: 1       // обычно сбрасываем на первую страницу
        };

        router.get('/profile/orders', params, {
            preserveScroll: true
        });
    };

    // ДЕЛАЕМ ПАГИНАЦИЮ внизу таблицы:
    // Получаем текущие query-параметры из URL
    const { url } = usePage();
    // console.log('url:', url); // Отладочное сообщение: url: /products/sticks?page=9&sortBy=actual_price&sortOrder=desc

    // Создаем абсолютный URL на основе текущего местоположения
    const absoluteUrl = new URL(window.location.origin + url);
    // console.log('absoluteUrl:', absoluteUrl); // Отладочное сообщение: absoluteUrl: объект: URL {origin: 'http://127.0.0.1:8000', protocol: 'http:', username: '', password: '', host: '127.0.0.1:8000', …}

    const searchParams = new URLSearchParams(absoluteUrl.search);
    // console.log('Object.fromEntries(searchParams.entries()):', Object.fromEntries(searchParams.entries())); // Отладочное сообщение: Object.fromEntries(searchParams.entries()): {hook[0]: 'neutral'}

    // Функция для формирования URL с учетом параметров сортировки
    const getPageUrl = (page: number | string) => {
        const params = new URLSearchParams({
            ...Object.fromEntries(searchParams.entries()), // Передаем все существующие параметры 
            page: page.toString(),
        });

        return `?${params.toString()}`;
    };

    console.log('Orders', orders);

    return (
        <MainLayout>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords} />
                <meta name="robots" content={robots} />
            </Helmet>

            <div className="orders-container">
                <h1 className='margin-bottom12px'>История заказов</h1>
                <div className="payment-buttons-grid margin-tb12px">
                    
                    <Link 
                        href="/products/catalog" 
                        as="button"
                        className="payment-button" data-color="green"
                        method="get"
                        replace // Важно! Не добавляет новую запись в историю
                    >
                        ← в главное меню
                    </Link>

                    <Link href="/profile/products-table"><button className="payment-button" data-color="green">Создать новый заказ</button></Link>
                </div>

                {orders.meta.last_page > 1 && (
                    <div className="table-controls">
                        {/* Селект количества строк */}
                        <div className="pagination">
                            <select 
                            value={orders.meta.per_page} 
                            onChange={handlePerPageChange}
                            >
                            {[10, 25, 50, 100, 250, 500].map(size => (
                                <option key={size} value={size}>Смотрим по {size} строк</option>
                            ))}
                            <option value={orders.meta.total}>Показать все</option>
                            </select>
                        </div>

                        {orders.meta.last_page > 1 && (
                            <CompactPagination 
                                meta={orders.meta}
                                getPageUrl={getPageUrl}
                            />
                        )}

                        {/* Сортировка и поиск */}
                        <select className="text-align-left"
                            value={sortOrder}
                            onChange={handleOrderChange}
                        >
                            <option value="asc"> ▲ начиная с самых ранних</option> 
                            <option value="desc"> ▼ начиная с поледних</option>
                        </select>
                    </div>
                )}

                {orders.data.length > 0 ? (
                    <div className="user-lk__scroll-table">
                        <table>
                            <thead>
                                <tr>
                                    <th title="Номер заказа">Номер</th>  
                                    <th>Дата заказа</th>
                                    <th title="Стоимость заказа">Цена</th>
                                    <th>Статус</th>
                                    <th>Просмотр</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* {orders.data.map((order, index) => (
                                    <tr key={order.id}>
                                        <td className="td-center">{order.number}</td>  
                                        <td className="td-center">{dateRu(order.order_date)}</td>  
                                        <td className="td-center">{formatPrice(order.cost)}</td>
                                        <td className="td-center">{order.status }</td>
                                        <td className="td-center"><Link  className='header-logo__img' href={`/profile/track/order/${order.hash}`}><img
                                                src='/storage/icons/search.png' 
                                                alt='check-order' 
                                                title='Посмотреть заказ' 
                                            /></Link>
                                        </td>
                                    </tr>
                                ))} */}

                                {orders.data.map((order, index) => {
                                    const isExpired = order.access_expires_at && new Date(order.access_expires_at) < new Date();
                                    const isCancelled = order.payment.status.code === 'cancelled';
                                    const isDisabled = isExpired || isCancelled;
                                    console.log('isDisabled', isDisabled);
                                    
                                    return (
                                        <tr key={order.id}>
                                            <td className="td-center">{order.number}</td>  
                                            <td className="td-center">{dateRu(order.order_date)}</td>  
                                            <td className="td-center">{formatPrice(order.cost)}</td>
                                            <td className="td-center">{order.status}</td>
                                            <td className="td-center">
                                                {isDisabled ? (
                                                    <button 
                                                        className="header-logo__img disabled"
                                                        disabled
                                                        title={isCancelled ? 'Заказ не был оплачен. Отменён' : 'Срок просмотра истек'}
                                                    >
                                                        {/* <img
                                                            src='/storage/icons/search.png' // можно сделать серую версию
                                                            alt='check-order-disabled' 
                                                            title={isCancelled ? 'Заказ отменен' : 'Срок просмотра истек'}
                                                        /> */}
                                                        🔒
                                                    </button>
                                                ) : (
                                                    <Link 
                                                        className='header-logo__img' 
                                                        href={`/profile/track/order/${order.hash}`}
                                                    >
                                                        <img
                                                            src='/storage/icons/search.png' 
                                                            alt='check-order' 
                                                            title='Посмотреть заказ' 
                                                        />
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <h2 className='margin-bottom12px'>Заказов пока не было...</h2>
                )}  
            </div>
        </MainLayout> 
    );
};

export default Orders;