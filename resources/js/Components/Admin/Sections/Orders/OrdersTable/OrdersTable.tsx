// resources/js/Components/Admin/Sections/Orders/OrdersTable/OrderTable.tsx

import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { IOrder, EnumOrderStatus, OrderStatusLabels, IOrdersResponse } from '@/Types/orders';
import { CompactPagination } from '@/Components/CompactPagination';
import { IOrdersFiltersSet } from '@/Pages/AdminOrdersListPage';
import { OrdersTableRow } from './OrdersTableRow';

interface OrdersTableProps {
    orders: IOrdersResponse;
    filters: IOrdersFiltersSet;
    onStatusChange: (orderId: number, newStatus: EnumOrderStatus, comment: string) => void;
    onRowClick: (orderId: number) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ 
    orders, 
    filters,
    onStatusChange,
    onRowClick,
}) => {
    
    // Инициализируем состояние из пропсов (которые приходят из URL через Inertia)
    const initialSearch = filters.search = '';
    const initialSearchType = filters.searchType = 'order_number';
    
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [searchType, setSearchType] = useState<'order_number' | 'recipient' | 'email' | 'user_name'>(initialSearchType);

    // Локальное состояние дат при изменении фильтров
    const [localDates, setLocalDates] = useState({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
    });

    // Обновляем локальное состояние при изменении фильтров
    useEffect(() => {
        setLocalDates({
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo
        });
    }, [filters.dateFrom, filters.dateTo]);

    const applyDateFilter = () => {
        router.get('/admin/orders', {
            ...filters,
            dateFrom: localDates.dateFrom,
            dateTo: localDates.dateTo,
            page: 1
        });
    };
    
    // Синхронизация при изменении URL (если пользователь нажимает "Назад")
    useEffect(() => {
        setSearchTerm(initialSearch);
        setSearchType(initialSearchType);
    }, [initialSearch, initialSearchType]);   

    const handleSearch = () => {
        const params = {
            page: 1, // Всегда сбрасываем на первую страницу
            perPage: orders.per_page,
            search: searchTerm.trim(),
            searchType
        };
        
        router.get('/admin/orders', params, {
            preserveScroll: true,
            preserveState: true
        });
    };
    
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
    
    const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(`/admin/orders`, 
            getCommonParams({
                perPage: e.target.value,
                page: 1
            }), 
            { preserveScroll: true }
        );
    };
    
    // Функция формирования общих параметров
    const getCommonParams = (additionalParams = {}) => ({
        perPage: orders.per_page,
        ...additionalParams
    });
    
    // Получаем текущие query-параметры из URL
    const { url } = usePage();
    
    // Создаем абсолютный URL на основе текущего местоположения
    const absoluteUrl = new URL(window.location.origin + url);
        
    const searchParams = new URLSearchParams(absoluteUrl.search);
    
    // Функция для формирования URL с учетом параметров сортировки
    const getPageUrl = (page: number | string) => {
        const params = new URLSearchParams({
            ...Object.fromEntries(searchParams.entries()), // Передаем все существующие параметры 
            page: page.toString(),
        });

        return `?${params.toString()}`;
    };

    // Функция быстрых периодов
    const setQuickPeriod = (period: string) => {
        const today = new Date();
        let dateFrom = '', dateTo = today.toISOString().split('T')[0];
        
        switch (period) {
            case 'today':
                dateFrom = dateTo;
                break;
            case 'week':
                dateFrom = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
                break;
            case 'month':
                dateFrom = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];
                break;
        }
        
        router.get('/admin/orders', {
            ...filters,
            dateFrom,
            dateTo,
            page: 1
        });
    };
    

    return (
        <div className="admin-orders">           
            {/* Фильтры и поиск (аналогично таблице остатков) */}
            <div className="table-controls">
                {/* Селект количества строк */}
                <div className="pagination">
                    <select 
                    value={orders.per_page} 
                    // onChange={handlePerPageChange}
                    >
                    {[10, 25, 50, 100, 250, 500].map(size => (
                        <option key={size} value={size}>Смотрим по {size} строк</option>
                    ))}
                    <option value={orders.total}>Показать все</option>
                    </select>
                </div>

                {/* Компактная пагинация */}
                <CompactPagination 
                    meta={orders}
                    getPageUrl={getPageUrl}
                />

                {/* Сортировка и поиск */}
                   <select className="text-align-left"
                            // value={sortOrder}
                            // onChange={handleOrderChange}
                        >
                            <option value="asc"> ▲ начиная с самых ранних</option> 
                            <option value="desc"> ▼ начиная с поледних</option>
                        </select>
                
                <div className="filters">
                    <select 
                        value={filters.status} 
                        onChange={(e) => {
                            router.get('/admin/orders', {
                                status: e.target.value,
                                page: 1
                            });
                        }}
                    >
                        <option value="all">Все статусы</option>
                        {Object.entries(OrderStatusLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="search-controls">
                <span className='pagination-info'>Поиск </span>
                <select 
                    value={searchType}
                    onChange={(e) => {
                        setSearchType(e.target.value as 'order_number' | 'recipient' | 'email');
                        // Можно автоматически запускать поиск при смене типа
                        if (searchTerm) handleSearch();
                    }}
                    className="search-type-select margin-left22px"
                    >
                    <option value="order_number">По номеру заказа</option>
                    <option value="recipient">По имени получателя</option>
                    <option value="email">По электронной почте</option>
                </select>
                    
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder='.... номер / Имя / почта' 
                    className="search-input margin-left12px"
                />
                    
                <button 
                    onClick={handleSearch}
                    disabled={!searchTerm.trim()}
                    className="search-btn margin-left40px"
                >
                    Найти
                </button>
                    
                {/* Индикация активного поиска: */}
                {searchTerm && (
                    <div className="active-search-info">
                        Поиск {searchType === 'order_number' ? 'по номеру заказа' : (searchType === 'recipient' ? 'имени получателя' : 'по электронной почте')}:&nbsp; 
                        <strong>{searchTerm}</strong>
                    </div>
                )}
    
                {(searchTerm || searchType !== 'order_number') && (
                    <button 
                        onClick={() => {
                            setSearchTerm('');
                            setSearchType('order_number');
                            router.get('/admin/orders', {
                                page: 1,
                                perPage: orders.per_page,
                                preserveScroll: true,
                                preserveState: true
                            });
                        }}
                        className="clear-search-button"
                    >
                        Сбросить
                    </button>
                )}

                {/* <label  className='pagination-info' htmlFor="date_from">
                    Выбрать за период с:&nbsp;
                </label>
                
                <input
                    className={`productAddition-form__input productAddition-form__input-price-date`}
                    type="date"
                    name="date_from"
                    onChange={handleSearch}
                />

                <label  className='pagination-info' htmlFor="date_to">
                    до:&nbsp;
                </label>
                
                <input
                    className={`productAddition-form__input productAddition-form__input-price-date`}
                    type="date"
                    name="date_to"
                    onChange={handleSearch}
                /> */}
            </div>

            <div className="date-filter-controls">
                <label className='pagination-info' htmlFor="date_from">
                    Период с:
                </label>
    
                <input
                    className="date-input"
                    type="date"
                    name="date_from"
                    value={localDates.dateFrom}
                    onChange={(e) => setLocalDates(prev => ({
                        ...prev, 
                        dateFrom: e.target.value 
                    }))}
                />

                <label className='pagination-info' htmlFor="date_to">
                    до:
                </label>
    
                <input
                    className="date-input"
                    type="date"
                    name="date_to"
                    value={localDates.dateTo}
                    onChange={(e) => setLocalDates(prev => ({
                        ...prev, 
                        dateTo: e.target.value 
                    }))}
                />

                {/* Кнопка сброса дат */}
                <button 
                    onClick={applyDateFilter}
                    className="apply-date-button"
                >
                    Применить
                </button>

                {(filters.dateFrom || filters.dateTo) && (
                    <button 
                        onClick={() => {
                            setLocalDates({ dateFrom: '', dateTo: '' });
                            router.get('/admin/orders', {
                                ...filters,
                                dateFrom: undefined,
                                dateTo: undefined,
                                page: 1
                            });
                        }}
                        className="clear-date-button"
                    >
                        ×
                    </button>
                )}

                 {/* Быстрые периоды */}
                <div className="table-controls-block">
                    <span className="pagination-info">Быстрый выбор:</span>
                    <button className="new-order-button" onClick={() => setQuickPeriod('today')}>Сегодня</button>
                    <button className="new-order-button" onClick={() => setQuickPeriod('week')}>Неделя</button>
                    <button className="new-order-button" onClick={() => setQuickPeriod('month')}>Месяц</button>
                </div>
            </div>


           

            {/* Таблица заказов */}
            <div className="admin__scroll-table">
                <table className="document-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Номер</th>
                            <th>Дата создания</th>
                            <th>Клиент</th>
                            <th>Оплата</th>
                            <th>Сумма</th>
                            <th>Статус</th>
                            <th>Трек-номер</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.data.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="text-center py-4">
                                    {filters.search || filters.status !== 'all' 
                                        ? 'Заказы по вашему запросу не найдены'
                                        : 'Заказов пока нет'
                                    }
                                </td>
                            </tr>
                        ) : (
                            <>
                                {orders.data.map((order) => (
                                    <OrdersTableRow
                                        key={order.id}
                                        order={order}
                                        onStatusChange={onStatusChange} // ✅ передаем пропсы
                                        onRowClick={onRowClick}         // ✅ передаем пропсы
                                    />
                                ))}
                            </> 
                        )}
                    </tbody>
                </table>
            </div>

            {/* Пагинация */}
            {/* <CompactPagination meta={orders} /> */}
        </div>
    );
};