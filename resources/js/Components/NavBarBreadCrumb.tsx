// resources/js/Components/NavBarBreadCrumb.tsx

import { Link, usePage } from '@inertiajs/react';
import useAppContext from '../Hooks/useAppContext';
import React from 'react';

// React.FC — это тип, предоставляемый React. Он расшифровывается как React Function Component (функциональный компонент React).
// Это сокращение для React.FunctionComponent. Автоматически типизирует children как ReactNode. Упрощает типизацию пропсов по умолчанию.
const NavBarBreadCrumb: React.FC = () => {

    const { categoriesMenuArr } = useAppContext();
    const { url } = usePage();
    // const currentPath = url.split('?')[0]; // Отбрасываем строку запроса - метод split позволяет разделить строку по символу ? и взять только первую часть (путь)
    const currentPath = new URL(url, window.location.origin).pathname; // Получаем только путь - можно использовать встроенный URL API
    
    // это добавляем для реализации подменю Каталога:
    const searchParams = new URL(url, window.location.origin).searchParams;
    // Получаем GET-параметры
    const categoryParam = searchParams.get('category');
    const brandParam    = searchParams.get('brand');
    const serieParam    = searchParams.get('serie');
    const modelParam    = searchParams.get('model');

    // Проверяем, есть ли активная фильтрация
    const hasFilter = categoryParam && (serieParam || brandParam || modelParam);


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

    // Функция для получения человекочитаемого названия категории
    const getCategoryLabel = (category: string | null) => {
        if (!category) return '';
        
        // Здесь можно добавить маппинг технических названий на читаемые, а можно загружать данные через контекст: надо будет завтра утром "допилить" api-запрос...
        const categoryMap: Record<string, string> = {
            'sticks': 'Клюшки',
            'blades': 'Крюки',
        };
        // Если category есть в маппинге — возвращаем читаемое название, иначе — исходное значение
        return categoryMap[category] || category;
    };

    return (
        <>
            <nav className="nav-bar">
                <ul className="breadcrumb">
                    {
                        breadcrumbItems.map((item, index) => (
                            item.label && (
                                <li key={item.href}>
                                    <Link href={item.href}
                                        className={currentPath === item.href ? 'activeBreadcrumb' : ''}
                                        preserveScroll // Сохраняет позицию скролла
                                        preserveState // Сохраняет состояние компонента
                                    >
                                        {item.label}
                                    </Link>
                                    {index !== breadcrumbItems.length - 1 && <span className="nav-bar__ul-li"></span>}
                                </li>
                            )
                        ))
                    }
                </ul>
            </nav>

            {/* Блок поднавигации с фильтрами */}
            {hasFilter && (
                <div className="subnav d-flex">
                    <div className="subnav-elem d-flex">Каталог</div>
                    
                    <div className="subnav-arrow">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    
                    <div className="subnav-elem d-flex">
                        {getCategoryLabel(categoryParam)}
                        {brandParam && `: ${brandParam.toUpperCase()}`}
                    </div>
                    
                    {(serieParam || modelParam) && (
                        <>
                            <div className="subnav-arrow">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            
                            <div className="subnav-elem d-flex">
                                {serieParam ? `Серия: ${serieParam.toUpperCase()}` : ''}
                                {modelParam ? `Модель: ${modelParam.toUpperCase()}` : ''}
                            </div>
                        </>
                    )}
                </div>
            )}
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