// resources/js/Components/Admin/Documents/AssemblyForm.tsx
import React from 'react';
import { AssemblyProductSelector } from './AssemblyProductSelector';
// import { AssemblyItemsTable } from './AssemblyItemsTable';
import { router } from '@inertiajs/react';

interface AssemblyFormProps {
    documentData: any;
    onChange: (data: any) => void;
}

export const AssemblyForm: React.FC<AssemblyFormProps> = ({
    documentData,
    onChange
}) => {
    const addAssemblyProduct = async (product: any) => {
        // 🔍 ПРОВЕРЯЕМ ДОСТУПНОСТЬ КОМПЛЕКТУЮЩИХ ПЕРЕД ДОБАВЛЕНИЕМ
        /*try {
            const response = await fetch(`/api/products/${product.id}/assembly-availability?quantity=1`);
            const availability = await response.json();
            
            if (!availability.can_assemble) {
                alert(`Нельзя собрать "${product.title}". Недостаточно комплектующих!`);
                return;
            }

            const newItem = {
                product_id: product.id,
                product_name: product.title,
                product_article: product.article,
                quantity: 1,
                required_components: availability.components_info, // Инфо о комплектующих
                estimated_cost: availability.estimated_cost // Расчетная себестоимость
            };
            
            onChange({
                ...documentData,
                items: [...documentData.items, newItem]
            });
            
        } catch (error) {
            console.error('Error checking assembly availability:', error);
            alert('Ошибка проверки доступности комплектующих');
        }*/
    };

    const updateAssemblyQuantity = (index: number, newQuantity: number) => {
        // 🔄 ПЕРЕПРОВЕРЯЕМ ДОСТУПНОСТЬ ПРИ ИЗМЕНЕНИИ КОЛИЧЕСТВА
        const productId = documentData.items[index].product_id;
        
        fetch(`/api/products/${productId}/assembly-availability?quantity=${newQuantity}`)
            .then(response => response.json())
            .then(availability => {
                if (!availability.can_assemble) {
                    alert(`Нельзя собрать ${newQuantity} шт. Недостаточно комплектующих!`);
                    return;
                }

                const newItems = [...documentData.items];
                newItems[index] = { 
                    ...newItems[index], 
                    quantity: newQuantity,
                    required_components: availability.components_info,
                    estimated_cost: availability.estimated_cost
                };
                
                onChange({ ...documentData, items: newItems });
            })
            .catch(error => {
                console.error('Error updating assembly quantity:', error);
            });
    };

    const removeItem = (index: number) => {
        const newItems = documentData.items.filter((_: any, i: number) => i !== index);
        onChange({ ...documentData, items: newItems });
    };

    const submitAssembly = () => {
        console.log('submitAssembly ', documentData);
        router.post('/admin/documents/assembly', documentData, {
            onSuccess: () => {
                router.visit('/admin/documents');
            },
            onError: (errors) => {
                alert('Ошибка при комплектации: ' + JSON.stringify(errors));
            }
        });
    };

    const totalEstimatedCost = documentData.items.reduce(
        (sum: number, item: any) => sum + (item.estimated_cost || 0), 0
    );

    return (
        <div className="assembly-form">
            {/* Шапка документа */}
            <div className="document-form__header">
                {/* <h2>Комплектация товаров</h2> */}
                <div className="document-form__meta">
                    <div className="admin-form-group">
                        <label className="form-label">Дата комплектации:</label>
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
                            placeholder="Основание для комплектации..."
                        />
                    </div>
                </div>
            </div>

            {/* Специализированный селектор для комплектации */}
            <AssemblyProductSelector onProductSelect={addAssemblyProduct} />

            {/* Специализированная таблица для комплектации */}
            {/* <AssemblyItemsTable
                items={documentData.items}
                onUpdateQuantity={updateAssemblyQuantity}
                onRemove={removeItem}
            /> */}

            {/* Итоги и кнопки */}
            <div className="document-footer">
                <div className="document-total">
                    Расчетная себестоимость: {totalEstimatedCost} руб.
                </div>
                
                <div className="document-actions">
                    <button 
                        onClick={submitAssembly}
                        disabled={documentData.items.length === 0}
                        className="btn btn-primary"
                    >
                        🛠️ Выполнить комплектацию
                    </button>
                </div>
            </div>
        </div>
    );
};