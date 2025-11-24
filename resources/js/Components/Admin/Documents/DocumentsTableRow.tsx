// resources/js/Components/Admin/Documents/DocumentsTableRow.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { IDocument } from './DocumentsTable';
import { formatServerDate } from '@/Utils/dateFormatter';

interface IDocumentsTableRowProps {
    document: IDocument; // Используем тот же интерфейс
}

export const DocumentsTableRow: React.FC<IDocumentsTableRowProps> = ({ document }) => {
    
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { class: 'status-draft', text: 'Черновик' },
            posted: { class: 'status-posted', text: 'Проведен' },
            cancelled: { class: 'status-cancelled', text: 'Отменен' }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || { class: 'status-unknown', text: status };
        
        return <span className={`status-badge ${config.class}`}>{config.text}</span>;
    };

    const formatDate = (dateString: string) => {
        return formatServerDate(dateString); 
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // console.log('document', document);

    return (
        <tr className="document-row">
            <td className="td-center">{document.id}</td>
            <td className="td-center">
                {document.document_type && (
                    <div className="document-type">
                        {document.document_type.document_type}
                    </div>
                )}
            </td>
            <td className="td-center">
                <Link 
                    href={`/admin/documents/${document.id}`}
                    className="document-link"
                >
                    {document.document_number}
                </Link>
            </td>
            <td className="td-center">{formatDate(document.created_at)}</td>
            <td className="td-center">
                {document.user ? (
                    <>
                        <div className="user-name">{document.user.name}</div>
                        <div className="user-email">{document.user.email}</div>
                    </>
                ) : (
                    <span className="no-user">—</span>
                )}
            </td>
            <td className="td-right">{formatCurrency(document.total_amount)}</td>
            <td className="td-center">{getStatusBadge(document.status)}</td>
        </tr>
    );
};