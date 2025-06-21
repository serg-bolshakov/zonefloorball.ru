import { IOrderItem } from "@/Pages/OrderTracking";
import { formatPrice } from "@/Utils/priceFormatter";

export const OrderItemsTable: React.FC<{ items: IOrderItem[] }> = ({ items }) => {
    const hasDiscount = items.some(item => item.discount > 0);
    console.log(items);
    
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
