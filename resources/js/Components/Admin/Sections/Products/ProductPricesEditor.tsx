// resources/js/Components/Admin/Section/Products/ProductPricesEditor.tsx

import React, { useState, useEffect } from 'react';
import { IProduct, IPrice } from '@/Types/types';
import { validatePriceDates } from '@/Utils/formFieldsValidation';

interface ProductPricesEditorProps {
    product: IProduct;
    onPricesChange: (productId: number, newPrices: IPrice[]) => void;
    onClose: () => void;
}

export const ProductPricesEditor: React.FC<ProductPricesEditorProps> = ({
    product,
    onPricesChange,
    onClose
}) => {
    // console.log('product in PricesEditor', product);
    const [showModal, setShowModal] = useState(true); // модалка сразу открыта
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

    const validateForm = () => {
        const errors: {[key: string]: string} = {};

        // Валидация специальной цены
        const specialValidation = validatePriceDates(
            dateRanges.special.start, 
            dateRanges.special.end,
            'special'
        );
        if (!specialValidation.isValid) {
            errors.special = specialValidation.errors[0];
        }

        // Валидация предзаказа
        const preorderValidation = validatePriceDates(
            dateRanges.preorder.start, 
            dateRanges.preorder.end,
            'preorder'  
        );
        if (!preorderValidation.isValid) {
            errors.preorder = preorderValidation.errors[0];
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Утилита для конвертации
    const parsePriceValue = (value: string | number | null): number | null => {
        if (value === null || value === '') return null;
        if (typeof value === 'number') return value;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
    };    
    
    const { 
        preorder_price_date_end, 
        preorder_price_date_start, 
        price_actual, 
        price_preorder, 
        price_regular, 
        price_special, 
        special_price_current,  // объект типа IPrice - как "оригинальный", текущая версия реализации в БД
        special_price_date_end, 
        special_price_date_start
    } = product;

    // Состояния для редактирования цен
    const [prices, setPrices] = useState({
        regular: price_regular || '',
        special: price_special || '',
        preorder: price_preorder || '',
        actual: price_actual || ''
    });

    const [dateRanges, setDateRanges] = useState({
        special: {
            start: special_price_date_start || '',
            end: special_price_date_end || ''
        },
        preorder: {
            start: preorder_price_date_start || '', 
            end: preorder_price_date_end || ''
        }
    });

    // Сравниваем текущие значения с исходными
    useEffect(() => {
        const initialPrices = {
            regular: price_regular || '',
            special: price_special || '',
            preorder: price_preorder || '',
            actual: price_actual || ''
        };

        const initialDates = {
            special: {
                start: special_price_date_start || '',
                end: special_price_date_end || ''
            },
            preorder: {
                start: preorder_price_date_start || '', 
                end: preorder_price_date_end || ''
            }
        };

        /* const pricesChanged = 
            prices.regular !== initialPrices.regular ||
            prices.special !== initialPrices.special ||
            prices.preorder !== initialPrices.preorder ||
            prices.actual !== initialPrices.actual;

        const datesChanged = 
            dateRanges.special.start !== initialDates.special.start ||
            dateRanges.special.end !== initialDates.special.end ||
            dateRanges.preorder.start !== initialDates.preorder.start ||
            dateRanges.preorder.end !== initialDates.preorder.end;
        */

        const pricesChanged = JSON.stringify(prices) !== JSON.stringify(initialPrices);
        const datesChanged = JSON.stringify(dateRanges) !== JSON.stringify(initialDates);

        setHasChanges(pricesChanged || datesChanged);
    }, [prices, dateRanges, product]);
   
    const handleSubmit = () => {

        if (!validateForm()) {
            return; // Не отправляем если есть ошибки
        }

        // Здесь преобразуем данные в массив IPrice[]
        const newPrices: IPrice[] = [];                 
       
        // Добавляем регулярную цену
        if (prices.regular) {
            newPrices.push({
                product_id: product.id,
                price_type_id: 2, // TYPE_REGULAR
                price_value: parsePriceValue(prices.regular),
                date_start: null,
                date_end: null,
                // остальные поля IPrice...
            } as IPrice);
        }
        
        // Добавляем специальную цену
        if (prices.special) {
            newPrices.push({
                product_id: product.id,
                price_type_id: 3, // TYPE_SPECIAL  
                price_value: parsePriceValue(prices.special),
                date_start: dateRanges.special.start || null,
                date_end: dateRanges.special.end || null,
            } as IPrice);
        }
        
        // Добавляем предзаказ
        if (prices.preorder) {
            newPrices.push({
                product_id: product.id,
                price_type_id: 4, // TYPE_PREORDER
                price_value: parsePriceValue(prices.preorder),
                date_start: dateRanges.preorder.start || null,
                date_end: dateRanges.preorder.end || null,
            } as IPrice);
        }

        // Отправка данных...
        onPricesChange(product.id, newPrices);
        onClose();
    };

    // Для закрытия модалки при клике вне ее
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!showModal) return null;

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Редактирование цен товара</h3>
                <p className='margin-tb8px'>{product.title}</p>
                
                <div className="price-fields">
                    {/* Поля для ввода цен */}
                    <div className="price-field admin-form-group">
                        <label>Регулярная цена:</label>
                        <input 
                            type="number"
                            value={prices.regular}
                            onChange={(e) => setPrices(prev => ({...prev, regular: e.target.value}))}
                        />
                    </div>
                    
                    <div className="price-field admin-form-group">
                        <label>Специальная цена:</label>
                        <input 
                            type="number"
                            value={prices.special}
                            onChange={(e) => setPrices(prev => ({...prev, special: e.target.value}))}
                        />
                        <div className="date-range">
                            <div className="date-field">
                                <label>Начало:</label>
                                <input 
                                    type="date"
                                    value={dateRanges.special.start}
                                    onChange={(e) => setDateRanges(prev => ({
                                        ...prev, 
                                        special: {...prev.special, start: e.target.value}
                                    }))}
                                />
                            </div>
                            <div className="date-field">
                                <label>Окончание:</label>
                                <input 
                                    type="date"
                                    value={dateRanges.special.end}
                                    onChange={(e) => setDateRanges(prev => ({
                                        ...prev,
                                        special: {...prev.special, end: e.target.value}  
                                    }))}
                                />
                            </div>
                        </div>
                        {validationErrors.special && (
                            <div className="registration-error margin-top8px">{validationErrors.special}</div>
                        )}
                    </div>
                    
                    <div className="price-field admin-form-group">
                        <label>Цена для предзаказа:</label>
                        <input 
                            type="number"
                            value={prices.preorder}
                            onChange={(e) => setPrices(prev => ({...prev, preorder: e.target.value}))}
                        />
                        <div className="date-range">
                            <div className="date-field">
                                <label>Начало:</label>
                                <input 
                                    type="date"
                                    value={dateRanges.preorder.start}
                                    onChange={(e) => setDateRanges(prev => ({
                                        ...prev, 
                                        preorder: {...prev.preorder, start: e.target.value}
                                    }))}
                                />
                            </div>
                            <div className="date-field">
                                <label>Окончание:</label>
                                <input 
                                    type="date"
                                    value={dateRanges.preorder.end}
                                    onChange={(e) => setDateRanges(prev => ({
                                        ...prev,
                                        preorder: {...prev.preorder, end: e.target.value}  
                                    }))}
                                />
                            </div>
                            {validationErrors.preorder && (
                                <div className="registration-error margin-top8px">{validationErrors.preorder}</div>
                            )}
                        </div>
                    </div>
                </div>

                

                <div className="admin-modal-actions">
                    <button type="button" onClick={onClose}>Отмена</button>
                    <button 
                        type="button" 
                        onClick={handleSubmit}
                        disabled={!hasChanges}
                        className="admin-btn-primary"
                    >
                        Сохранить изменения
                    </button>
                </div>
            </div>
        </div>
    );
};