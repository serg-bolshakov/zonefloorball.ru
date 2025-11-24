// resources/js/Components/Admin/MenuSection.tsx

import { Link } from "@inertiajs/react";

const MenuSection: React.FC<{ title: string; items: Array<{ label: string; path: string }> }> = 
({ title, items }) => {

    // Определяем активный пункт по текущему URL
    const isActive = (path: string) => window.location.pathname.startsWith(path);

    return (
        <div className="menu-section">
            <div className="menu-header">{title}</div>
            <div className="menu-items">
            {items.map(item => (
                <Link key={item.path} href={item.path} className={`menu-item ${isActive('/admin/dashboard') ? 'admin-active' : ''}`}>{item.label}</Link>
            ))}
            </div>
        </div>
    );
};

export default MenuSection;