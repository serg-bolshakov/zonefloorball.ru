//resources/js/Components/CompactPagination.tsx - компонент пагинации страниц
import { Link } from "@inertiajs/react";
import { router } from '@inertiajs/react';

interface PaginationProps {
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    path: string;
    to: number;
  };
  getPageUrl: (page: number | string) => string;
}

export const CompactPagination: React.FC<PaginationProps> = ({ meta, getPageUrl }) => {
  const { current_page, last_page } = meta;

  return (
        <div className="compact-pagination">
            {/* Кнопка "Назад" */}
            <Link
                href={getPageUrl(Math.max(1, current_page - 1))}
                className={`pagination-nav ${current_page === 1 ? 'disabled' : ''}`}
                preserveScroll
            >
                ‹
            </Link>
            
            {/* Селект страниц */}
            <select
                value={current_page}
                onChange={(e) => {
                const url = getPageUrl(e.target.value);
                router.visit(url, { preserveScroll: true });
                }}
                className="page-selector"
            >
                {Array.from({ length: last_page }, (_, i) => i + 1).map(page => (
                <option key={page} value={page}>
                    Страница {page}
                </option>
                ))}
            </select>
            
            {/* Кнопка "Вперед" */}
            <Link
                href={getPageUrl(Math.min(last_page, current_page + 1))}
                className={`pagination-nav ${current_page === last_page ? 'disabled' : ''}`}
                preserveScroll
            >
                ›
            </Link>
            
            {/* Информация о позиции */}
            {/* <span className="pagination-info">
                {meta.from}-{meta.to} из {meta.total}
            </span> */}
        </div>
    );
};