// resources/js/Pages/ProductOrderTable.tsx

import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { IProductsResponse, IProduct } from '@/Types/types';
import { formatPrice } from '@/Utils/priceFormatter';
// import { Pagination } from '@/Components/Pagination';
import useAppContext from '@/Hooks/useAppContext';
import { ProductTableRow } from '@/Components/ProductOrderTable/ProductTableRow';

interface ProductOrderTableProps {
    initialProducts: IProductsResponse;
}

export const ProductOrderTable: React.FC<ProductOrderTableProps> = ({ initialProducts }) => {
    const { user } = useAppContext();
    const [selectedProducts, setSelectedProducts] = useState<Record<string, { quantity: number; product: IProduct }>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const { url } = usePage();
    const searchParams = new URLSearchParams(new URL(window.location.origin + url).search);

    // Фильтрация товаров
    const filteredProducts = initialProducts.data.filter(product => 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.article.includes(searchQuery)
    );

    // Обработчик выбора товара
    const handleSelectProduct = (product: IProduct) => {
        setSelectedProducts(prev => {
        const newSelection = { ...prev };
        if (newSelection[product.id]) {
            delete newSelection[product.id];
        } else {
            newSelection[product.id] = { quantity: 1, product };
        }
        return newSelection;
        });
    };

    // Оформление заказа
    const handleCreateOrder = () => {
        const items = Object.values(selectedProducts).map(({ product, quantity }) => ({
        product_id: product.id,
        quantity
    }));

    return (
        <div className="order-table-container">
            {/* Панель управления */}
            <div className="table-controls">
                <input
                type="text"
                placeholder="Поиск по названию или артикулу"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                />
                
                {Object.keys(selectedProducts).length > 0 && (
                <button 
                    onClick={handleCreateOrder}
                    className="create-order-btn"
                >
                    Оформить выбранное ({Object.keys(selectedProducts).length})
                </button>
                )}
            </div>

            {/* Таблица товаров */}
            <div className="responsive-table">
                <table>
                <thead>
                    <tr>
                    <th className="sticky-col">Выбрать</th>
                    <th>Изображение</th>
                    <th>Наименование</th>
                    <th>Артикул</th>
                    <th>Цена</th>
                    <th>Кол-во</th>
                    <th>Сумма</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.map(product => (
                    <ProductTableRow
                        key={product.id}
                        product={product}
                        isSelected={!!selectedProducts[product.id]}
                        onSelect={handleSelectProduct}
                        onQuantityChange={(quantity) => 
                        setSelectedProducts(prev => ({
                            ...prev,
                            [product.id]: { ...prev[product.id], quantity }
                        }))
                        }
                        user={user}
                    />
                    ))}
                </tbody>
                </table>
            </div>

            {/* Пагинация */}
            <Pagination 
                meta={initialProducts.meta}
                getPageUrl={(page) => {
                const params = new URLSearchParams(searchParams);
                params.set('page', page.toString());
                return `?${params.toString()}`;
                }}
            />
        </div>
    );
}};