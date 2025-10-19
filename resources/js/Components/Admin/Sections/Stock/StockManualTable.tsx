// resources/js/Components/Admin/Sections/Stock/StockManualTable.tsx
import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { CompactPagination } from '@/Components/CompactPagination';

// Используем ваш готовый компонент пагинации и поиска!
//import { CompactPagination } from '@/Components/UI/Pagination/CompactPagination'; 
// Или там, где у вас он лежит

export interface IProductStockReport {
    id: number;
    article: string;
    in_stock: number;
    on_preorder: number;
    on_sale: number;
    preordered: number;
    reserved: number; 
    title: string; 
}

export interface IAdminChangeStockQuantityProductsResponse {
    // data: IProduct[]; // Массив товаров
    data: IProductStockReport[]; // Массив товаров
    
    // links: {
    //     first: string | null;
    //     last : string | null;
    //     prev : string | null;
    //     next : string | null;
    // };
    
    first_page_url: string | null;
    last_page_url : string | null;    
    next_page_url : string | null; 
    prev_page_url : string | null;
    
    current_page  : number;
    from          : number;
    last_page     : number;
    path          : string;
    per_page      : number;
    to            : number;
    total         : number;
    links         : [{ url: string | null; label: string; active: boolean }]; 
    
    // meta не используется в нашем случае, но без этого блока TS ругается, что IProductResponse требует... но всё равно потом ругается, если пагинацию внизу таблицы активировать... всё будет работать корректно, но ошибка типизации будет высвечиваться
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
}

interface IManualTableProps {
    products: IAdminChangeStockQuantityProductsResponse;        // Добавляем продукты - products обязателен — это не просто массив, а объект с пагинацией...
    search: string;
    searchType: 'article' | 'title';    
    handleEditStart: (id: number, field: keyof IProductStockReport, value: number) => void ; 
    handleSave: (id: number, field: keyof IProductStockReport) => void;
    editingId: number | null;
    editField: string | null;
    editValue: string;
    onEditValueChange: (value: string) => void;
}

