// resources/js/Pages/AdminProductsTable.tsx
import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { router } from '@inertiajs/react';
import { AdminLayout } from '@/Layouts/AdminLayout';
import { Helmet } from 'react-helmet';
import ProductsTable from '@/Components/Admin/Sections/Products/ProductsTable/ProductsTable';
import { IOrdersResponse, IOrder, EnumOrderStatus, OrderStatusLabels } from '@/Types/orders';
import { IProductsResponse, ICategoryItemFromDB } from '@/Types/types';

/** на входе
 *  return Inertia::render('AdminProductsTable', [
            'title'         => 'Админка. Каталог товаров',
            'robots'        => 'NOINDEX,NOFOLLOW',
            'description'   => '',
            'keywords'      => '',
            'catalogCategoryName' => $categoryInfo ? $categoryInfo->category_title : 'Каталог товаров',
            'catalogCategoryTitleImg' => $categoryInfo ? $categoryUrlSemantic : 'catalog-title',
            'catName' => $categoryInfo ? $categoryInfo->category_view_2 : 'Полный каталог товаров',
            'catDescription' => '',
            'products' => new ProductCollection($products),  // Inertia.js использует JSON для передачи данных между Laravel и React. Когда мы передаём объект ProductCollection, он сериализуется в JSON. В процессе сериализации некоторые свойства объекта LengthAwarePaginator (например, lastPage, total, perPage и т.д.) могут быть преобразованы в массивы, если они имеют сложную структуру или если в процессе сериализации происходит дублирование данных - это проблема: в react мы получаем не значения, а массиивы значений (дублирование), что приводит к проблемам при рендеринге данных
            //'filters' => $filters,
            'sortBy' => $sortBy,
            'sortOrder' => $sortOrder,
            'tableMode' => $tableMode,
            'search' => $request->input('search', ''),
            'searchType' => $request->input('searchType', 'article'),
            'categoryId' => $categoryId,
            'categoryInfo' => $categoryInfo,
        ]);
*/

interface AdminProductsTableProps {
    title: string;
    robots: string;
    description: string;
    keywords: string;
    catalogCategoryName: string;
    catalogCategoryTitleImg: string;
    catName: string;
    catDescription: string;
    products: IProductsResponse;        // Добавляем продукты - products обязателен — это не просто массив, а объект с пагинацией...
    sortBy?: string;
    sortOrder?: string;
    search: string;
    searchType: 'article' | 'title';    
    categoryId?: number | null;
    categoryInfo?: ICategoryItemFromDB;
}

const defaultProducts: IProductsResponse = {
    data: [],
    links: {
        first: null,
        last: null,
        prev: null,
        next: null,
    },
    meta: {
        current_page: 1,
        from: 1,
        last_page: 1,
        path: '',
        per_page: 6,
        to: 1,
        total: 0,
        links: [{
            url: null, 
            label: '', 
            active: false
        }],
    },
};

const handleRowClick = (productId: number) => {
    // Inertia.post(`/admin/products/${productId}`);
};

const AdminProductsTable: React.FC<AdminProductsTableProps> = ({ 
    title,
    robots,
    description,
    keywords,
    products = defaultProducts,
    sortBy = 'actual_price',
    sortOrder = 'asc',
    search: initialSearch = '',
    searchType: initialSearchType = 'article',
    categoryId,
    categoryInfo,
}) => {
    // console.log('products.data', products.data);

    // индикатор загрузки:
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const unsubscribe = Inertia.on('start', () => setIsLoading(true));
        const unsubscribeFinish = Inertia.on('finish', () => setIsLoading(false));
        
        return () => {
                unsubscribe();
                unsubscribeFinish();
            };
    }, []);

    // Локальное состояние для редактируемых продуктов
    const [editableProducts, setEditableProducts] = useState(products.data);

    // Функция для оптимистичного обновления
    const updateProductStatus = (productId: number, newStatus: number) => {
        setEditableProducts(prev => 
            prev.map(product => 
                product.id === productId 
                    ? { ...product, status_id: newStatus }
                    : product
            )
        );
    };

    // Синхронизация: при изменении products с сервера - обновляем локальное состояние
    useEffect(() => {
        setEditableProducts(products.data);
    }, [products.data]); // Зависимость от products.data

    const handleStatusChange = (productId: number, newStatusId: number) => {
        // 1. Оптимистичное обновление UI
        updateProductStatus(productId, newStatusId);
        
        // 2. Отправка на сервер
        Inertia.post(`/admin/products/${productId}/status`, {
            status: newStatusId,
        }, {
            onError: () => {
                // 3. В случае ошибки - откат оптимистичного обновления
                setEditableProducts(products.data); // Возвращаем исходные данные
                alert('Ошибка при обновлении статуса');
            },
            onSuccess: () => {
                // 
            },
            preserveScroll: true,
            preserveState : false // Позволяем Inertia обновить данные
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
                <h1 className="h1-tablename">Товары</h1>
                {/* Передаем данные о товарах в компонент таблицы */}
                <ProductsTable 
                    products={{ ...products, data: editableProducts }} // Передаем оптимистично обновленные данные
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    search={initialSearch}
                    searchType={initialSearchType}
                    categoryId={categoryId}
                    categoryInfo={categoryInfo}
                    onStatusChange={handleStatusChange}
                    onRowClick={handleRowClick}
                />
            </div>                
        </AdminLayout>    
    );
};

export default AdminProductsTable;