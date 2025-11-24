// resources/js/Components/Admin/Documents/DocumentItemsTable.tsx
import React from 'react';

interface IDocumentItem {
    product_id: number;
    product_name: string;
    product_article: string;
    quantity: number;
    price: number;
    total: number;
    unit_id: number;
}

interface IDocumentItemsTableProps {
    items: IDocumentItem[];
    onUpdate: (index: number, field: string, value: any) => void;
    onRemove: (index: number) => void;
    readOnly?: boolean;
}

export const DocumentItemsTable: React.FC<IDocumentItemsTableProps> = ({
    items,
    onUpdate,
    onRemove,
    readOnly = false
}) => {
    if (items.length === 0) {
        return (
            <div className="document-items-empty">
                📝 Добавьте товары в документ
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
                        <th style={{ width: '80px' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                                <div>
                                    <strong>{item.product_article}</strong>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                        {item.product_name}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => onUpdate(index, 'quantity', parseInt(e.target.value) || 1)}
                                    disabled={readOnly}
                                    className="quantity-input"
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={item.price}
                                    onChange={(e) => onUpdate(index, 'price', parseFloat(e.target.value) || 0)}
                                    disabled={readOnly}
                                    className="price-input"
                                />
                            </td>
                            <td>
                                <strong>{item.total} руб.</strong>
                            </td>
                            <td>
                                {!readOnly && ( // ✅ Показываем кнопку удаления только если не readOnly
                                    <button
                                        onClick={() => onRemove(index)}
                                        className="remove-btn"
                                    >
                                        ✕
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