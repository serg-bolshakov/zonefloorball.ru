// resources/js/Components/Admin/Documents/ProductSelector.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface IProductSelectorProps {
    onProductSelect: (product: any) => void;
}

export const ProductSelector: React.FC<IProductSelectorProps> = ({ onProductSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'search' | 'categories'>('search');

    // Загружаем категории при монтировании
    useEffect(() => {
        loadCategories();
    }, []);

    // Загружаем товары категории при выборе категории
    useEffect(() => {
        if (selectedCategory) {
            loadCategoryProducts(selectedCategory);
        }
    }, [selectedCategory]);

    const loadCategories = async () => {
        try {
            const response = await axios.get('/api/categories');
            // console.log(response.data);
            setCategories(response.data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadCategoryProducts = async (categoryId: number) => {
        try {
            const response = await axios.get(`/api/categories/${categoryId}/products`);
            console.log('categoryProducts', response.data);
            setCategoryProducts(response.data);
        } catch (error) {
            console.error('Error loading category products:', error);
        }
    };

    const searchProducts = async (term: string) => {
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await axios.get('/api/products/search', {
                params: { q: term }
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    // Фильтруем категории до рендера
    const categoriesWithProducts = categories.filter(category => category.products_count > 0);

    

    return (
        <div className="product-selector">
            <h3>Добавить товар</h3>
            
            {/* Табы: Поиск / Категории */}
            <div className="product-selector__tabs">
                <button 
                    className={`tab ${activeTab === 'search' ? 'tab--active' : ''}`}
                    onClick={() => setActiveTab('search')}
                >
                    🔍 Поиск
                </button>
                <button 
                    className={`tab ${activeTab === 'categories' ? 'tab--active' : ''}`}
                    onClick={() => setActiveTab('categories')}
                >
                    📁 По категориям
                </button>
            </div>

            {/* Контент табов */}
            <div className="product-selector__content">
                {activeTab === 'search' && (
                    <div className="search-tab">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Поиск по артикулу или названию..."
                                value={searchTerm}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSearchTerm(value);
                                    searchProducts(value);
                                }}
                                className="search-input"
                            />
                        </div>

                        <div className="search-results">
                            {searchResults.map(product => (
                                <div 
                                    key={product.id} 
                                    className="search-result-item"
                                    onClick={() => {
                                        onProductSelect(product);
                                        setSearchTerm('');
                                        setSearchResults([]);
                                    }}
                                >
                                    <div className="product-info">
                                        <strong>{product.article}</strong> - {product.title}
                                    </div>
                                    <div className="product-meta">
                                        {product.cost_price > 0 ? (
                                            <>
                                                📊 Себестоимость: <strong>{product.cost_price} руб.</strong>
                                            </>
                                        ) : (
                                            <>
                                                ⚠️ Себестоимость: <strong>не установлена</strong>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="categories-tab">
                        {/* Список категорий */}
                        <div className="categories-list">
                            {categoriesWithProducts.map(category => (
                                <div
                                    key={category.id}
                                    className={`category-item ${selectedCategory === category.id ? 'category-item--active' : ''}`}
                                    onClick={() => setSelectedCategory(category.id)}
                                >
                                    {category.category_view_2}
                                    {category.products_count && (
                                        <span className="category-count margin-left8px">({category.products_count})</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Товары выбранной категории */}
                        {selectedCategory && (
                            <div className="category-products">
                                <h4>Товары категории</h4>
                                <div className="products-grid">
                                    {categoryProducts.map(product => (
                                        <div
                                            key={product.id}
                                            className="product-card"
                                            onClick={() => onProductSelect(product)}
                                        >
                                            <div className="product-card__article">{product.article}</div>
                                            <div className="product-card__title">{product.title}</div>
                                            <div className="product-card__price">
                                                {product.cost_price || 0} руб.
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};