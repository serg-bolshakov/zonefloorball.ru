// resources/js/Pages/Admin/StockUpdate/ManualPage.tsx
import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { AdminLayout } from '@/Layouts/AdminLayout';
import { StockManualTable, IAdminChangeStockQuantityProductsResponse, IProductStockReport } from '@/Components/Admin/Sections/Stock/StockManualTable';
import { Helmet } from 'react-helmet';

// Используем ваш привычный подход со свойствами из Laravel
interface ManualPageProps {
    title: string;
    robots: string;
    description: string;
    keywords: string;
    products: IAdminChangeStockQuantityProductsResponse; // объект с пагинацией
    search: string;
    searchType: 'article' | 'title';
}

const AdminStockUpdateManualPage: React.FC<ManualPageProps> = ({ 
    title, 
    robots, 
    description, 
    keywords, 
    products, // Это новые данные с сервера (после поиска, пагинации и т.д.)
    search,
    searchType 
}) => {
    // Локальное состояние для редактируемых продуктов
    const [editableProducts, setEditableProducts]   = useState<IProductStockReport[]>(products.data);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editField, setEditField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    // Синхронизация: при изменении products с сервера - обновляем локальное состояние
    useEffect(() => {
        setEditableProducts(products.data);
    }, [products.data]); // Зависимость от products.data

    const handleEditStart = (id: number, field: keyof IProductStockReport, value: number) => {
        setEditingId(id);
        setEditField(field);
        setEditValue(value.toString());
    };

    const handleSave = (id: number, field: keyof IProductStockReport) => {
        const numericValue = parseInt(editValue, 10);
        if (isNaN(numericValue) || numericValue < 0) {
            // Можно добавить toast-уведомление об ошибке
            return;
        }

        // Оптимистичное обновление UI
        setEditableProducts(prev => prev.map(p =>
            p.id === id ? { ...p, [field]: numericValue } : p
        ));

        // Сброс состояния редактирования
        setEditingId(null);
        setEditField(null);
        setEditValue('');

        // Отправка на сервер
        Inertia.post(`/admin/stock-manual/${id}`, {
            [field]: numericValue
        }, {
            onError: () => {
                // В случае ошибки - откат оптимистичного обновления
                setEditableProducts(products.data);
                // Можно показать ошибку
            },
            onSuccess: () => {
                // Можно показать успешное уведомление
            }
        });
    };
    
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
                <h1 className="h1-tablename">Ручное управление остатками товаров</h1>
                {/* Передаем данные о товарах в компонент таблицы */}
                <StockManualTable 
                    products={{ ...products, data: editableProducts }} // Передаем оптимистично обновленные данные
                    // products={products}
                    search={search}
                    searchType={searchType}
                    handleEditStart={handleEditStart}
                    handleSave={handleSave}
                    editingId={editingId}
                    editField={editField}
                    editValue={editValue}
                    onEditValueChange={setEditValue}
                />
            </div>                
        </AdminLayout>    
    );
};

export default AdminStockUpdateManualPage;