// resources/js/Pages/Catalog.tsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import NavBarBreadCrumb from '../Components/NavBarBreadCrumb';
import MainLayout from '../Layouts/MainLayout';
import { IProductsResponse } from '../Types/types';
import AsideAccordionAll from '../Components/Catalog/AsideAccordionAll';
import AsideSticksWithFilters from '@/Components/Catalog/AsideSticksWithFilters';
import AsideBladesWithFilters from '@/Components/Catalog/AsideBladesWithFilters';
import AsideBallsWithFilters from '@/Components/Catalog/AsideBallsWithFilters';
import AsideBagsWithFilters from '@/Components/Catalog/AsideBagsWithFilters';
import AsideGripsWithFilters from '@/Components/Catalog/AsideGripsWithFilters';
import AsideEyewearsWithFilters from '@/Components/Catalog/AsideEyewearsWithFilters';
import AsideGoalieWithFilters from '@/Components/Catalog/AsideGoalieWithFilters';
import AssortimentCards from '../Components/AssortimentCards';
import { Inertia, Method } from '@inertiajs/inertia';
import { CompactPagination } from '@/Components/CompactPagination';
import { router } from '@inertiajs/react';
import { Link, usePage } from '@inertiajs/react';
import { ICategoryItemFromDB } from '../Types/types';
// import axios from 'axios';

interface ICatalogProps {
    title: string;
    robots: string;
    description: string;
    keywords: string;
    catalogCategoryName: string;
    catalogCategoryTitleImg: string;
    catName: string;
    catDescription: string;
    filtersSetComponent: string;
    products: IProductsResponse;        // Добавляем продукты - products обязателен — это не просто массив, а объект с пагинацией...
    filters?: Record<string, string>;   // Добавляем фильтры
    sortBy?: string;
    sortOrder?: string;
    search: string;
    searchType: 'article' | 'title';
    categoryId?: number;
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


const Catalog: React.FC<ICatalogProps> = ({title, robots, description, keywords, catalogCategoryName, catalogCategoryTitleImg, catDescription, filtersSetComponent,
    products = defaultProducts, // Используем значение по умолчанию
    filters  = {},              // Значение по умолчанию
    sortBy = 'actual_price',
    sortOrder = 'asc',
    search: initialSearch = '',
    searchType: initialSearchType = 'title',
    categoryId,
}) => {

    // Инициализируем состояние из пропсов (которые приходят из URL через Inertia)
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [searchType, setSearchType] = useState<'article' | 'title'>(initialSearchType);

    console.log(searchTerm);
    console.log(searchType);

    // Синхронизация при изменении URL (если пользователь нажимает "Назад")
    useEffect(() => {
        setSearchTerm(initialSearch);
        setSearchType(initialSearchType);
    }, [initialSearch, initialSearchType]);

    const handleSearch = () => {
        const params = {
            page: 1, // Всегда сбрасываем на первую страницу
            perPage: products.meta.per_page,
            sortBy,
            sortOrder,
            search: searchTerm.trim(),
            searchType
        };
        
        router.get('/products/catalog', params, {
            preserveScroll: true,
            preserveState: true
        });
    };
    
    const [currentSortBy, setCurrentSortBy] = useState(sortBy);
    const [currentSortOrder, setCurrentSortOrder] = useState(sortOrder);
    console.log('Catalog products', products);
    const currentPage = products.meta.current_page;

    // Чтение параметров из URL при загрузке страницы
    useEffect(() => {
        const url = new URL(window.location.href);
        
        const sortBy = url.searchParams.get('sortBy') || 'actual_price'; // По умолчанию 'actual_price'
        setCurrentSortBy(sortBy);
        const sortOrder = url.searchParams.get('sortOrder') || 'asc'; // По умолчанию 'asc'
        setCurrentSortOrder(sortOrder);

    }, [window.location.search]); // Во втором параметре передается массив зависимостей. В них входят значения, используемые функциями компонента. Отслеживаем изменения в query-параметрах

    // Этот вариант не работает! Пока оставил, мы сортируем только по цене...
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSortBy = e.target.value;
        setCurrentSortBy(newSortBy);
    
        Inertia.visit(window.location.pathname, {
            method: 'get' as Method,
            data: {
                sortBy: newSortBy,
                sortOrder: currentSortOrder,
            },
            preserveState: true,
            replace: false,
        });
    };
    
    const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        /*const newSortOrder = e.target.value;
        setCurrentSortOrder(newSortOrder);

        const url = new URL(window.location.href);
        url.searchParams.set('sortOrder', newSortOrder);
        url.searchParams.set('page', products.meta.current_page.toString()); // Добавляем текущую страницу

        window.location.href = url.toString();*/

        const params = {
            // perPage: e.target.value,
            sortBy,                                     // сохраняем текущую сортировку
            sortOrder: e.target.value,                  // сохраняем выбранное направление сортировки
            // category: categoryInfo?.url_semantic,    // сохраняем категорию
            page: products.meta.current_page.toString() // Добавляем текущую страницу
        };

