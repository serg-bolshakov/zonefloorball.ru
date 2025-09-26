// resources/js/Pages/AdminOrdersListPage.tsx
import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { router } from '@inertiajs/react';
import { AdminLayout } from '@/Layouts/AdminLayout';
import { Helmet } from 'react-helmet';
import { OrdersTable } from '@/Components/Admin/Sections/Orders/OrdersTable/OrdersTable';
import { IOrdersResponse, IOrder, EnumOrderStatus, OrderStatusLabels } from '@/Types/orders';

/** на входе
 *  return Inertia::render('AdminOrdersListPage', [
            'title'         => 'Админка. Заказы',
            'robots'        => 'NOINDEX,NOFOLLOW',
            'description'   => '',
            'keywords'      => '',
            'orders'        => $orders,
            'filters' => [
                'search'     => $searchTerm,        // 
                'searchType' => $searchType,        // 'order_number' // По умолчанию поиск по номеру заказа
                'status'     => $statusFilter,      // 'all'
                'sortBy'     => $sortBy,            // 'created_at'
                'sortOrder'  => $sortOrder,         // 'desc'
                'perPage'    => $perPage,           // 25
                'dateFrom'   => $dateFrom,          // всегда string (пустая или с датой)
                'dateTo'     => $dateTo,            // всегда string
            ]
        ]);
*/

export interface IOrdersFiltersSet {
    search: string;                    // всегда string (пустая или с текстом)
    searchType: 'order_number' | 'recipient' | 'email' | 'user_name';
    status: EnumOrderStatus | 'all';
    sortBy: string;                    // всегда string (значение по умолчанию есть)
    sortOrder: 'asc' | 'desc';         // всегда одно из двух значений
    perPage: number;                   // всегда number (значение по умолчанию есть)
    dateFrom: string;                  // всегда string (пустая или с датой)
    dateTo: string;                    // всегда string (пустая или с датой)
}

interface AdminStockUpdateManualPageProps {
    title: string;
    robots: string;
    description: string;
    keywords: string;
    orders: IOrdersResponse; // объект с пагинацией
    filters: IOrdersFiltersSet;
}

const handleRowClick = (orderId: number) => {
    // Inertia.post(`/admin/orders/${orderId}`);
};

const defaultOrders: IOrdersResponse = {
    current_page: 1,
    from: 1,
    last_page: 1,
    path: '',
    per_page: 6,
    to: 1,
    total: 0,
    links: [{
        url: null, 
        label: '', 
        active: false
    }],
    
    data: [],
   
    first_page_url: null,
    last_page_url: null,
    prev_page_url: null,
    next_page_url: null,        
};

const AdminStockUpdateManualPage: React.FC<AdminStockUpdateManualPageProps> = ({ 
    title, 
    robots, 
    description, 
    keywords, 
    orders = defaultOrders, // Это новые данные с сервера (после поиска, пагинации и т.д.)
    filters,
}) => {
    // console.log('orders.data', orders.data);
    // console.log('filters', filters);

    // индикатор загрузки:
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
    const unsubscribe = Inertia.on('start', () => setIsLoading(true));
    const unsubscribeFinish = Inertia.on('finish', () => setIsLoading(false));
    
    return () => {
            unsubscribe();
            unsubscribeFinish();
        };
    }, []);

    // Локальное состояние для редактируемых продуктов
    const [editableOrders, setEditableOrders]   = useState(orders.data);

    // Функция для оптимистичного обновления
    const updateOrderStatus = (orderId: number, newStatus: EnumOrderStatus) => {
        setEditableOrders(prev => 
            prev.map(order => 
                order.id === orderId 
                    ? { ...order, status_id: newStatus }
                    : order
            )
        );
    };

    // Синхронизация: при изменении orders с сервера - обновляем локальное состояние
    useEffect(() => {
        setEditableOrders(orders.data);
    }, [orders.data]); // Зависимость от orders.data

    const handleStatusChange = (orderId: number, newStatus: EnumOrderStatus, comment: string) => {
        // 1. Оптимистичное обновление UI
        updateOrderStatus(orderId, newStatus);
        
        // 2. Отправка на сервер
        Inertia.post(`/admin/orders/${orderId}/status`, {
            status: newStatus,
            comment: comment,
        }, {
            onError: () => {
                // 3. В случае ошибки - откат оптимистичного обновления
                setEditableOrders(orders.data); // Возвращаем исходные данные
                alert('Ошибка при обновлении статуса');
            },
            onSuccess: () => {
                alert('Статус обновлён');
            },
            preserveScroll: true,
            preserveState : false // Позволяем Inertia обновить данные
        });
    };

    return (
        <AdminLayout>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords} />
                <meta name="robots" content={robots} />
            </Helmet>

            {/* Основной контент страницы */}
            <div className="admin-content">
                <h1 className="h1-tablename">Заказы</h1>
                {/* Передаем данные о заказах в компонент таблицы */}
                <OrdersTable 
                    orders={{ ...orders, data: editableOrders }} // Передаем оптимистично обновленные данные
                    // orders={orders}
                    filters={filters}
                    onStatusChange={handleStatusChange}
                    onRowClick={handleRowClick}
                />
            </div>                
        </AdminLayout>    
    );
};

export default AdminStockUpdateManualPage;