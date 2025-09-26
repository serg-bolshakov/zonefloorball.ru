// resources/js/Components/Admin/Layout/Sidebar.tsx

import { Link } from "@inertiajs/react";
import MenuSection from "../MenuSection";

const Sidebar = () => {
  // Определяем активный пункт по текущему URL
  const isActive = (path: string) => window.location.pathname.startsWith(path);

  return (
    <div className="admin-menu">
        <div className="menu-header">Администрирование</div>
        
        <Link href="/admin/dashboard" className="menu-item">Главная</Link>
        <Link href="/" className="menu-item">Перейти в меню пользователя</Link>
        <Link href="/logout" className="menu-item">Выйти из системы</Link>

        <MenuSection 
            title="Товары" 
            items={[
                { label: 'Номенклатура'           , path: '/admin/products' },
                { label: 'Добавить'               , path: '/admin/products/add' },
                { label: 'Добавить клюшку'        , path: '/admin/products/sticks/add' },
                { label: 'Остатки (ручная правка)', path: '/admin/stock-manual' },
                
                // Позже можно добавить:
                // { label: 'Импорт остатков (Excel)', path: '/admin/stock-import' },
            ]} 
        />

        <MenuSection 
            title="Заказы" 
            items={[
                { label: 'Все заказы'       , path: '/admin/orders' },
                { label: 'Требуют обработки', path: '/admin/orders?status=7' },
                { label: 'Готовы к отправке', path: '/admin/orders?status=8' },
            ]} 
        />

        <MenuSection title="Документы" items={[
            { label: 'Заказы'       , path: '/admin/orders' },
            { label: 'Оприходования', path: '/admin/inventory' }
        ]} />

        {/* Другие разделы */}
    </div>
    );
};

export default Sidebar;