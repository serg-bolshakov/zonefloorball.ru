// resources/js/Pages/Catalog.tsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import NavBarBreadCrumb from '../Components/NavBarBreadCrumb';
import MainLayout from '../Layouts/MainLayout';
import { IProductsResponse } from '../Types/types';
import AsideAccordionAll from '../Components/Catalog/AsideAccordionAll';
import AssortimentCards from '../Components/AssortimentCards';
import { Inertia, Method } from '@inertiajs/inertia';
// import { usePage } from '@inertiajs/react';

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


const Catalog: React.FC<ICatalogProps> = ({title, robots, description, keywords, catalogCategoryName, catalogCategoryTitleImg, catDescription,
    products = defaultProducts, // Используем значение по умолчанию
    filters  = {},              // Значение по умолчанию
    sortBy = 'actual_price',
    sortOrder = 'asc',
    categoryId,
}) => {
    console.log(products);

    const [currentSortBy, setCurrentSortBy] = useState(sortBy);
    const [currentSortOrder, setCurrentSortOrder] = useState(sortOrder);

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSortBy = e.target.value;
        setCurrentSortBy(newSortBy);
        console.log('Sort By:', newSortBy); // Отладка
    
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
        console.log('Sort Order:', newSortOrder); // Отладка
        Inertia.get(window.location.pathname, {
            sortBy: currentSortBy,
            sortOrder: newSortOrder,
        }, {
            preserveState: true,
            replace: true,      // опция replace: true, Inertia.js заменяет текущую запись в истории браузера вместо добавления новой. Это может привести к тому, что URL не обновляется визуально, хотя состояние страницы меняется.
        });
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
                    <NavBarBreadCrumb sortBy={sortBy} sortOrder={sortOrder} />
                    {/* Сортировка */}
                    <div className="sorting">
                        <span>Сортировано по: </span>
                        <select value={currentSortBy} onChange={handleSortChange}>
                            <option value="actual_price">цене</option>
                            <option value="title">наименованию</option>
                        </select>
                        <select value={currentSortOrder} onChange={handleOrderChange}>
                            <option value="asc">▲</option> 
                            <option value="desc">▼</option>
                        </select>
                    </div>
                    <div className="products-content">
                        <aside className="aside-with-filters">
                        <div className="category-description">
                            <p>{ catDescription }</p>
                        </div>
                        <AsideAccordionAll />
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