// resources/js/Pages/ProductTable.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import { IProductsResponse, IProduct, TSecondLevel } from '@/Types/types';
import { formatPrice } from '@/Utils/priceFormatter';
import useAppContext from '@/Hooks/useAppContext';
import { ProductTableRow } from '@/Components/ProductOrderTable/ProductTableRow';
import { ICategoryMenuItem } from '@/Types/types';
import { Link } from '@inertiajs/react';
import { ICategoryItemFromDB } from '@/Types/types';
import { Pagination } from '@/Components/Pagination';
import { CompactPagination } from '@/Components/CompactPagination';
import { useUserDataContext } from '@/Hooks/useUserDataContext';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
import MainLayout from '@/Layouts/MainLayout';
import { Helmet } from 'react-helmet';
import { TableQuantityControl } from '@/Components/ProductOrderTable/TableQuantityControl';

interface ProductTableProps {
    title: string;
    robots: string;
    description: string;
    keywords: string;
    catalogCategoryName: string;
    catalogCategoryTitleImg: string;
    catName: string;
    catDescription: string;
    products: IProductsResponse;        // Добавляем продукты - products обязателен — это не просто массив, а объект с пагинацией...
    filters?: Record<string, string>;   // Добавляем фильтры
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

const ProductTable: React.FC<ProductTableProps> = ({
    title,
    robots,
    description,
    keywords,
    catalogCategoryName,
    catalogCategoryTitleImg,
    catName,
    catDescription,
    products = defaultProducts,
    filters = {},
    sortBy = 'actual_price',
    sortOrder = 'asc',
    search: initialSearch = '',
    searchType: initialSearchType = 'article',
    categoryId,
    categoryInfo,
}) => {

    // Инициализируем состояние из пропсов (которые приходят из URL через Inertia)
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [searchType, setSearchType] = useState<'article' | 'title'>(initialSearchType);

    // Синхронизация при изменении URL (если пользователь нажимает "Назад")
    useEffect(() => {
        setSearchTerm(initialSearch);
        setSearchType(initialSearchType);
    }, [initialSearch, initialSearchType]);

    const { user, categoriesMenuArr } = useAppContext();
    const { cart, addToCart, updateCart, addToFavorites, removeFromCart, clearCart } = useUserDataContext();
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Фильтрация товаров (при выборе "Предзаказ"): (на будущее)
    /*const filteredProducts = actionType === 'preorder' 
        ? products.data.filter(p => p.on_preorder > 0)
        : products.data;
    */

    const handleSearch = () => {
        const params = {
            page: 1, // Всегда сбрасываем на первую страницу
            perPage: products.meta.per_page,
            sortBy,
            sortOrder,
            search: searchTerm.trim(),
            searchType
        };
        
        router.get('/profile/products-table', params, {
            preserveScroll: true,
            preserveState: true
        });
    };

    // console.log('categoriesMenuArr', categoriesMenuArr);
    // console.log('products.meta.per_page', products.meta.per_page);

    // Функция для получения плоского списка основных категорий
    const getMainCategories = () => {
        const mainCategories: ICategoryMenuItem[] = [];
        if (!categoriesMenuArr) return mainCategories; // ранний возврат если null
        
        // Проходим по всем брендам (NoName, unihoc, zone и т.д.)
        Object.values(categoriesMenuArr).forEach(brandCategories => {
            // Проходим по категориям первого уровня (1, 2, 3 и т.д.)
            Object.values(categoriesMenuArr).forEach((brandCategories: TSecondLevel) => {
                Object.values(brandCategories).forEach((categoryGroup: Record<number, ICategoryMenuItem>) => {
                    if (categoryGroup[0]) {
                        mainCategories.push(categoryGroup[0]);
                    }
                });
            });
        });

        // Удаляем дубликаты (если категории повторяются между брендами)
        return mainCategories.filter(
            (category, index, self) =>
            index === self.findIndex(c => c.id === category.id)
        );
    };

    const [mainCategories, setMainCategories] = useState<ICategoryMenuItem[]>([]);

    useEffect(() => {
        setMainCategories(getMainCategories());
    }, [categoriesMenuArr]);

    // console.log(getMainCategories());
    // console.log('products', products);
    // console.log('cart', cart);

    // Сохраняем позицию прокрутки перед обновлением
    useEffect(() => {
        const handleBeforeUnload = () => {
            sessionStorage.setItem('scrollPos', window.scrollY.toString());
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // Восстанавливаем позицию прокрутки после загрузки
    useEffect(() => {
        const savedScrollPos = sessionStorage.getItem('scrollPos');
        if (savedScrollPos) {
            window.scrollTo(0, parseInt(savedScrollPos));
        }
    }, []);

    /*const handleCategorySelect = (categoryId: number) => {
        // Закрываем dropdown после выбора
        setIsDropdownOpen(false);
        
        // Если выбрано "Все категории"
        if (categoryId === 0) {
            router.get('/profile/products-table');
            return;
        }

        // Ищем выбранную категорию в mainCategories
        const selectedCat = mainCategories.find(c => c.id === categoryId);
        
        if (selectedCat) {
            console.log('selectedCat', selectedCat);
            
            // Здесь можно добавить дополнительные параметры запроса, если нужно
            router.get('/profile/products-table', { 
                category: selectedCat.url_semantic,
                page: products.meta.current_page.toString()
                // Другие параметры...
            });
        }
    };*/

    const handleCategorySelect = (categoryId: number) => {
        const params = {
            category: mainCategories.find(c => c.id === categoryId)?.url_semantic,
            page: 1, // Сбрасываем на первую страницу при смене категории
            sortBy,
            sortOrder,
            perPage: products.meta.per_page
        };

        router.get('/profile/products-table', params, {
            preserveScroll: true
        });
    };

    // Добавляем состояние для количества товара в поле "выбранное количество" для корзины/предзаказа
    const [quantities, setQuantities] = useState<Record<number, number>>({});
  
    // При монтировании компонента
    useEffect(() => {
        if (cart) {
            const initialQuantities = products.data.reduce((acc, product) => {
            if (cart[product.id] && product.on_sale) {
                acc[product.id] = Math.min(cart[product.id], product.on_sale);
            }
            return acc;
            }, {} as Record<number, number>);
            setQuantities(initialQuantities);
        }
    }, [cart, products.data]);

    const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = {
            category: categoryInfo?.url_semantic,
            page: products.meta.current_page.toString(),
            sortBy,
            sortOrder: e.target.value,
            perPage: products.meta.per_page
        };

        router.get('/profile/products-table', params, {
            preserveScroll: true
        });

        /*const newSortOrder = e.target.value;

        const url = new URL(window.location.href);
        url.searchParams.set('sortOrder', newSortOrder);
        url.searchParams.set('page', products.meta.current_page.toString()); // Добавляем текущую страницу

        window.location.href = url.toString();*/
    };

    const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        /*const params = {
            perPage: e.target.value,
            sortBy,       // сохраняем текущую сортировку
            sortOrder,    // сохраняем направление сортировки
            category: categoryInfo?.url_semantic, // сохраняем категорию
            page: 1       // обычно сбрасываем на первую страницу
        };

        router.get('/profile/products-table', params, {
            preserveScroll: true
        });*/

        router.get('/profile/products-table', 
            getCommonParams({
                perPage: e.target.value,
                page: 1
            }), 
            { preserveScroll: true }
        );
    };

    // Функция формирования общих параметров
    const getCommonParams = (additionalParams = {}) => ({
        perPage: products.meta.per_page,
        sortBy,
        sortOrder,
        category: categoryInfo?.url_semantic,
        ...additionalParams
    });

    // ДЕЛАЕМ ПАГИНАЦИЮ внизу таблицы:

    // Получаем текущие query-параметры из URL
    const { url } = usePage();
    // console.log('url:', url); // Отладочное сообщение: url: /products/sticks?page=9&sortBy=actual_price&sortOrder=desc

    // Создаем абсолютный URL на основе текущего местоположения
    const absoluteUrl = new URL(window.location.origin + url);
    // console.log('absoluteUrl:', absoluteUrl); // Отладочное сообщение: absoluteUrl: объект: URL {origin: 'http://127.0.0.1:8000', protocol: 'http:', username: '', password: '', host: '127.0.0.1:8000', …}

    const searchParams = new URLSearchParams(absoluteUrl.search);
    // console.log('Object.fromEntries(searchParams.entries()):', Object.fromEntries(searchParams.entries())); // Отладочное сообщение: Object.fromEntries(searchParams.entries()): {hook[0]: 'neutral'}

    // Функция для формирования URL с учетом параметров сортировки
    const getPageUrl = (page: number | string) => {
        const params = new URLSearchParams({
            ...Object.fromEntries(searchParams.entries()), // Передаем все существующие параметры 
            page: page.toString(),
        });

        return `?${params.toString()}`;
    };

    return (
        <MainLayout>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords} />
                <meta name="robots" content={robots} />
            </Helmet>

            <div className="order-table-container">
                
                {/* Панель управления */}
                <div className="d-flex flex-sb aline-items-center">
                    <h1 className="h1-tablename">Товарный ассортимент</h1>
                    <Link href="/products/catalog"><button className="order-confirmation__submit-btn w-110px primary">Вернуться в главное меню</button></Link>
                </div>
                
                <div className="table-controls">
                    
                    {/* Селект количества строк */}
                    <div className="pagination">
                        <select 
                        value={products.meta.per_page} 
                        onChange={handlePerPageChange}
                        >
                        {[10, 25, 50, 100, 250, 500].map(size => (
                            <option key={size} value={size}>Смотрим по {size} строк</option>
                        ))}
                        <option value={products.meta.total}>Показать все</option>
                        </select>
                    </div>

                    {/* Компактная пагинация */}
                    <CompactPagination 
                        meta={products.meta}
                        getPageUrl={getPageUrl}
                    />

                    {/* Сортировка и поиск */}
                    <select className="text-align-left"
                        value={sortOrder}
                        onChange={handleOrderChange}
                    >
                        <option value="asc"> ▲ по возрастанию цены</option> 
                        <option value="desc"> ▼ по убыванию цены</option>
                    </select>
                </div>

                <div className="user-productTable__nav-bar">
                    <div className="select_user-lk">
                        <a 
                            href="#" 
                            className="slct__user-lk" 
                            onClick={(e) => {
                                e.preventDefault();
                                setIsDropdownOpen(!isDropdownOpen);
                            }}
                        >
                            {categoryId === null 
                                ? 'Показаны товары всех категорий' 
                                : `Выбрана категория: ${categoryInfo !== undefined && (categoryInfo.category_view)}`
                            }
                        </a>
                        
                        {isDropdownOpen && (
                            <>
                                <ul className="drop__user-lk">
                                    <li>
                                        <a 
                                            href="#" 
                                            data-category="0" 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleCategorySelect(0);
                                            }}
                                        >
                                            Выбрать все категории
                                        </a>
                                    </li>
                                    {mainCategories.length > 0 ? (
                                        mainCategories.map((category) => (
                                            <li key={category.id}>
                                            <a 
                                                href="#" 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleCategorySelect(category.id || 0);
                                                }}
                                            >
                                                {category.category_view?.toLowerCase() || category.category?.toLowerCase()}
                                            </a>
                                            </li>
                                        ))
                                        ) : (
                                        <li>Категории не найдены</li>
                                        )}
                                </ul>
                            </>
                        )}
                    </div>
                </div>

                <div className="search-controls">
                    <span className='pagination-info'>Поиск </span>
                    <select 
                    value={searchType}
                    onChange={(e) => {
                        setSearchType(e.target.value as 'article' | 'title');
                        // Можно автоматически запускать поиск при смене типа
                        if (searchTerm) handleSearch();
                    }}
                    className="search-type-select"
                    >
                    <option value="article">По артикулу</option>
                    <option value="title">По названию</option>
                    </select>
                    
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder={searchType === 'article' 
                            ? 'Например: 24051' 
                            : 'Например: клюшка unihoc 36mm'}
                        className="search-input"
                    />
                    
                    <button 
                    onClick={handleSearch}
                    disabled={!searchTerm.trim()}
                    className="search-button"
                    >
                    Найти
                    </button>
                    
                    {/* Индикация активного поиска: */}
                    {searchTerm && (
                        <div className="active-search-info">
                            Поиск {searchType === 'article' ? 'по артикулу' : 'по названию'}:&nbsp; 
                            <strong>{searchTerm}</strong>
                        </div>
                    )}

                    {(searchTerm || searchType !== 'article') && (
                        <button 
                            onClick={() => {
                                setSearchTerm('');
                                setSearchType('article');
                                router.get('/profile/products-table', {
                                    page: 1,
                                    perPage: products.meta.per_page,
                                    sortBy,
                                    sortOrder
                                });
                            }}
                            className="clear-search-button"
                        >
                            Сбросить
                        </button>
                    )}
                </div>
                
                <div className="user-lk__scroll-table">
                    <table>
                        <thead>
                            <tr>
                                <th title="Изображение товара">Фото</th>  
                                <th>Наименование</th>
                                <th title="Рекомендованная розничная цена">РРЦ</th>
                                <th>Цена</th>
                                <th>В продаже</th>
                                <th>
                                    <div className="action-header">
                                        <select 
                                        value="cart" 
                                        onChange={(e) => {}}
                                        className="action-select"
                                        disabled // Пока не реализовано
                                        >
                                        <option value="cart">В корзину</option>
                                        <option value="preorder">Предзаказ</option>
                                        </select>
                                    </div>
                                </th>
                                {/* <th>Действие</th> */}
                                <th title="На нашем складе">Склад</th>
                                <th title="Зарезервировано">Резерв</th>
                                <th title="Доступно для предзаказа">Предзаказ</th>
                                <th title="Ожидаемая дата поставки на склад продавца">Поставка</th>
                                <th>Артикул</th>
                                <th className="hide-column">id</th>
                                <th>Бренд</th>
                                <th>№</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.data.map((product, index) => (
                                <tr key={product.id}>
                                    <td className="table-img">
                                        <img 
                                            src={`/storage/${product.img_link}`} 
                                            alt={product.title} 
                                            title={product.title} 
                                        />
                                    </td>  
                                    <td>
                                        <a href={`/products/card/${product.prod_url_semantic}/`}>
                                            {product.title}
                                        </a>
                                    </td>  
                                    <td>
                                        <input 
                                            type="text" 
                                            readOnly 
                                            className="td-right user-productTable__input-price user-productTable__targetInput-priceCorrection" 
                                            name="regularPrice" 
                                            value={product.price_regular && formatPrice(product.price_regular)}
                                        />
                                    </td>
                                    <td className="td-right">
                                        {(product.price_actual ?? 0) < (product.price_regular ?? 0) ? (
                                            <>
                                                <div className="color-red margin-bottom8px">
                                                    {formatPrice(product.price_actual ?? 0)}&nbsp;<sup>&#8381;</sup>
                                                </div>
                                                <div className="cardProduct-priceDiscountInPercentage nobr">
                                                    -&nbsp;{Math.ceil(100 - ((product.price_actual ?? 0) / (product.price_regular ?? 1) * 100))}%
                                            </div>
                                            </>
                                        ) : (
                                            <div>
                                                {formatPrice((product.price_regular ?? 0))}&nbsp;<sup>&#8381;</sup>
                                            </div>
                                        )}
                                    </td>
                                    
                                    <td className="td-center">{product.on_sale}</td>
                                    <td>
                                        <TableQuantityControl
                                            prodId={product.id}
                                            prodTitle={ product.title }
                                            value={quantities[product.id] || 0}
                                            on_sale={product.on_sale ?? 0}
                                            updateCart={ updateCart }
                                            addToFavorites={ addToFavorites }
                                            removeFromCart={ removeFromCart }
                                        />
                                    </td>
                                   
                                    <td>{product.in_stock}</td>
                                    <td>{product.reserved}</td>
                                    <td>{product.on_preorder}</td>
                                    <td>{product.expected_receipt_date}</td>
                                    <td>{product.article}</td>
                                    <td className="hide-column">{product.id}</td>
                                    <td>{product.brand}</td>
                                    <td id="numberoflines">{index + 1}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination 
                    meta={products.meta}
                    getPageUrl={getPageUrl}
                    products={products}
                />
            </div>
        </MainLayout> 
    );
};

export default ProductTable;