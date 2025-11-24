// resources/js/Pages/AdminDocumentCreatePage.tsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { usePage } from '@inertiajs/react';
import { AdminLayout } from '@/Layouts/AdminLayout';
import { DocumentForm } from '@/Components/Admin/Documents/DocumentForm';
import { AssemblyForm } from '@/Components/Admin/Documents/AssemblyForm';
import { DOCUMENT_TYPES, type DocumentTypeId } from '@/Constants/documents';

const AdminDocumentCreatePage: React.FC = () => {

    const { url } = usePage();
    
    // 🎯 ИНИЦИАЛИЗИРУЕМ КАК DocumentTypeId ИЛИ null
    const [documentType, setDocumentType] = useState<DocumentTypeId | null>(null);

    // 🎯 ОПРЕДЕЛЯЕМ ТИП ДОКУМЕНТА ИЗ URL ПАРАМЕТРА
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const typeParam = urlParams.get('type');
        
        if (typeParam) {
            const typeNumber = parseInt(typeParam) as DocumentTypeId;
            
            // 🛡️ ВАЛИДИРУЕМ ЧТО ТИП СУЩЕСТВУЕТ В НАШИХ КОНСТАНТАХ
            const isValidType = Object.values(DOCUMENT_TYPES).includes(typeNumber);
            
            if (isValidType) {
                setDocumentType(typeNumber);
            } else {
                // 🔴 Fallback на оприходование если передан неизвестный тип
                console.warn(`Unknown document type: ${typeParam}, falling back to ACCRUAL`);
                setDocumentType(DOCUMENT_TYPES.ACCRUAL);
            }
        } else {
            // 🔵 Если параметра нет - используем оприходование по умолчанию
            setDocumentType(DOCUMENT_TYPES.ACCRUAL);
        }
    }, [url]);


    const [documentData, setDocumentData] = useState({
        document_type_id: documentType || DOCUMENT_TYPES.ACCRUAL,
        document_date: new Date().toISOString().split('T')[0],
        comment: '',
        items: []
    });

    // 🎯 ОБНОВЛЯЕМ document_type_id КОГДА documentType МЕНЯЕТСЯ
    useEffect(() => {
        if (documentType) {
            setDocumentData(prev => ({
                ...prev,
                document_type_id: documentType
            }));
        }
    }, [documentType]);

    // 🎯 ВЫБИРАЕМ ЗАГОЛОВОК ПО ТИПУ ДОКУМЕНТА
    const getDocumentTitle = (): string => {
        if (!documentType) return 'Загрузка...';
        
        switch (documentType) {
            case DOCUMENT_TYPES.ASSEMBLY:
                return 'Комплектация товаров';
            case DOCUMENT_TYPES.INCOME:
                return 'Поступление товара';
            case DOCUMENT_TYPES.WRITE_OFF:
                return 'Списание товара';
            case DOCUMENT_TYPES.OUTCOME:
                return 'Реализация товара';
            case DOCUMENT_TYPES.ACCRUAL:
            default:
                return 'Оприходование товара';
        }
    };

    // 🎯 ВЫБИРАЕМ ФОРМУ ПО ТИПУ ДОКУМЕНТА
    const renderForm = () => {
        if (!documentType) {
            return <div>Загрузка формы...</div>;
        }
        
        switch (documentType) {
            case DOCUMENT_TYPES.ASSEMBLY:
                return (
                    <AssemblyForm 
                        documentData={documentData}
                        onChange={setDocumentData}
                    />
                );
            default:
                return (
                    <DocumentForm 
                        documentData={documentData}
                        onChange={setDocumentData}
                    />
                );
        }
    };

    return (
        <AdminLayout>
            <Helmet>
                <title>Админка. Создание документа</title>
                <meta name="robots" content="NOINDEX,NOFOLLOW" />
            </Helmet>

            <div className="admin-content">
                <h1 className="h1-tablename">{getDocumentTitle()}</h1>
                
                {renderForm()}
            </div>
        </AdminLayout>
    );
};

export default AdminDocumentCreatePage;