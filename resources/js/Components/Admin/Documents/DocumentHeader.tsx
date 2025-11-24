// resources/js/Components/Admin/Documents/DocumentHeader.tsx
import React from 'react';
import { formatServerDate } from '@/Utils/dateFormatter';

interface DocumentHeaderProps {
    document: any;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({ document }) => {
    return (
        <div className="document-header-info">
            <div className="document-header-grid">
                <div className="document-header-item">
                    <label>Тип документа:</label>
                    <span>{document.document_type?.document_type}</span>
                </div>
                <div className="document-header-item">
                    <label>Дата документа:</label>
                    <span>{formatServerDate(document.document_date)}</span>
                </div>
                <div className="document-header-item">
                    <label>Создан:</label>
                    <span>{formatServerDate(document.created_at, true)}</span>
                </div>
                {document.user && (
                    <div className="document-header-item">
                        <label>Контрагент:</label>
                        <span>{document.user.name}</span>
                    </div>
                )}
                {document.comment && (
                    <div className="document-header-item full-width">
                        <label>Комментарий:</label>
                        <span>{document.comment}</span>
                    </div>
                )}
            </div>
            
            <div className="document-totals">
                <div className="document-total-amount">
                    Итого: <strong>{document.total_amount} руб.</strong>
                </div>
            </div>
        </div>
    );
};