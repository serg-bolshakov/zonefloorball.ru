// resources/js/Pages/AdminDocumentShowPage.tsx
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from '@inertiajs/react';
import { AdminLayout } from '@/Layouts/AdminLayout';
import { DocumentHeader } from '@/Components/Admin/Documents/DocumentHeader';
import { DocumentViewItemsTable } from '@/Components/Admin/Documents/DocumentViewItemsTable';

interface AdminDocumentShowPageProps {
    title: string;
    robots: string;
    description: string;
    keywords: string;
    document: any; // Позже заменим на конкретный тип
}

const AdminDocumentShowPage: React.FC<AdminDocumentShowPageProps> = ({
    title,
    robots,
    description,
    keywords,
    document
}) => {

    // console.log('items', document.status === 'posted');
    
    return (
        <AdminLayout>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords} />
                <meta name="robots" content={robots} />
            </Helmet>

            <div className="admin-content">
                <div className="document-show-page">
                    {/* Заголовок и статус */}
                    <div className="document-show-header">
                        <h1 className="h1-tablename">Документ: {document.document_number}</h1>
                        <div className={`document-status document-status-${document.status}`}>
                            {document.status === 'draft' && '📝 Черновик'}
                            {document.status === 'posted' && '✅ Проведен'}
                            {document.status === 'cancelled' && '❌ Отменен'}
                        </div>
                    </div>

                    {/* Информация о документе */}
                    <DocumentHeader document={document} />
                    
                    {/* Табличная часть */}
                    <DocumentViewItemsTable 
                        items={document.items} 
                    />

                    {/* Действия */}
                    <div className="document-actions">
                        <button className="btn btn-secondary">
                            <Link 
                                href={`/admin/documents`}
                                className="document-link"
                            >
                                ← Назад к списку
                            </Link>
                        </button>
                        {document.status === 'draft' && (
                            <button className="btn btn-primary">
                                Провести документ
                            </button>
                        )}
                    </div>
                </div>
            </div>
                
        </AdminLayout>    
    );
};

export default AdminDocumentShowPage;