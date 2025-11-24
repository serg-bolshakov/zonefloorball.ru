// resources/js/Pages/OrderTracking.tsx - компонент для отслеживания статуса заказа

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
import ReviewModal, { ReviewFormData } from '@/Components/Reviews/ReviewModal';
import { toast } from 'react-toastify';
import axios from 'axios';

// Добавляем интерфейс для продукта (упрощенная версия)
export interface IProductForReview {
    id: number;
    name?: string;
    title?: string;
    article?: string;
    productShowCaseImage?: {
        img_link: string;
    };
}

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
        title: string;
        article: string;
        name?: string; // для совместимости
        productShowCaseImage?: { // ← ДОБАВЛЯЕМ ДАННЫЕ ДЛЯ МОДАЛКИ
            img_link: string;
        };
    };
    id: number;
    quantity: number;
    price: number;
    discount: number;
    has_review?: boolean; // ← ДОБАВЛЯЕМ ФЛАГ ОТЗЫВА
}

export interface IOrderStatus {
    id: number;
    name: string;
    code: string;
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
    console.log('order', order);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const [reviewModal, setReviewModal] = useState<{
        isOpen: boolean;
        product?: IProductForReview;
        orderItem?: IOrderItem; // ← Сохраняем данные о заказе
    }>({ isOpen: false });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Функции для работы с модалкой
    const openReviewModal = (product: IProductForReview, orderItem: IOrderItem) => {
        // console.log('openReviewModal product', product);
        // console.log('orderItem', orderItem);
        setReviewModal({ 
            isOpen: true, 
            product: {
                id: product.id,
                title: product.name + ' (Арт. ' + orderItem.product.article + ')', 
                productShowCaseImage: product.productShowCaseImage // ← ТЕПЕРЬ ЕСТЬ!
            }, 
            orderItem 
        });
    };

    const closeReviewModal = () => {
        setReviewModal({ isOpen: false });
    };

    // Обработчик отправки отзыва (аналогичный resources/js/Components/ProductCard/ProductReviewsSection.tsx)
    const handleSubmitReview = async (reviewData: ReviewFormData) => {
        setIsSubmitting(true);

        try {
            /*console.log('Submitting review from track-order:', {
                product: reviewModal.product,
                orderItem: reviewModal.orderItem,
                order: order.id,
            });*/
            
            // 1. Создаем отзыв с order_id
            const reviewResponse = await axios.post('/api/reviews', {
                product_id: reviewModal.product?.id,
                order_id: order.id, // ← ВАЖНО: добавляем ID заказа
                rating: reviewData.rating,
                advantages: reviewData.advantages,
                disadvantages: reviewData.disadvantages, 
                comment: reviewData.comment,
            });

            if (!reviewResponse.data.success) {
                throw new Error(reviewResponse.data.message || 'Ошибка при создании отзыва');
            }

            const reviewId = reviewResponse.data?.review?.id;

            // 2. Загружаем медиа если есть
            if (reviewData.media.length > 0 && reviewId) {
                const formData = new FormData();
                reviewData.media.forEach(file => {
                    formData.append('media[]', file);
                });

                const mediaResponse = await axios.post(
                    `/api/reviews/${reviewId}/media`,
                    formData
                );

                if (!mediaResponse.data.success) {
                    throw new Error(mediaResponse.data.message || 'Ошибка при загрузке медиафайлов');
                }
            }
            
            closeReviewModal();
            toast.success('Отзыв успешно отправлен на модерацию! Спасибо!');
                
        } catch (error: any) {
            console.error('Error submitting review:', error);
            toast.error(error.response.data.message || 'Ошибка при отправке отзыва');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const totalAmount = order.items.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
    ) + order.delivery.cost;

    // console.log('order status', order); // name: "В обработке"
    // console.log('order', order.items);
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
               
                <div className="fs12px text-gray-500 margin-tb8px">
                    {!['RECEIVED', 'COMPLETED'].includes(order.status.code) 
                        ? "Отзыв можно оставить после получения заказа." 
                        : "Пожалуйста, оставьте отзыв на товары!"
                    }
                </div>
                
                {/* Адаптивные секции с аккордеоном для мобильных */}
                <div className="order-sections margin-bottom4px">
                    <OrderSection 
                        title="Товары в заказе" 
                        isExpanded={expandedSection === 'items'} 
                        onToggle={() => toggleSection('items')}
                    >
                        <OrderItemsTable 
                            items={order.items}
                            orderStatusCode={order.status.code}
                            onReviewClick={openReviewModal} // ← Передаем колбэк
                         />
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
                </div>
            </div>

            {/* Модалка с проверкой product */}
            {reviewModal.isOpen && reviewModal.product && (
                // @ts-ignore TODO: Унифицировать интерфейсы продуктов из разных контроллеров
                <ReviewModal
                    isOpen={reviewModal.isOpen}
                    onClose={closeReviewModal}
                    onSubmit={handleSubmitReview}
                    product={reviewModal.product as any} // ← временно}
                    isSubmitting={isSubmitting}
                />
            )}
        </MainLayout>
    );
};

export default OrderTracking;