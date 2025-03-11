// resources/js/Pages/Catalog.tsx
import React from 'react';
import { Helmet } from 'react-helmet';
import NavBarBreadCrumb from '../Components/NavBarBreadCrumb';
import MainLayout from '../Layouts/MainLayout';
import AsideAccordionAll from '../Components/Catalog/AsideAccordionAll';

interface ICatalogProps {
    title: string;
    robots: string;
    description: string;
    keywords: string;
    catalogCategoryName: string;
    catalogCategoryTitleImg: string;
    catDescription: string;
}

const Catalog: React.FC<ICatalogProps> = ({title, robots, description, keywords, catalogCategoryName, catalogCategoryTitleImg, catDescription}) => {
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
                        {/* <x-assortiment-cards /> */}
                    </div>
                </main>

            </MainLayout>    
        </>
    );
};

export default Catalog;