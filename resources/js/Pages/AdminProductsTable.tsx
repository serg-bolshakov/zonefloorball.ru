// resources/js/Pages/AdminProductsTable.tsx
import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { AdminLayout } from '@/Layouts/AdminLayout';
import { Helmet } from 'react-helmet';
import ProductsTable from '@/Components/Admin/Sections/Products/ProductsTable/ProductsTable';
import { IProductsResponse, ICategoryItemFromDB, IProduct } from '@/Types/types';
import { IPrice } from '@/Types/types';
import { toast } from 'react-toastify';
import { toStringOrNull } from '@/Utils/toStringOrNull';
import { toNumberOrNull } from '@/Utils/toNumberOrNull';
import axios from "axios";

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
    searchType: 'article' | 'id' |'title';    
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
        Inertia.post(`/admin/products/${productId}/update-status`, {
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
    

    const handlePricesChange = async (productId: number, newPrices: IPrice[]) => {
        // 1. Находим товар в массиве продуктов
        const currentProduct = products.data.find(p => p.id === productId);
        if (!currentProduct) {
            console.error('Товар не найден в списке', productId);
            toast.error('Ошибка: товар не найден');
            return;
        }

        console.log('🔍 Фильтрация цен перед отправкой', {
            productId,
            productTitle: currentProduct.title,
            allPricesCount: newPrices.length
        });
        
        // 2. Фильтруем только изменившиеся цены
        const changedPrices = newPrices.filter(newPrice => {
            const currentPrice = getCurrentPrice(currentProduct, newPrice.price_type_id!);
            const changed = hasPriceChanged(currentPrice, newPrice);

            console.log(`💰 Проверка ${getPriceTypeName(newPrice.price_type_id!)} цены`, {
                changed,
                current: currentPrice,
                new: newPrice
            });

            return changed;
        });

        console.log('📊 Результат фильтрации', {
            changedPricesCount: changedPrices.length,
            filteredPricesCount: newPrices.length - changedPrices.length
        });

        if (changedPrices.length === 0) {
            toast.info('💡 Нет изменений для сохранения');
            return;
        }

        // 3. Оптимистичное обновление UI
        setEditableProducts(prev => prev.map(product =>
            product.id === productId ? updateProductPrices(product, changedPrices) : product
        ));

        // 4. Отправляем на сервер только измененные цены
        /*Inertia.post(`/admin/products/${productId}/update-prices`, {
            prices: JSON.stringify({
                prices: changedPrices.map(price => ({
                    price_type_id: price.price_type_id,
                    price_value: price.price_value,
                    date_start: price.date_start,
                    date_end: price.date_end
                }))
            })
        }, {
            onError: () => {
                // 5. В случае ошибки - откат оптимистичного обновления
                toast.error('❌ Ошибка при обновлении цен');
                setEditableProducts(products.data); // Возвращаем исходные данные
            },
            onSuccess: () => {
                toast.success('✅ Цены успешно обновлены');
            },
            preserveScroll: true,
            // preserveState : false // Позволяем Inertia обновить данные
        });*/

        try {
            const response = await axios.post(`/admin/products/${productId}/update-prices`, {
                prices: changedPrices.map(price => ({
                    price_type_id: price.price_type_id,
                    price_value: price.price_value,
                    date_start: price.date_start,
                    date_end: price.date_end
                }))
            });

            // Проверяем HTTP статус
            if (response.status >= 200 && response.status < 300) {
                toast.success('Цены успешно обновлены');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

        } catch (error) {
            console.error('❌ Request error:', error);
            
            let errorMessage = '❌ Ошибка при обновлении цен';
            
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                
                if (status === 422) errorMessage = '❌ Ошибка валидации данных';
                else if (status === 404) errorMessage = '❌ Товар не найден';
                else if (status && status >= 500) errorMessage = '🚨 Серверная ошибка';
                else if (status && status >= 400) errorMessage = '❌ Ошибка в данных';
                else errorMessage = '❌ Ошибка сети';
            }
            
            toast.error(errorMessage);
            setEditableProducts(products.data);
        }
    };

    // Вспомогательная функция для обновления цен в продукте
    const updateProductPrices = (product: IProduct, changedPrices: IPrice[]): IProduct => {
        const updatedProduct: IProduct = { ...product };
        
        changedPrices.forEach(price => {
            const priceValue = toNumberOrNull(price.price_value);
            const dateStart = toStringOrNull(price.date_start);
            const dateEnd = toStringOrNull(price.date_end);

            switch (price.price_type_id) {
                case 2: // REGULAR
                    updatedProduct.price_regular = priceValue;
                    break;
                case 3: // SPECIAL
                    updatedProduct.price_special = priceValue;
                    updatedProduct.special_price_date_start = dateStart;
                    updatedProduct.special_price_date_end = dateEnd;
                    break;
                case 4: // PREORDER
                    updatedProduct.price_preorder = priceValue;
                    updatedProduct.preorder_price_date_start = dateStart;
                    updatedProduct.preorder_price_date_end = dateEnd;
                    break;
            }
        });
        
        updatedProduct.price_actual = 
            updatedProduct.price_special ?? 
            updatedProduct.price_preorder ?? 
            updatedProduct.price_regular ?? 
            null;
        
        return updatedProduct;
    };

    // Вспомогательная функция для логирования
    const getPriceTypeName = (typeId: number) => {
        switch(typeId) {
            case 2: return 'REGULAR';
            case 3: return 'SPECIAL'; 
            case 4: return 'PREORDER';
            default: return 'UNKNOWN';
        }
    };

    const getCurrentPrice = (product: IProduct, priceTypeId: number) => {
        switch (priceTypeId) {
            case 2: // REGULAR
                return { 
                    price_value: product.price_regular, 
                    date_start: null, 
                    date_end: null 
                };
            case 3: // SPECIAL
                return { 
                    price_value: product.price_special, 
                    date_start: product.special_price_date_start, 
                    date_end: product.special_price_date_end 
                };
            case 4: // PREORDER
                return { 
                    price_value: product.price_preorder, 
                    date_start: product.preorder_price_date_start, 
                    date_end: product.preorder_price_date_end 
                };
            default: 
                return null;
        }
    };

    const hasPriceChanged = (current: any, newPrice: any) => {
        if (!current) return true; // Если нет текущей цены - считаем изменением
        
        // Сравниваем цены (учтем возможные null/undefined)
        const priceChanged = 
            (current.price_value ?? null) !== (newPrice.price_value ?? null);
        
        // Сравниваем даты (нормализуем форматы)
        const normalizeDate = (date: string | null) => {
            if (!date) return null;
            return new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD
        };
        
        const dateStartChanged = 
            normalizeDate(current.date_start) !== normalizeDate(newPrice.date_start);
        const dateEndChanged = 
            normalizeDate(current.date_end) !== normalizeDate(newPrice.date_end);
        
        return priceChanged || dateStartChanged || dateEndChanged;
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
                    onPricesChange={handlePricesChange}
                    onRowClick={handleRowClick}
                />
            </div>                
        </AdminLayout>    
    );
};

export default AdminProductsTable;