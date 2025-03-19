// resources/js/Components/NavBarBreadCrumb.tsx

import { Link } from '@inertiajs/react';
import useAppContext from '../Hooks/useAppContext';
import { Inertia, Method } from '@inertiajs/inertia';

/* TypeScript ожидает, что свойство method будет иметь тип Method, 
    а не строку 'get'. В Inertia.js тип Method определён как 'get' | 'post' | 'put' | 'patch' | 'delete', 
    и TypeScript требует, чтобы значение соответствовало этому типу.*/

import React, { useState } from 'react';

interface ISortingFiltersProps {
    filters?: Record<string, string>;
    sortBy?: string;
    sortOrder?: string;
    categoryId?: number;
}

// React.FC — это тип, предоставляемый React. Он расшифровывается как React Function Component (функциональный компонент React).
// Это сокращение для React.FunctionComponent. Автоматически типизирует children как ReactNode. Упрощает типизацию пропсов по умолчанию.
const NavBarBreadCrumb: React.FC<ISortingFiltersProps> = ({
        sortBy = 'actual_price',
        sortOrder = 'asc',
    }) => {


    // const [currentSortBy, setCurrentSortBy] = useState(sortBy);
    // const [currentSortOrder, setCurrentSortOrder] = useState(sortOrder);

    // const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    //     const newSortBy = e.target.value;
    //     setCurrentSortBy(newSortBy);
    //     console.log('Sort By:', newSortBy); // Отладка
    //     console.log('window location:', window.location.pathname); // Отладка
    //     Inertia.visit(window.location.pathname, {
    //         method: 'get' as Method,        // Явно указываем тип
    //         data: {
    //             sortBy: newSortBy,
    //             sortOrder: currentSortOrder,
    //         }});
    // };

    // const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    //     const newSortOrder = e.target.value;
    //     setCurrentSortOrder(newSortOrder);
    //     console.log('Sort Order:', newSortOrder); // Отладка
    //     Inertia.get(window.location.pathname, {
    //         sortBy: currentSortBy,
    //         sortOrder: newSortOrder,
    //     });
    // };

    const { categoriesMenuArr } = useAppContext();
    
    // Если categoriesMenuArr ещё не загружено, показываем заглушку
    if (!categoriesMenuArr) {
        return <div>Загрузка данных...</div>;
    }
    
    // Преобразуем объект в массив
    const categories = Object.values(categoriesMenuArr.UnihocZoneRussia);

    // Проверка, что данные являются массивом
    if (!Array.isArray(categories)) {
        return <div>Данные unihocZoneRussiaArray не загружены или имеют неверный формат.</div>;
    }

    const breadcrumbItems = [
        { label: 'Главная', href: '/' },
        { label: 'Каталог', href: '/products/catalog' },
        ...categories.map(category => ({
            label: category[0]?.category_view_2,
            href: `/products/${category[0]?.url_semantic}`,
        })),
    ];

    // console.log('currentSortBy', currentSortBy);
    // console.log('currentSortOrder', currentSortOrder);

    return (
        <>
            <nav className="nav-bar">
                <ul className="breadcrumb">
                    {
                        breadcrumbItems.map((item, index) => (
                            item.label && (
                                <li key={item.href}>
                                    <Link href={item.href}>{item.label}</Link>
                                    {index !== breadcrumbItems.length - 1 && <span className="nav-bar__ul-li"></span>}
                                </li>
                            )
                        ))
                    }
                </ul>
            </nav>
            {/* Сортировка */}
            {/* <div className="slct__user-lk">
                <span>Сортировано по: </span>
                <select value={currentSortBy} onChange={handleSortChange}>
                    <option value="actual_price">цене</option>
                    <option value="title">названию</option>
                </select>
                <select value={currentSortOrder} onChange={handleOrderChange}>
                    <option value="asc">возрастанию</option>
                    <option value="desc">убыванию</option>
                </select>
            </div> */}
        </>
    );

    /* выше попробовал упростить структуру даннных: собрал все "крошки" в один массив... а было так:

    return (
        <>
        <nav className="nav-bar">
            <ul className="breadcrumb">
                <li key='key_main_breadcrumb'><Link href="/">Главная</Link><span className="nav-bar__ul-li"></span></li>
                <li key='key_catalog_breadcrumb'><Link href="/products/catalog">Каталог</Link><span className="nav-bar__ul-li"></span></li>
                {unihocZoneRussiaArray.map((category) => {
                    if (category[0]) {
                    return (
                        <li key={category[0].url_semantic}><Link href={`/products/${category[0].url_semantic}`}>
                            {category[0].category_view_2}
                        </Link><span className="nav-bar__ul-li"></span></li>
                    );      
                    }  
                    return null; // Если category[0] не существует, возвращаем null      
                })}
            </ul>
        </nav>
        </>
    );

    */
};

export default NavBarBreadCrumb;