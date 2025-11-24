// resources/js/Components/Admin/Documents/DocumentTypeDropdown.tsx
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { COMMON_DOCUMENT_TYPES, SPECIAL_DOCUMENT_TYPES } from '@/Constants/documents';

interface IDocumentType {
    id: number;
    document_type: string;
    description?: string;
}

interface IDocumentTypeDropdownProps {
    documentTypes: IDocumentType[];
}

export const DocumentTypeDropdown: React.FC<IDocumentTypeDropdownProps> = ({ 
    documentTypes = [] // ✅ Значение по умолчанию
}) => {
    const [isOpen, setIsOpen] = useState(false);

    /* Вынесли в константы
        const commonDocumentTypes = [
            { id: 3, document_type: 'Оприходование', description: 'Бесплатное поступление' },
            { id: 1, document_type: 'Поступление', description: 'Платная закупка' },
            { id: 4, document_type: 'Списание', description: 'Списание со склада' },
            { id: 2, document_type: 'Реализация', description: 'Продажа покупателю' }
        ];
    */

    // ✅ Проверяем что documentTypes массив, Используем константы вместо хардкода
    const safeDocumentTypes = Array.isArray(documentTypes) ? documentTypes : [];
    

    // ✅ Фильтруем только если есть данные
    const otherDocumentTypes = safeDocumentTypes.filter(
        doc => SPECIAL_DOCUMENT_TYPES.some(special => special.id === doc.id)
    );

    console.log('SPECIAL_DOCUMENT_TYPES', SPECIAL_DOCUMENT_TYPES[0]);

    return (
        <div className="docs-dropdown-container">
            <button 
                className="new-document-button docs-dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            >
                + Создать документ
                <span className={`docs-dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </button>
            
            {isOpen && (
                <div className="docs-dropdown-menu">
                    {/* Основные типы документов */}
                    {COMMON_DOCUMENT_TYPES.map((docType) => (
                        <Link
                            key={docType.id}
                            href={`/admin/documents/create?type=${docType.id}`}
                            className="docs-dropdown-item"
                            onMouseDown={(e) => e.preventDefault()} // Предотвращаем потерю фокуса
                        >
                            <div className="document-type-name">
                                {docType.document_type}
                            </div>
                            <div className="document-type-description">
                                {docType.description}
                            </div>
                        </Link>
                    ))}
                    
                    {/* Показываем разделитель только если есть другие типы - на данном этапе разработки не задействовано: otherDocumentTypes.length всегда == 0 / 5.11.2025 */}
                    {(otherDocumentTypes.length > 0 || SPECIAL_DOCUMENT_TYPES.length > 0) && (
                        <>
                            <div className="docs-dropdown-divider"></div>
                            
                            {/* Остальные типы документов */}
                            {SPECIAL_DOCUMENT_TYPES.map((docSpecialType) => (
                                <Link
                                    key={docSpecialType.id}
                                    href={`/admin/documents/create?type=${docSpecialType.id}`}
                                    className="docs-dropdown-item special-document-item"
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    {/* <div className="document-type-name"> */}
                                    <div className="document-type-header margin-bottom4px">
                                        <span className="special-icon">⚙️</span>
                                        {docSpecialType.document_type}
                                    </div>
                                    <div className="document-type-description">
                                        {docSpecialType.description}
                                    </div>
                                </Link>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};