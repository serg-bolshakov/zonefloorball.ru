// resources/js/Components/NavBarBreadCrumb.tsx

import { ICategoriesMenuArr } from '../Types/types';
import { Link } from '@inertiajs/react';
import useAppContext from '../Hooks/useAppContext';

// React.FC — это тип, предоставляемый React. Он расшифровывается как React Function Component (функциональный компонент React).
// Это сокращение для React.FunctionComponent. Автоматически типизирует children как ReactNode. Упрощает типизацию пропсов по умолчанию.
const NavBarBreadCrumb: React.FC = () => {
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