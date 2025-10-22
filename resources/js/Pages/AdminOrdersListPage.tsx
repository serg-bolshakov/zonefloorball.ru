// resources/js/Pages/AdminOrdersListPage.tsx
import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { router } from '@inertiajs/react';
import { AdminLayout } from '@/Layouts/AdminLayout';
import { Helmet } from 'react-helmet';
import { OrdersTable } from '@/Components/Admin/Sections/Orders/OrdersTable/OrdersTable';
import { IOrdersResponse, IOrder, EnumOrderStatus, OrderStatusLabels } from '@/Types/orders';
import { toast } from 'react-toastify';
import { toStringOrNull } from '@/Utils/toStringOrNull';
import { toNumberOrNull } from '@/Utils/toNumberOrNull';
import axios from "axios";

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

    const handleTrackNumberUpdate = async (orderId: number, trackNumber: string, comment: string) => {
        
        // 1. Валидация входных данных
        if (!orderId || !trackNumber?.trim()) {
            console.error('❌ Невалидные данные:', { orderId, trackNumber });
            toast.error('Трек-номер не может быть пустым');
            return;
        }

        const cleanTrackNumber = trackNumber.trim();

        
        // 2. Находим заказ с проверкой
        const currentOrder = orders.data.find(o => o.id === orderId);
        if (!currentOrder) { 
            console.error('❌ Заказ не найден в списке', orderId);
            toast.error('Ошибка: заказ не найден');
            return;
        }

        console.log('🔍 Данные для обновления трека:', {
            orderId,
            orderNumber: currentOrder.order_number,
            trackNumber: cleanTrackNumber,
            commentLength: comment.length
        });

        // 3. Сохраняем исходные данные для отката
        const originalTrackNumber = currentOrder.order_track_num;

        // 4. Оптимистичное обновление UI
        setEditableOrders(prev => 
            prev.map(order => 
                order.id === orderId 
                    ? { ...order, order_track_num: cleanTrackNumber, }
                    : order
            )
        );

        // 5. Отправляем на сервер
        try {
            const response = await axios.post(`/admin/orders/${orderId}/update-order-track`, {
                orderId,
                track_number: cleanTrackNumber,
                comment: comment
            });

            // Проверяем HTTP статус
            if (response.status >= 200 && response.status < 300) {
                toast.success('Трек-номер успешно добавлен');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

        } catch (error) {
            console.error('❌ Request error:', error);

            // 6. Откат оптимистичного обновления
            setEditableOrders(prev => 
                prev.map(order => 
                    order.id === orderId 
                        ? { ...order, order_track_num: originalTrackNumber }
                        : order
                )
            );

            
            let errorMessage = '❌ Ошибка при обновлении трек-номера заказа';
            
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                
                if (status === 422) errorMessage = '❌ Ошибка валидации данных';
                else if (status === 404) errorMessage = '❌ Товар не найден';
                else if (status && status >= 500) errorMessage = '🚨 Серверная ошибка';
                else if (status && status >= 400) errorMessage = '❌ Ошибка в данных';
                else errorMessage = '❌ Ошибка сети';
            }
            
            toast.error(errorMessage);
        }
        
    }

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
                    onTrackNumberUpdate={handleTrackNumberUpdate}
                    onRowClick={handleRowClick}
                />
            </div>                
        </AdminLayout>    
    );
};

export default AdminStockUpdateManualPage;