const defaultProducts: IAdminChangeStockQuantityProductsResponse = {
    data: [],
   
    first_page_url: null,
    last_page_url : null,    
    next_page_url : null, 
    prev_page_url : null,

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

export const StockManualTable: React.FC<IManualTableProps> = ({
    products = defaultProducts,
    search: initialSearch = '',
    searchType: initialSearchType = 'article',
    handleEditStart,
    handleSave,
    editingId,
    editField,
    editValue,
    onEditValueChange
}) => {
     // Инициализируем состояние из пропсов (которые приходят из URL через Inertia)
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [searchType, setSearchType] = useState<'article' | 'title'>(initialSearchType);

    // Синхронизация при изменении URL (если пользователь нажимает "Назад")
    useEffect(() => {
        setSearchTerm(initialSearch);
        setSearchType(initialSearchType);
    }, [initialSearch, initialSearchType]);   

    const handleSearch = () => {
        const params = {
            page: 1, // Всегда сбрасываем на первую страницу
            perPage: products.per_page,
            search: searchTerm.trim(),
            searchType
        };
        
        router.get('/admin/stock-manual', params, {
            preserveScroll: true,
            preserveState: true
        });
    };

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

    const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            router.get('/admin/stock-manual', 
                getCommonParams({
                    perPage: e.target.value,
                    page: 1
                }), 
                { preserveScroll: true }
            );
        };
    
    // Функция формирования общих параметров
    const getCommonParams = (additionalParams = {}) => ({
        perPage: products.per_page,
        ...additionalParams
    });
    
    // Получаем текущие query-параметры из URL
    const { url } = usePage();
    
    // Создаем абсолютный URL на основе текущего местоположения
    const absoluteUrl = new URL(window.location.origin + url);
    
    const searchParams = new URLSearchParams(absoluteUrl.search);
    
    // Функция для формирования URL с учетом параметров сортировки
    const getPageUrl = (page: number | string) => {
        const params = new URLSearchParams({
            ...Object.fromEntries(searchParams.entries()), // Передаем все существующие параметры 
            page: page.toString(),
        });

        return `?${params.toString()}`;
    };

    return (
        <>
            {/* 1. Панель управления */}
            <div className="table-controls">                   
                {/* Селект количества строк */}
                <div className="pagination">
                    <select 
                    value={products.per_page} 
                    onChange={handlePerPageChange}
                    >
                    {[10, 25, 50, 100, 250, 500].map(size => (
                        <option key={size} value={size}>Смотрим по {size} строк</option>
                    ))}
                    <option value={products.total}>Показать все</option>
                    </select>
                </div>

                {/* Компактная пагинация */}
                <CompactPagination 
                    meta={products}
                    getPageUrl={getPageUrl}
                />
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
                            router.get('/admin/stock-manual', {
                                page: 1,
                                perPage: products.per_page,
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

            {/* 2. Таблица с остатками */}
            <div className="admin__scroll-table">
                <table className="document-table">
                    <thead>
                        <tr>
                            <th>Артикул</th>
                            <th>Товар</th>
                            <th>На складе</th>
                            <th>В продаже</th>
                            <th>В резерве</th>
                            <th>В предзаказе</th>
                            <th>Предзаказано</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.data.map((product) => (
                            <tr key={product.id}>
                                {/* Ячейки с inline-редактированием */}
                                <td className="td-right">{product.article}</td>
                                <td>{product.title}</td>
                                <td className="td-right"
                                    onClick={() => handleEditStart(product.id, 'in_stock', product.in_stock)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {editingId === product.id && editField === 'in_stock' ? (
                                        <input
                                        type="number"
                                        min="0"
                                        value={editValue}
                                        onChange={(e) => onEditValueChange(e.target.value)}
                                        onBlur={() => handleSave(product.id, 'in_stock')}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSave(product.id, 'in_stock')}
                                        autoFocus
                                        />
                                    ) : (
                                        product.in_stock
                                    )}
                                </td>
                                <td className="td-right"
                                    onClick={() => handleEditStart(product.id, 'on_sale', product.on_sale)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {editingId === product.id && editField === 'on_sale' ? (
                                        <input
                                        type="number"
                                        min="0"
                                        value={editValue}
                                        onChange={(e) => onEditValueChange(e.target.value)}
                                        onBlur={() => handleSave(product.id, 'on_sale')}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSave(product.id, 'on_sale')}
                                        autoFocus
                                        />
                                    ) : (
                                        product.on_sale
                                    )}
                                </td>
                                <td className="td-right"
                                    onClick={() => handleEditStart(product.id, 'reserved', product.reserved)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {editingId === product.id && editField === 'reserved' ? (
                                        <input
                                        type="number"
                                        min="0"
                                        value={editValue}
                                        onChange={(e) => onEditValueChange(e.target.value)}
                                        onBlur={() => handleSave(product.id, 'reserved')}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSave(product.id, 'reserved')}
                                        autoFocus
                                        />
                                    ) : (
                                        product.reserved
                                    )}
                                </td>
                                <td className="td-right"
                                    onClick={() => handleEditStart(product.id, 'on_preorder', product.on_preorder)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {editingId === product.id && editField === 'on_preorder' ? (
                                        <input
                                        type="number"
                                        min="0"
                                        value={editValue}
                                        onChange={(e) => onEditValueChange(e.target.value)}
                                        onBlur={() => handleSave(product.id, 'on_preorder')}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSave(product.id, 'on_preorder')}
                                        autoFocus
                                        />
                                    ) : (
                                        product.on_preorder
                                    )}
                                </td>
                                <td className="td-right"
                                    onClick={() => handleEditStart(product.id, 'preordered', product.preordered)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {editingId === product.id && editField === 'preordered' ? (
                                        <input
                                        type="number"
                                        min="0"
                                        value={editValue}
                                        onChange={(e) => onEditValueChange(e.target.value)}
                                        onBlur={() => handleSave(product.id, 'preordered')}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSave(product.id, 'preordered')}
                                        autoFocus
                                        />
                                    ) : (
                                        product.preordered
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* <Pagination 
                meta={products}
                getPageUrl={getPageUrl}
                products={products}
            /> */}
        </>
    );
};