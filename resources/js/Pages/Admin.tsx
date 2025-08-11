// resources/js/Pages/Admin.tsx
import React from 'react';
import { Helmet } from 'react-helmet';

import { AdminLayout } from '@/Layouts/AdminLayout';

interface IAdminProps {
    title: string;
    robots: string;
    description: string;
    keywords: string;
}

const Admin: React.FC<IAdminProps> = ({title, robots, description, keywords}) => {
    
    return (
        <AdminLayout>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords} />
                <meta name="robots" content={robots} />
            </Helmet>                
        </AdminLayout>    
    );
};

export default Admin;