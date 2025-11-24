// resources/js/Components/Admin/Documents/DocumentsTable.tsx

import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { CompactPagination } from '@/Components/CompactPagination';
import { DocumentsTableRow } from './DocumentsTableRow';
import { DocumentTypeDropdown } from './DocumentTypeDropdown';

interface IDocumentUser {
    id: number;
    name: string;
    email: string;
    tel: string;
}

interface IDocumentType {
    id: number;
    document_type: string;
    comment?: string;
}

export interface IDocument {
    id: number;
    document_type_id: number;
    document_number: string;
    document_date: string;
    created_at: string;
    total_amount: number;
    status: 'draft' | 'posted' | 'cancelled';
    user?: IDocumentUser;
    document_type?: IDocumentType;
    created_by?: number;
}

interface IDocumentsTableProps {
    documents: {
        data: IDocument[];
        
        // ... поля пагинации:
        first_page_url: string | null;
        last_page_url: string | null;
        prev_page_url: string | null;
        next_page_url: string | null;
        
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
        links: [{ url: string | null; label: string; active: boolean }]; 
    };
    documentTypes?: IDocumentType[]; // Добавляем типы документов, делаем опциональным
    filters: any;
}

export const DocumentsTable: React.FC<IDocumentsTableProps> = ({ 
    documents,
    documentTypes = [], // по умолчанию пустой
    filters,
}) => {
    
    // Инициализируем состояние из пропсов (которые приходят из URL через Inertia)
    const initialSearch = filters.search || '';
    const initialSearchType = filters.searchType || 'document_number';
    
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [searchType, setSearchType] = useState<'document_number' | 'recipient' | 'document_type'>(initialSearchType);

    // Локальное состояние дат при изменении фильтров
    const [localDates, setLocalDates] = useState({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
    });

    // Обновляем локальное состояние при изменении фильтров
    useEffect(() => {
        setLocalDates({
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo
        });
    }, [filters.dateFrom, filters.dateTo]);

    const applyDateFilter = () => {
        router.get('/admin/documents', {
            ...filters,
            dateFrom: localDates.dateFrom,
            dateTo: localDates.dateTo,
            page: 1
        });
    };
    
    // Синхронизация при изменении URL (если пользователь нажимает "Назад")
    useEffect(() => {
        setSearchTerm(initialSearch);
        setSearchType(initialSearchType);
    }, [initialSearch, initialSearchType]);   

    const handleSearch = () => {
        const params = {
            page: 1, // Всегда сбрасываем на первую страницу
            perPage: documents.per_page,
            search: searchTerm.trim(),
            searchType
        };
        
        router.get('/admin/documents', params, {
            preserveScroll: true,
            preserveState: true
        });
    };
    
    // Сохраняем позицию прокрутки перед обновлением
    useEffect(() => {
        const handleBeforeUnload = () => {
            sessionStorage.setItem('scrollPos', window.scrollY.toString());
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // Восстанавливаем позицию прокрутки после загрузки
    useEffect(() => {
        const savedScrollPos = sessionStorage.getItem('scrollPos');
        if (savedScrollPos) {
            window.scrollTo(0, parseInt(savedScrollPos));
        }
    }, []);
    
    const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(`/admin/documents`, 
            getCommonParams({
                perPage: e.target.value,
                page: 1
            }), 
            { preserveScroll: true }
        );
    };
    
    // Функция формирования общих параметров
    const getCommonParams = (additionalParams = {}) => ({
        perPage: documents.per_page,
        ...additionalParams
    });
    
    // Получаем текущие query-параметры из URL
    const { url } = usePage();
    
    // Создаем абсолютный URL на основе текущего местоположения
    const absoluteUrl = new URL(window.location.origin + url);
        
    const searchParams = new URLSearchParams(absoluteUrl.search);
    
    // Функция для формирования URL с учетом параметров сортировки
    const getPageUrl = (page: number | string) => {
        const params = new URLSearchParams({
            ...Object.fromEntries(searchParams.entries()), // Передаем все существующие параметры 
            page: page.toString(),
        });

        return `?${params.toString()}`;
    };

    // Функция быстрых периодов
    const setQuickPeriod = (period: string) => {
        const today = new Date();
        let dateFrom = '', dateTo = today.toISOString().split('T')[0];
        
        switch (period) {
            case 'today':
                dateFrom = dateTo;
                break;
            case 'week':
                dateFrom = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
                break;
            case 'month':
                dateFrom = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];
                break;
        }
        
        router.get('/admin/documents', {
            ...filters,
            dateFrom,
            dateTo,
            page: 1
        });
    };
    
    // console.log(documentTypes);

    return (
        <div className="admin-documents">           
            {/* Фильтры и поиск (аналогично таблице остатков) */}
            <div className="table-controls">
                {/* Селект количества строк */}
                <div className="pagination">
                    <select 
                        value={documents.per_page} 
                        onChange={handlePerPageChange}
                    >
                    {[10, 25, 50, 100, 250, 500].map(size => (
                        <option key={size} value={size}>Смотрим по {size} строк</option>
                    ))}
                    <option value={documents.total}>Показать все</option>
                    </select>
                </div>

                {/* Компактная пагинация */}
                <CompactPagination 
                    meta={documents}
                    getPageUrl={getPageUrl}
                />

                {/* Сортировка и поиск */}
                <select className="text-align-left">
                    <option value="asc"> ▲ начиная с самых ранних</option> 
                    <option value="desc"> ▼ начиная с поледних</option>
                </select>
                
                <div className="filters">
                    <select 
                        value={filters.status} 
                        onChange={(e) => {
                            router.get('/admin/documents', {
                                status: e.target.value,
                                page: 1
                            });
                        }}
                    >
                        <option value="all">Все документы</option>
                        
                    </select>
                </div>
                {/* ВЫПАДАЮЩЕЕ МЕНЮ СОЗДАНИЯ ДОКУМЕНТОВ */}
                {/* ✅ Передаем documentTypes (даже если пустой массив) */}
                <DocumentTypeDropdown documentTypes={documentTypes} />
            </div>

            <div className="search-controls">
                <span className='pagination-info'>Поиск </span>
                <select 
                    value={searchType}
                    onChange={(e) => {
                        setSearchType(e.target.value as 'document_number' | 'recipient' | 'document_type');
                        if (searchTerm) handleSearch();
                    }}
                    className="search-type-select margin-left22px"
                    >
                    <option value="document_number">По номеру документа</option>
                    <option value="recipient">По контрагета</option>
                    <option value="email">По типу документа</option>
                </select>
                    
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder='.... номер / Имя / почта' 
                    className="search-input margin-left12px"
                />
                    
                <button 
                    onClick={handleSearch}
                    disabled={!searchTerm.trim()}
                    className="search-btn margin-left40px"
                >
                    Найти
                </button>
                    
                {/* Индикация активного поиска: */}
                {searchTerm && (
                    <div className="active-search-info">
                        Поиск {searchType === 'document_number' ? 'по номеру документа' : (searchType === 'recipient' ? 'наименованию контрагента' : 'по типу документа')}:&nbsp; 
                        <strong>{searchTerm}</strong>
                    </div>
                )}
    
                {(searchTerm || searchType !== 'document_number') && (
                    <button 
                        onClick={() => {
                            setSearchTerm('');
                            setSearchType('document_number');
                            router.get('/admin/documents', {
                                page: 1,
                                perPage: documents.per_page,
                                preserveScroll: true,
                                preserveState: true
                            });
                        }}
                        className="clear-search-button"
                    >
                        Сбросить
                    </button>
                )}
            </div>

            <div className="documents-date-filter-controls">
                <label className='pagination-info' htmlFor="date_from">
                    Период с:
                </label>
    
                <input
                    className="date-input"
                    type="date"
                    name="date_from"
                    value={localDates.dateFrom}
                    onChange={(e) => setLocalDates(prev => ({
                        ...prev, 
                        dateFrom: e.target.value 
                    }))}
                />

                <label className='pagination-info' htmlFor="date_to">
                    до:
                </label>
    
                <input
                    className="date-input"
                    type="date"
                    name="date_to"
                    value={localDates.dateTo}
                    onChange={(e) => setLocalDates(prev => ({
                        ...prev, 
                        dateTo: e.target.value 
                    }))}
                />

                {/* Кнопка сброса дат */}
                <button 
                    onClick={applyDateFilter}
                    className="doc-table__apply-date-button"
                >
                    Применить
                </button>

                {(filters.dateFrom || filters.dateTo) && (
                    <button 
                        onClick={() => {
                            setLocalDates({ dateFrom: '', dateTo: '' });
                            router.get('/admin/documents', {
                                ...filters,
                                dateFrom: undefined,
                                dateTo: undefined,
                                page: 1
                            });
                        }}
                        className="doc-table__clear-date-button"
                    >
                        ×
                    </button>
                )}

                 {/* Быстрые периоды */}
                <div className="table-controls-block">
                    <span className="pagination-info">Быстрый выбор:</span>
                    <button className="doc-table__apply-date-button" onClick={() => setQuickPeriod('today')}>Сегодня</button>
                    <button className="doc-table__apply-date-button" onClick={() => setQuickPeriod('week')}>Неделя</button>
                    <button className="doc-table__apply-date-button" onClick={() => setQuickPeriod('month')}>Месяц</button>
                </div>
            </div>

            {/* Список документов */}
            <div className="admin__scroll-table">
                <table className="admin-document__table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Тип документа</th>
                            <th>Номер</th>
                            <th>Дата создания</th>
                            <th>Клиент</th>
                            <th>Сумма</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.data.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="">
                                    {filters.search || filters.status !== 'all' 
                                        ? 'Документов по вашему запросу не найдено'
                                        : 'Документов пока нет'
                                    }
                                </td>
                            </tr>
                        ) : (
                            <>
                                {documents.data.map((document) => (
                                    <DocumentsTableRow
                                        key={document.id}
                                        document={document}
                                    />
                                ))}
                            </> 
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};