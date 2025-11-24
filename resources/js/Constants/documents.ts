// resources/js/Constants/documents.ts

// Делаем union type для всех возможных типов документов
export type DocumentTypeId = 1 | 2 | 3 | 4 | 5;

/**
 * Основные типы документов для быстрого доступа
 */

/*export const DOCUMENT_TYPES = {
    INCOME   : 1,        // Поступление (покупка)
    OUTCOME  : 2,        // Реализация (продажа)  
    ACCRUAL  : 3,        // Оприходование
    WRITE_OFF: 4,        // Списание
    ASSEMBLY : 5,        // Сборка товара (на примере: списываем комлектующие (крюк и палку), оприходуем клюшку (по цене акутуальной себестоимости суммы комплектующих))
} as const;*/

export const DOCUMENT_TYPES: {
    readonly INCOME: DocumentTypeId;
    readonly OUTCOME: DocumentTypeId; 
    readonly ACCRUAL: DocumentTypeId;
    readonly WRITE_OFF: DocumentTypeId;
    readonly ASSEMBLY: DocumentTypeId;
} = {
    INCOME    : 1,       // Поступление (покупка)
    OUTCOME   : 2,       // Реализация (продажа)  
    ACCRUAL   : 3,       // Оприходование
    WRITE_OFF : 4,       // Списание
    ASSEMBLY  : 5        // Сборка товара (на примере: списываем комлектующие (крюк и палку), оприходуем клюшку (по цене акутуальной себестоимости суммы комплектующих))
};

/**
 * Часто используемые типы документов для выпадающего меню
 */
export const COMMON_DOCUMENT_TYPES = [
    { 
        id: DOCUMENT_TYPES.ACCRUAL, 
        document_type: 'Оприходование', 
        description: 'Поступление на склад (внутренний документ)',
        route: '/admin/documents/create?type=3'
    },
    { 
        id: DOCUMENT_TYPES.INCOME, 
        document_type: 'Поступление', 
        description: 'Платная закупка у поставщика',
        route: '/admin/documents/create?type=1'
    },
    { 
        id: DOCUMENT_TYPES.WRITE_OFF, 
        document_type: 'Списание', 
        description: 'Списание со склада',
        route: '/admin/documents/create?type=4'
    },
    { 
        id: DOCUMENT_TYPES.OUTCOME, 
        document_type: 'Реализация', 
        description: 'Продажа покупателю',
        route: '/admin/documents/create?type=2'
    }
] as const;

/**
 * Часто используемые типы документов для выпадающего меню
 */
export const SPECIAL_DOCUMENT_TYPES = [
    { 
        id: DOCUMENT_TYPES.ASSEMBLY, 
        document_type: 'Комплектация', 
        description: 'Сборка товара из комплектующих',
        route: '/admin/documents/create?type=5'
    }
] as const;

/**
 * Статусы документов
 */
export const DOCUMENT_STATUS = {
    DRAFT: 'draft',
    POSTED: 'posted', 
    CANCELLED: 'cancelled'
} as const;

/**
 * Типы движений товаров
 */
export const MOVEMENT_TYPES = {
    IN: 'in',
    OUT: 'out',
    INSIDE: 'inside'
} as const;

/**
 * Хелперы для работы с документами
 */
export const DocumentHelpers = {
    /**
     * Получить информацию о типе документа по ID
     */
    getTypeInfo: (typeId: number) => {
        return COMMON_DOCUMENT_TYPES.find(doc => doc.id === typeId);
    },

    /**
     * Проверить является ли документ приходным
     */
    isIncomeDocument: (typeId: number): boolean => {
        const incomeTypes: number[] = [DOCUMENT_TYPES.INCOME, DOCUMENT_TYPES.ACCRUAL];
        return incomeTypes.includes(typeId);
    },

    /**
     * Проверить является ли документ расходным  
     */
    isOutcomeDocument: (typeId: number): boolean => {
        const outcomeTypes: number[] = [DOCUMENT_TYPES.OUTCOME, DOCUMENT_TYPES.WRITE_OFF];
        return outcomeTypes.includes(typeId);
    }
};