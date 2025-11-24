// resources/js/Components/Admin/Documents/DocumentViewItemsTable.tsx
import React from 'react';

interface IDocumentViewItem {
    id: number;
    comment: null | string;
    created_at: string;
    product_id: number;
    quantity: number;
    price: number;
    total: number;
    unit_id: number;
    product: {
        id: number;
        article: string;
        title: string;
    };
    unit?: {
        id: number;
        unit_prod_value_view: string;
    };
}

interface IDocumentViewItemsTableProps {
    items: IDocumentViewItem[];
}

export const DocumentViewItemsTable: React.FC<IDocumentViewItemsTableProps> = ({ 
    items 
}) => {
    if (items.length === 0) {
        return (
            <div className="document-items-empty">
                📭 В документе нет позиций
            </div>
        );
    }

    return (
        <div className="document-items-table">
            <table>
                <thead>
                    <tr>
                        <th style={{ width: '40px' }}>#</th>
                        <th>Товар</th>
                        <th style={{ width: '100px' }}>Кол-во</th>
                        <th style={{ width: '120px' }}>Цена</th>
                        <th style={{ width: '120px' }}>Сумма</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={item.id}>
                            <td className="td-center">{index + 1}</td>
                            <td>
                                <div>
                                    <strong>{item.product.article}</strong>
                                    <div className="product-title">
                                        {item.product.title}
                                    </div>
                                </div>
                            </td>
                            <td className="td-right">
                                {item.quantity} {item.unit?.unit_prod_value_view || 'шт'}
                            </td>
                            <td className="td-right">
                                {item.price} руб.
                            </td>
                            <td className="td-right">
                                <strong>{item.total} руб.</strong>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};