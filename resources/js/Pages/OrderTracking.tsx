// recources/js/Pages/OrderTracking.tsx - компонент для отслеживания статуса заказа

import MainLayout from "@/Layouts/MainLayout";
import { Helmet } from "react-helmet";
import NavBarBreadCrumb from "@/Components/NavBarBreadCrumb";
import React, { useState } from 'react';
import { dateRu } from "@/Utils/dateFormatter";
import { OrderStatusTimeline } from "@/Components/OrderTracking/OrderStatusTimeline";
import { OrderSection } from "@/Components/OrderTracking/OrderSection";
import { OrderItemsTable } from "@/Components/OrderTracking/OrderItemsTable";
import { PaymentInfo } from "@/Components/OrderTracking/PaymentInfo";
import { DeliveryInfo } from "@/Components/OrderTracking/DeliveryInfo";
import { formatPrice } from "@/Utils/priceFormatter";

interface IOrderTrackProps {  
    title: string;
    robots: string;
    description: string;
    keywords: string;
    order: IOrder;
}

export interface IOrderItem {
    product: {
        id: number;
        name: string;
        article: number;
    };
    quantity: number;
    price: number;
    discount: number;
}

export interface IOrderStatus {
    id: number;
    name: string;
    history: IOrderStatusEvent[] | null;
}

export interface IOrderStatusEvent {
    date: string;
    status: string;
    comment?: string;
}

export interface IOrderDelivery {
    type: string;
    address: string;
    tracking_number?: string;
    estimated_date?: string;
    cost: number;
}

export interface IOrderPayment {
    method: {
        code: string;
        label: string;
    };
    status: {
        code: string;
        label: string;
    };
    invoice_url?: string;
    payment_url?: string | null;
}

interface IOrder {
    id: number;
    number: string;
    date: string;
    status: IOrderStatus;
    items: IOrderItem[];
    delivery: IOrderDelivery;
    payment: IOrderPayment;
}

const OrderTracking: React.FC<IOrderTrackProps> = ({title, robots, description, keywords, order}) => {

    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const totalAmount = order.items.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
    ) + order.delivery.cost;

    console.log('order', order);

    return (
        <MainLayout>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords} />
                <meta name="robots" content={robots} />
            </Helmet>

            <NavBarBreadCrumb />

            <div className="order-tracking-container">
                <h1 className="order-title">Заказ №{order.number}</h1>
                <p className="order-date">Дата: {dateRu(order.date)}</p>
                <p className="order-total">Общая стоимость заказа: <span className="color-green">{formatPrice(totalAmount)}&nbsp;<sup>&#8381;</sup></span></p>
                
                {/* Адаптивные секции с аккордеоном для мобильных */}
                <div className="order-sections margin-bottom4px">
                    <OrderSection 
                        title="Товары в заказе" 
                        isExpanded={expandedSection === 'items'} 
                        onToggle={() => toggleSection('items')}
                    >
                        <OrderItemsTable items={order.items} />
                    </OrderSection>

                    <OrderSection 
                        title="Доставка" 
                        isExpanded={expandedSection === 'delivery'} 
                        onToggle={() => toggleSection('delivery')}
                    >
                        <DeliveryInfo delivery={order.delivery} />
                    </OrderSection>

                    <OrderSection 
                        title="Оплата" 
                        isExpanded={expandedSection === 'payment'} 
                        onToggle={() => toggleSection('payment')}
                    >
                        <PaymentInfo payment={order.payment} />
                    </OrderSection>
                </div>

                {/* Статус заказа с прогресс-баром */}
                <OrderStatusTimeline status={order.status} />

                <div className="order-actions">
                {order.status.name === 'pending' && (
                    <button 
                    onClick={() => alert('Функция отмены будет скоро!')}
                    className="btn btn-cancel"
                    >
                    Отменить заказ
                    </button>
                )}
                <button 
                    onClick={() => alert('Отзыв можно оставить после получения заказа!')}
                    className="btn btn-review"
                    disabled={order.status.name !== 'delivered'}
                >
                    Оставить отзыв
                </button>
                </div>


            </div>
        </MainLayout>
    );
};

export default OrderTracking;