import { IOrderItem } from "@/Pages/OrderTracking";
import { formatPrice } from "@/Utils/priceFormatter";
import { IProductForReview } from "@/Pages/OrderTracking";
import { OrderStatus } from "@/Types/OrderStatus";
import { toast } from 'react-toastify';

interface OrderItemsTableProps {
    items: IOrderItem[];
    onReviewClick: (product: IProductForReview, orderItem: IOrderItem) => void; // ← Теперь передаем полный объект
    orderStatusCode: string;
}

export const OrderItemsTable: React.FC<OrderItemsTableProps> = ({ 
    items, 
    onReviewClick,
    orderStatusCode
}) => {
    const hasDiscount = items.some(item => item.discount > 0);
    console.log('items', items);
    
    return (
        <div className="order-items-scroll">
            <table className="order-items-table">
                <thead>
                    <tr>
                        <th className="sticky-column">Товар</th>
                        <th>Кол-во</th>
                        <th>Цена</th>
                        {hasDiscount && <th>Скидка</th>}
                        <th>Сумма</th>
                        <th>Отзыв</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index}>
                            <td className="sticky-column">
                                {item.product.name} (Арт. {item.product.article})
                            </td>
                            <td>{item.quantity}</td>
                            <td>{formatPrice(item.price)}</td>
                            {hasDiscount && (
                                <td>{item.discount > 0 ? `-${formatPrice(item.discount)}` : ''}</td>
                            )}
                            <td>{formatPrice(item.quantity * item.price)}</td>
                            <td className="text-center">
                                {item.has_review ? (
                                    <span className="text-green-600">✓</span>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            if (!['RECEIVED', 'COMPLETED'].includes(orderStatusCode)) {
                                                toast.info('Отзыв можно оставить только после получения заказа');
                                                return;
                                            }
                                            onReviewClick(
                                                {
                                                id: item.product.id,
                                                name: item.product.name,
                                                productShowCaseImage: item.product.productShowCaseImage,
                                            },
                                            item // ← Передаем весь orderItem для дополнительных данных
                                            );
                                        }}
                                        className={`btn ${
                                            !['RECEIVED', 'COMPLETED'].includes(orderStatusCode) ? 'btn-disabled' : ''
                                        }`}
                                        title={!['RECEIVED', 'COMPLETED'].includes(orderStatusCode) 
                                            ? "Отзыв можно оставить только после получения заказа" 
                                            : "Написать отзыв"
                                        }
                                    >
                                       📝
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
