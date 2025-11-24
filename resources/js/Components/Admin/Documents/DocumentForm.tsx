// resources/js/Components/Admin/Documents/DocumentForm.tsx
import React from 'react';
import { ProductSelector } from './ProductSelector';
import { DocumentItemsTable } from './DocumentItemsTable';
import { router } from '@inertiajs/react';

interface DocumentFormProps {
    documentData: any;
    onChange: (data: any) => void;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({
    documentData,
    onChange
}) => {
    const addProduct = (product: any) => {
        const newItem = {
            product_id: product.id,
            product_name: product.title,
            product_article: product.article,
            quantity: 1,
            price: product.cost_price || 0, // Автоподстановка себестоимости
            unit_id: 1, // шт
            total: 0
        };
        
        onChange({
            ...documentData,
            items: [...documentData.items, newItem]
        });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...documentData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        
        // Пересчет total если изменилось quantity или price
        if (field === 'quantity' || field === 'price') {
            newItems[index].total = newItems[index].quantity * newItems[index].price;
        }
        
        onChange({ ...documentData, items: newItems });
    };

    const removeItem = (index: number) => {
        const newItems = documentData.items.filter((_: any, i: number) => i !== index);
        onChange({ ...documentData, items: newItems });
    };

    // console.log('documentData', documentData);

    const submitDocument = () => {
        console.log('submitDocument ', documentData)
        router.post('/admin/documents', documentData, {
            onSuccess: () => {
                // Редирект на список документов
                router.visit('/admin/documents');
            }
        });
    };

    return (
        <div className="document-form">
            {/* Шапка документа */}
            <div className="document-form__header">
                <h2>Создание документа</h2>
                <div className="document-form__meta">
                    <div className="admin-form-group">
                        <label className="form-label">Дата документа:</label>
                        <input
                            type="date"
                            className="form-input"
                            value={documentData.document_date}
                            onChange={(e) => onChange({
                                ...documentData, 
                                document_date: e.target.value 
                            })}
                        />
                    </div>
                
                    <div className="admin-form-group">
                        <label className="form-label">Комментарий:</label>
                        <input
                            type="text"
                            className="form-input"
                            value={documentData.comment}
                            onChange={(e) => onChange({
                                ...documentData, 
                                comment: e.target.value 
                            })}
                            placeholder="Причина оприходования..."
                        />
                    </div>
                </div>
            </div>

            {/* Выбор товара */}
            <ProductSelector onProductSelect={addProduct} />

            {/* Табличная часть */}
            <DocumentItemsTable
                items={documentData.items}
                onUpdate={updateItem}
                onRemove={removeItem}
            />

            {/* Итоги и кнопки */}
            <div className="document-footer">
                <div className="document-total">
                    Итого: {documentData.items.reduce((sum: number, item: any) => sum + item.total, 0)} руб.
                </div>
                
                <div className="document-actions">
                    <button 
                        onClick={submitDocument}
                        disabled={documentData.items.length === 0}
                        className="btn btn-primary"
                    >
                        Провести документ
                    </button>
                </div>
            </div>
        </div>
    );
};