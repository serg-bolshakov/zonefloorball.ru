//resources/js/Components/Pagination.tsx - компонент пагинации страниц
import { Link } from "@inertiajs/react";
import { IProductsResponse } from "@/Types/types";

interface PaginationProps {
  meta: {
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
  getPageUrl: (page: number | string) => string;
  products: IProductsResponse;        // Добавляем продукты - products обязателен — это не просто массив, а объект с пагинацией...
}

export const Pagination: React.FC<PaginationProps> = ({ meta, getPageUrl, products }) => {

    const totalPages = meta.last_page;
    const currentPage = meta.current_page;
    const maxPagesToShow = 3; // Максимальное количество отображаемых страниц

    
    // Функция для формирования пагинации страниц
    const getPageNumbers = () => {
        const pages = [];
        let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

        // Добавляем первую страницу
        pages.push(1);

        // Добавляем многоточие, если текущий блок страниц не начинается с 3
        if (startPage > 2) {
            if(startPage === 3) {
                pages.push(2);    
            } else {
                pages.push('...');
            }
        }

        // Добавляем страницы вокруг текущей
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Добавляем многоточие, если текущий блок страниц не заканчивается на totalPages - 1
        if (endPage < totalPages - 1) {
            pages.push('...');
        }

        // Добавляем последнюю страницу, если totalPages > 1
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return (totalPages > 1) ? pages : [];   // пагинацию возвращаем, если количество страниц больше одной...
    };


    return (
    <>
      {/* Пагинация */}
        <div className="pagination-products">
            {products.links.prev && (
                <Link href={getPageUrl(currentPage - 1)} className="pagination-link">
                    &lt;&lt;
                </Link>
            )}
            
            {getPageNumbers().map((page, index) => (
                page === '...' ? (
                    <span key={index + 'page-span' + page} className="pagination-link">...</span>
                ) : (
                    <Link
                        key={'page' + page}
                        href={getPageUrl(page)} 
                        className={`pagination-link ${currentPage === page ? 'activeProduct' : ''}`}
                        preserveScroll // Сохраняет позицию скролла
                        preserveState // Сохраняет состояние компонента
                    >
                        {page}
                    </Link>
                )
            ))}

            {products.links.next && (
                <Link href={getPageUrl(currentPage + 1)} className="pagination-link">
                    &gt;&gt;
                </Link>
            )}
        </div>          
    </>
  );
};