        router.get(url.toString(), params, {
            preserveScroll: true
        });
    };

    const getAsideComponent = () => {
        switch (filtersSetComponent) {
            case 'sticks':                              // клюшки
                return <AsideSticksWithFilters />;
            case 'blades':                              // крюки
                return <AsideBladesWithFilters />;
            case 'balls':                               // мячи
                return <AsideBallsWithFilters />;
            case 'bags':                                // сумки и чехлы
                return <AsideAccordionAll />;
            case 'grips':                               // обмотки
                return <AsideGripsWithFilters />;
            case 'eyewears':                            // очки
                return <AsideEyewearsWithFilters />;
            case 'goalie':                              // вратарская экипировка
                return <AsideGoalieWithFilters />;
            case '':
                return <AsideAccordionAll />;
            default:
                return <AsideAccordionAll />;
        }
    };
    
    // Функция для формирования URL с учетом параметров сортировки
    const getPageUrl = (page: number | string) => {
        const params = new URLSearchParams({
            ...Object.fromEntries(searchParams.entries()), // Передаем все существующие параметры 
            page: page.toString(),
        });

        return `?${params.toString()}`;
    };

    // Получаем текущие query-параметры из URL
    const { url } = usePage();
    // console.log('url:', url); // Отладочное сообщение: url: /products/sticks?page=9&sortBy=actual_price&sortOrder=desc
    
    // Создаем абсолютный URL на основе текущего местоположения
    const absoluteUrl = new URL(window.location.origin + url);
    // console.log('absoluteUrl:', absoluteUrl); // Отладочное сообщение: absoluteUrl: объект: URL {origin: 'http://127.0.0.1:8000', protocol: 'http:', username: '', password: '', host: '127.0.0.1:8000', …}
    
    const totalPages = products.meta.last_page;
    const maxPagesToShow = 3; // Максимальное количество отображаемых страниц
    const searchParams = new URLSearchParams(absoluteUrl.search);
    // console.log('Object.fromEntries(searchParams.entries()):', Object.fromEntries(searchParams.entries())); // Отладочное сообщение: Object.fromEntries(searchParams.entries()): {hook[0]: 'neutral'}
        
    // Функция для формирования пагинации страниц
    const getPageNumbers = () => {
        const pages = [];
        let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

        // Добавляем первую страницу
        pages.push(1);

        // Добавляем многоточие, если текущий блок страниц не начинается с 3
        if (startPage > 2) {
            if(startPage === 3) {
                pages.push(2);    
            } else {
                pages.push('...');
            }
        }

        // Добавляем страницы вокруг текущей
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Добавляем многоточие, если текущий блок страниц не заканчивается на totalPages - 1
        if (endPage < totalPages - 1) {
            pages.push('...');
        }

        // Добавляем последнюю страницу, если totalPages > 1
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return (totalPages > 1) ? pages : [];   // пагинацию возвращаем, если количество страниц больше одной...
    };
    
    return (
        <>
            <MainLayout>
                <Helmet>
                    <title>{title}</title>
                    <meta name="description" content={description} />
                    <meta name="keywords" content={keywords} />
                    <meta name="robots" content={robots} />
                </Helmet>

                <main>
                    <section className="catalog-page__title">
                        <img src={`/storage/images/main/${ catalogCategoryTitleImg }.jpg`} alt={`catalog-${ catalogCategoryTitleImg }`} />
                        <div className="title--position title--text">
                            <h1>{ catalogCategoryName }</h1>
                        </div>
                    </section>
                    <NavBarBreadCrumb />
                    {/* Сортировка */}
                    {/* <div className="sorting-container">
                        <div className="sorting">
                            <span>Товары </span>
                            <select className="text-align-left" value={currentSortOrder} onChange={handleOrderChange}>
                                <option value="asc"> ▲ по возрастанию цены</option> 
                                <option value="desc">  ▼ начиная с самых дорогих по цене</option>
                            </select>
                        </div>
                    </div> */}
                    
                    <div className="table-controls">
                
                        {/* Сортировка и поиск */}
                        <span className='pagination-info'>Товары отсортированы: </span>
                        <select className="text-align-left"
                            value={sortOrder}
                            onChange={handleOrderChange}
                        >
                            <option value="asc"> ▲ по возрастанию цены</option> 
                            <option value="desc"> ▼ по убыванию цены</option>
                        </select>

                        {/* Компактная пагинация */}
                        <CompactPagination 
                            meta={products.meta}
                            getPageUrl={getPageUrl}
                        />

                        <Link 
                        href="/profile/products-table" 
                        className="new-order-button"
                        >
                            Создать заказ
                        </Link>

                        {/* Поиск в каталоге */}
                        <div className="d-flex flex-wrap">
                        {/* <span className='pagination-info'>Поиск </span> */}
                        {/* <select 
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
                         */}
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder={searchType === 'article' ? 'Поиск по артикулу товара' : 'Поиск по наименованию товара'}
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

                        {(searchTerm || searchType !== 'title') && (
                            <button 
                                onClick={() => {
                                    setSearchTerm('');
                                    setSearchType('title');
                                    router.get('/products/catalog', {
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

                    </div>

                    <div className="products-content">
                        <aside className="aside-with-filters">
                        <div className="category-description">
                            <p dangerouslySetInnerHTML={{ __html: catDescription }} />
                        </div>
                            {getAsideComponent()}
                        </aside>   
                        <section className="assortiment-cards">
                            <AssortimentCards products={products} />
                        </section>
                    </div>

                    {/* Пагинация */}
                    <div className="pagination-products">
                        {products.links.prev && (
                            <Link href={getPageUrl(currentPage - 1)} className="pagination-link">
                                &lt;&lt;
                            </Link>
                        )}
                        
                        {getPageNumbers().map((page, index) => (
                            page === '...' ? (
                                <span key={index + 'page-span' + page} className="pagination-link">...</span>
                            ) : (
                                <Link
                                    key={'page' + page}
                                    href={getPageUrl(page)} 
                                    className={`pagination-link ${currentPage === page ? 'activeProduct' : ''}`}
                                    preserveScroll // Сохраняет позицию скролла
                                    preserveState // Сохраняет состояние компонента
                                >
                                    {page}
                                </Link>
                            )
                        ))}

                        {products.links.next && (
                            <Link href={getPageUrl(currentPage + 1)} className="pagination-link">
                                &gt;&gt;
                            </Link>
                        )}
                    </div>          

                </main>

            </MainLayout>    
        </>
    );
};

export default Catalog;