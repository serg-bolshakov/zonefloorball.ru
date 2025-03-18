// resources/js/Pages/Catalog.tsx
import React from 'react';
import { Helmet } from 'react-helmet';
import NavBarBreadCrumb from '../Components/NavBarBreadCrumb';
import MainLayout from '../Layouts/MainLayout';
import { IProductsResponse } from '../Types/types';
import AsideAccordionAll from '../Components/Catalog/AsideAccordionAll';
import AssortimentCards from '../Components/AssortimentCards';

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
    products: IProductsResponse;       // Добавляем продукты - products обязателен — это не просто массив, а объект с пагинацией...
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
    sortBy,
    sortOrder,
    categoryId,
}) => {
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