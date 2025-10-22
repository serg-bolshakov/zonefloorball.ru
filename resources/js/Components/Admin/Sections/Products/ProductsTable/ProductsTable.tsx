// resources/js/Components/Admin/Sections/Products/ProductsTable/ProductTable.tsx

import React, { useState, useEffect, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import { IProductsResponse, IProduct, TSecondLevel, IPrice } from '@/Types/types';
import { formatPrice } from '@/Utils/priceFormatter';
import useAppContext from '@/Hooks/useAppContext';
import { ICategoryMenuItem } from '@/Types/types';
import { Link } from '@inertiajs/react';
import { ICategoryItemFromDB } from '@/Types/types';
import { Pagination } from '@/Components/Pagination';
import { CompactPagination } from '@/Components/CompactPagination';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
import MainLayout from '@/Layouts/MainLayout';
import { ProductPricesEditor } from '../ProductPricesEditor';

interface ProductsTableProps {
    products: IProductsResponse;        // Добавляем продукты - products обязателен — это не просто массив, а объект с пагинацией...
    sortBy?: string;
    sortOrder?: string;
    search: string;
    searchType: 'article' | 'id' | 'title';    
    categoryId?: number | null;
    categoryInfo?: ICategoryItemFromDB;
    onStatusChange: (orderId: number, newStatus: number) => void;
    onPricesChange: (productId: number, newPrices: IPrice[]) => void;
    onRowClick: (orderId: number) => void;
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

export const ProductsTable: React.FC<ProductsTableProps> = ({
    products = defaultProducts,
    sortBy = 'actual_price',
    sortOrder = 'asc',
    search: initialSearch = '',
    searchType: initialSearchType = 'article',
    categoryId,
    categoryInfo,
    onPricesChange
}) => {

    // Инициализируем состояние из пропсов (которые приходят из URL через Inertia)
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [searchType, setSearchType] = useState<'article' | 'id' | 'title'>(initialSearchType);

    const [selectedAction, setSelectedAction] = useState<string>('');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
    
    const searchInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchType]);

    // Синхронизация при изменении URL (если пользователь нажимает "Назад")
    useEffect(() => {
        setSearchTerm(initialSearch);
        setSearchType(initialSearchType);
    }, [initialSearch, initialSearchType]);

    const { categoriesMenuArr } = useAppContext();
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = () => {
        // Дополнительная валидация
        if (searchType === 'id' && !/^\d+$/.test(searchTerm.trim())) {
            alert('Для поиска по ID введите только цифры');
            return;
        }
        const params = {
            page: 1, // Всегда сбрасываем на первую страницу
            perPage: products.meta.per_page,
            sortBy,
            sortOrder,
            search: searchTerm.trim(),
            searchType
        };
        
        router.get('/admin/products-table', params, {
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

    const handleCategorySelect = (categoryId: number) => {
        const params = {
            category: mainCategories.find(c => c.id === categoryId)?.url_semantic,
            page: 1, // Сбрасываем на первую страницу при смене категории
            sortBy,
            sortOrder,
            perPage: products.meta.per_page
        };

        router.get('/admin/products-table', params, {
            preserveScroll: true
        });
    };

    const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = {
            category: categoryInfo?.url_semantic,
            page: products.meta.current_page.toString(),
            sortBy,
            sortOrder: e.target.value,
            perPage: products.meta.per_page
        };

        router.get('/admin/products-table', params, {
            preserveScroll: true
        });
    };

    const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get('/admin/products-table', 
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

    const webpPath = (imagePath: string) => {return imagePath.replace(/\.(jpg|png)$/, '.webp')};

    // Вспомогательная функция вывода даты в поле "Ожидаемая дата поступления товаров на склад продавца" в читабельном формате...
    const getDisplayDate = (expectedDate: string | null | undefined, inNumberDays: number = 3) => {
        if (expectedDate) return new Date(expectedDate).toLocaleDateString();
        
        // Добавляем количество требуемых дней к текущей дате
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + inNumberDays);
        return futureDate.toLocaleDateString();
    };

    const handleActionChange = (action: string, product: IProduct) => {
       
        setSelectedAction(action);
               
        switch (action) {
            case 'product_status':
                setShowStatusModal(true);
                break;
            case 'price_correction':
                setEditingProduct(product); // Сохраняем товар для редактирования
                break;
            case 'prod_edition':
                // Открываем модалку для редактирования свойств товара (наименования, описания)
                break;
            case 'img_correction':
                // Открываем модалку для добавления / удаления изображений товара
                break;
            case 'video_correction':
                // Открываем модалку для добавления / удаления видео в описание товара
                break;
            case 'prod_creation_copy':
                // Открываем модалку для создания в БД похожего товара (с полями для данных, которые должны быть отличными от оригинального товара: артикул - обязательно, цвет или размер в зависимости от категории товара)
                break;
        }
        
        // Сбрасываем селект после выбора
        setTimeout(() => setSelectedAction(''), 100);
    };

    return (
        <div className="order-table-container">
            
            {/* Панель управления */}
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
                        setSearchType(e.target.value as 'article' | 'id' | 'title');
                        // setTimeout(() => document.querySelector('.search-input')?.focus(), 0);
                        if (searchTerm) handleSearch();
                    }}
                    className="search-type-select"
                >
                    <option value="article">По артикулу</option>
                    <option value="id">По ID</option>
                    <option value="title">По названию</option>
                </select>
                
                <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={searchType === 'article' 
                        ? 'Например: 24051' 
                        : searchType === 'id'
                        ? 'Например: 12345'
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
                        Поиск {searchType === 'article' 
                            ? 'по артикулу' 
                            : searchType === 'id' 
                            ? 'по ID' 
                            : 'по названию'}:&nbsp;
                        <strong>{searchTerm}</strong>
                    </div>
                )}

                {(searchTerm || searchType !== 'article') && (
                    <button 
                        onClick={() => {
                            setSearchTerm('');
                            setSearchType('article');
                            router.get('/admin/products-table', {
                                page: 1,
                                perPage: products.meta.per_page,
                                sortBy,
                                sortOrder,
                                preserveScroll: true,
                                preserveState: true
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
                            <th title="Наименование товара">Наименование</th> 
                            <th>Остаток</th>
                            <th title="Рекомендованная розничная цена, Основная цена (price_regular)">РРЦ</th>
                            <th title="Акционная цена (price_special)">Акция</th>
                            <th title="Цена предзаказа (price_preorder)">Предзаказ</th>
                            <th title="Артикульный номер товара">Артикул</th>
                            <th className="hide-column">id</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.data.map((product) => (
                            <tr key={product.id}>
                                <td className="table-img">
                                    <Link href={`/products/card/${product.prod_url_semantic}/`}>
                                        <picture>
                                            <source srcSet={webpPath(`/storage/${product.img_link}`)} type="image/webp" />
                                            <img 
                                                src={`/storage/${product.img_link}`} 
                                                alt={product.title} 
                                                title={`По клику на изображение, переход в карточку товара: ${product.title}`}
                                            />  
                                        </picture>
                                        
                                    </Link>
                                </td>  
                                <td>
                                    <Link href={`/products/card/${product.prod_url_semantic}/`}>
                                        {product.title}
                                    </Link>
                                </td>  
                                <td className="td-center">{product.in_stock}</td>
                                <td className="td-right"> {formatPrice((product.price_regular ?? 0))}&nbsp;<sup>&#8381;</sup></td>
                                <td className="td-right">
                                    {product.price_special ? (
                                        <div className='d-flex flex-column'>
                                            <p className="color-red margin-bottom8px">
                                                {formatPrice(product.price_special)}&nbsp;<sup>&#8381;</sup>
                                            </p>
                                            {(product.special_price_date_start || product.special_price_date_end) && (
                                                <p>
                                                    действует&nbsp;
                                                    {product.special_price_date_start && `с ${getDisplayDate(product.special_price_date_start)}`}
                                                    {product.special_price_date_start && product.special_price_date_end && ' '}
                                                    {product.special_price_date_end && `до ${getDisplayDate(product.special_price_date_end)}`}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div>-</div>
                                    )}
                                </td>
                                <td  className="td-right">
                                    {(product.price_preorder && product.preorder_price_date_end) ? 
                                        (
                                            <div className='d-flex flex-column'>
                                                <p  className="color-green margin-bottom8px">{formatPrice(product.price_preorder)}&nbsp;<sup>&#8381;</sup></p>
                                                <p> действует до&nbsp;{getDisplayDate(product.preorder_price_date_end)}</p>
                                            </div>
                                        ) : ( 
                                                product.price_preorder ? (
                                                <>{product.price_preorder}</>
                                        ) : (
                                            <div>-</div>
                                        )
                                    )}
                                </td>
                                <td  className="td-right">{product.article}</td>
                                <td className="hide-column td-right">{product.id}</td>
                                <td  className="td-left" onClick={(e) => e.stopPropagation()}>
                                    <select 
                                        value={selectedAction}
                                        onChange={(e) => handleActionChange(e.target.value, product)} // ← передаем product
                                        className="admin-action-select"
                                        >
                                        <option value="">+</option>
                                        <option className="td-left" value="product_card">👁️ Просмотр карточки</option>
                                        <option className="td-left" value="product_status">Изменить статус</option>
                                        <option className="td-left" value="price_correction">✏️ Редактирование цен</option>
                                        <option className="td-left" value="prod_edition">Редактировать карточку</option>
                                        <option className="td-left" value="img_correction">🖼️ Изображения - управление фотографиями</option>
                                        <option className="td-left" value="video_correction">▶️ Видео - добавление/удаление</option>
                                        <option className="td-left" value="prod_creation_copy">♻️ Копировать - создать новый товар</option>
                                    </select>
                                    {/* Модальное окно изменения статуса */}
                                    {/* {showStatusModal && (
                                        <ProductStatusChanger
                                            product={product}
                                            currentStatus={product.product_status_id}
                                            onStatusChange={handleStatusChange}
                                            onClose={() => setShowStatusModal(false)}
                                        />
                                    )}*/}
                                     {/* Модальное окно редактирования цен товара */}
                                    {editingProduct && editingProduct.id === product.id && (
                                        <ProductPricesEditor
                                            product={editingProduct}
                                            onPricesChange={onPricesChange}
                                            onClose={() => setEditingProduct(null)}
                                        />
                                    )}
                                </td>
                            </tr>
                            )
                        )}
                    </tbody>    
                </table>
            </div>

            <Pagination 
                meta={products.meta}
                getPageUrl={getPageUrl}
                products={products}
            />
        </div>
    );
};

export default ProductsTable;