// resources/js/Pages/Catalog.tsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import NavBarBreadCrumb from '../Components/NavBarBreadCrumb';
import MainLayout from '../Layouts/MainLayout';
import { IProductsResponse } from '../Types/types';
import AsideAccordionAll from '../Components/Catalog/AsideAccordionAll';
import AsideSticksWithFilters from '@/Components/Catalog/AsideSticksWithFilters';
import AsideBladesWithFilters from '@/Components/Catalog/AsideBladesWithFilters';
import AssortimentCards from '../Components/AssortimentCards';
import { Inertia, Method } from '@inertiajs/inertia';
// import { usePage } from '@inertiajs/react';
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
    categoryId?: number;
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
    },
};


const Catalog: React.FC<ICatalogProps> = ({title, robots, description, keywords, catalogCategoryName, catalogCategoryTitleImg, catDescription, filtersSetComponent,
    products = defaultProducts, // Используем значение по умолчанию
    filters  = {},              // Значение по умолчанию
    sortBy = 'actual_price',
    sortOrder = 'asc',
    categoryId,
}) => {
    console.log(products);
    const [currentSortBy, setCurrentSortBy] = useState(sortBy);
    const [currentSortOrder, setCurrentSortOrder] = useState(sortOrder);

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
        const newSortOrder = e.target.value;
        setCurrentSortOrder(newSortOrder);

        const url = new URL(window.location.href);
        url.searchParams.set('sortOrder', newSortOrder);
        url.searchParams.set('page', products.meta.current_page.toString()); // Добавляем текущую страницу

        window.location.href = url.toString();
    };

    const getAsideComponent = () => {
        switch (filtersSetComponent) {
            case 'sticks':
                return <AsideSticksWithFilters />;
            case 'blades':
                return <AsideBladesWithFilters />;
            // case 'balls':
            //     return <AsideBallsWithFilters filters={filters} />;
            case '':
                return <AsideAccordionAll />;
            default:
                return <AsideAccordionAll />;
        }
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
                    <div className="sorting-container">
                        <div className="sorting">
                            <span>Товары </span>
                            <select className="text-align-left" value={currentSortOrder} onChange={handleOrderChange}>
                                <option value="asc"> ▲ по возрастанию цены</option> 
                                <option value="desc">  ▼ начиная с самых дорогих по цене</option>
                            </select>
                            {/* <select value={currentSortBy} onChange={handleSortChange}>
                                <option value="actual_price">цене</option>
                            </select> */}
                        </div>
                    </div>
                    <div className="products-content">
                        <aside className="aside-with-filters">
                        <div className="category-description">
                            <p>{ catDescription }</p>
                        </div>
                            {getAsideComponent()}
                        </aside>   
                        <section className="assortiment-cards">
                            <AssortimentCards products={products} />
                        </section>
                    </div>
                </main>

            </MainLayout>    
        </>
    );
};

export default Catalog;