// resources/js/Pages/AdminDocumentsListPage.tsx
import React from 'react';
import { Helmet } from 'react-helmet';
import { AdminLayout } from '@/Layouts/AdminLayout';
import { DocumentsTable } from '@/Components/Admin/Documents/DocumentsTable';

interface IAdminDocumentsListPageProps {
    title: string;
    robots: string;
    description: string;
    keywords: string;
    documents: any;
    filters: any;
}

const AdminDocumentsListPage: React.FC<IAdminDocumentsListPageProps> = ({
    title,
    robots, 
    description,
    keywords,
    documents,
    filters
}) => {
    
    return (
        <AdminLayout>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords} />
                <meta name="robots" content={robots} />
            </Helmet>

            <div className="admin-content">
                <h1 className="h1-tablename">Документы</h1>
                
                <DocumentsTable 
                    documents={documents}
                    filters={filters}
                />
            </div>                
        </AdminLayout>    
    );
};

export default AdminDocumentsListPage;