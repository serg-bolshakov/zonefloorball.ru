// resources/js/Types/orders.ts
import { IIndividualUser, IOrgUser } from "./types";
import { ITransport } from "./delivery";


export type TOrderAction = 'pay' | 'reserve' | 'preorder';

// Типы для заказов
export interface IOrder {
    id: number;
    user_id: number;
    status_id: number;
    order_track_num: string | null;
    total_amount: number;
    created_at: string;
    updated_at: string;
    
    // Отношения
    user?: IIndividualUser | IOrgUser;
    status_history?: IOrderStatusHistory[];
    items?: OrderItem[];

    // То, что приходит, но нам не нужно пока:
    access_expires_at: string | null;
    access_hash: string;
    actual_legal_agreement_ip: string;
    email: string; 
    invoice_url: string; 
    invoice_url_expired_at: string; 
    is_client_informed: boolean; 
    is_order_amount_includes_taxes: boolean; 
    is_preorder: boolean;
    is_tracking_by_client: boolean;
    order_client_id: number;
    order_client_rank_id: number;
    order_client_type_id: number;
    order_date: string; 
    order_delivery_address: string;
    order_delivery_cost: number;
    order_number: string; 
    order_recipient_names: string;
    order_recipient_tel: string; 
    order_transport_id: number;
    transport?: ITransport; // Добавляем связанные данные о доставке 
    payment_details: string; 
    payment_method: string; 
    payment_status: string; 
    pickup_point_id: number | null;
    seller_id: number; 
    total_product_amount: number; 
}

export interface IOrderStatusHistory {
    id: number;
    order_id: number;
    old_status: number;
    new_status: number;
    comment: string;
    created_at: string;
    
    // Для отображения
    old_status_name?: string;
    new_status_name?: string;
}

export interface OrderItem {
    id: number;
    product_id: number;
    quantity: number;
    price: number;
    
    product?: {
        id: number;
        article: string;
        title: string;
    };
}

// Enum для статусов (синхронизирован с PHP)
export enum EnumOrderStatus {
    PENDING = 1,
    CREATED = 2,
    RESERVED = 3,
    CONFIRMED = 4,
    CANCELLED = 5,
    FAILED = 6,
    IN_PROCESSING = 7,
    READY_TO_BE_DISPATCHED = 8,
    SHIPPED = 9,
    DELIVERED = 10,
    RECEIVED = 11,
    COMPLETED = 12,
    RETURNED = 13,
    NULLIFY = 14,
    PREORDER = 15
}

export const OrderStatusLabels: Record<EnumOrderStatus, string> = {
    [EnumOrderStatus.PENDING]: 'Ожидание',
    [EnumOrderStatus.CREATED]: 'Создан',
    [EnumOrderStatus.RESERVED]: 'Зарезервирован',
    [EnumOrderStatus.CONFIRMED]: 'Подтверждён',
    [EnumOrderStatus.CANCELLED]: 'Отменён',
    [EnumOrderStatus.FAILED]: 'Ошибка',
    [EnumOrderStatus.IN_PROCESSING]: 'В обработке',
    [EnumOrderStatus.READY_TO_BE_DISPATCHED]: 'Готов к отправке',
    [EnumOrderStatus.SHIPPED]: 'Отправлен',
    [EnumOrderStatus.DELIVERED]: 'Доставлен',
    [EnumOrderStatus.RECEIVED]: 'Получен',
    [EnumOrderStatus.COMPLETED]: 'Завершён',
    [EnumOrderStatus.RETURNED]: 'Возврат',
    [EnumOrderStatus.NULLIFY]: 'Аннулирован',
    [EnumOrderStatus.PREORDER]: 'Предзаказ'
};

export interface IOrdersResponse {
    data: IOrder[]; // Массив заказов

    first_page_url: string | null;
    last_page_url: string | null;
    prev_page_url: string | null;
    next_page_url: string | null;
    
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
    links: [{ url: string | null; label: string; active: boolean }]; 
}