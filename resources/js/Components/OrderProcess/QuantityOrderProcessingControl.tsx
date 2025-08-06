// resources/js/Components/OrderProcess/QuantityOrderProcessingControl.tsx
import { toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
import { useState, useEffect, useCallback, useRef } from 'react';
import { TMode } from './OrderProcess';

const toastConfig = {
    position: "top-right" as const,
    autoClose: 3000, // Уведомление закроется через секунду-другую...
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    transition: Bounce, // Используем Slide, Zoom, Flip, Bounce для этого тоста
}

interface IQuantityOrderProcessingControlProps {
    prodId:number
    prodTitle: string
    value: number;
    on_sale: number;
    on_preorder: number;
    expectedDate: string | null;
    updateItems: (id: number, qty: number, date: string | null) => Promise<{ error?: string }>;
    addToFavorites: (id: number) => Promise<{ favoritesTotal: number; error?: string }>;
    removeItem: (id: number) => Promise<{ error?: string }>;
    mode: TMode;
}

export const QuantityOrderProcessingControl: React.FC<IQuantityOrderProcessingControlProps> = ({ 
        prodId,
        prodTitle,
        value: initialValue,  // деструктуризация с переименованием: возьми свойство value из полученных пропсов и и сохрани его в локальную переменную initialValue
        /** Что происходит:
         *  1. Получение пропса:
         *      - когда мы передаём value={product.quantity ?? 0} в компонент, React "разворачивает" это в пропс value
         *      - в интерфейсе мы объявили value: number как входной параметр
         *  2. Деструктуризация с переименованием: синтаксис { value: initialValue } означает:
         *      - возьми свойство value из полученных пропсов
         *      - и сохрани его в локальную переменную initialValue
         *      это эвивалентно: const initialValue = props.value;...
         *  3. Зачем это нужно:
         *      - чтобы отделить "внешнее значение" (value из пропсов) от "локального состояния" (localValue)
         *      - это паттерн "контролируемого компонента" в React
         */
        on_sale,
        on_preorder,
        expectedDate,
        updateItems,
        addToFavorites,
        removeItem,
        mode
    }) => {
    // Инициализация состояния: при первом рендере localValue = initialValue (то есть product.quantity)
        const [localValue, setLocalValue] = useState(initialValue);
        const [isUpdating, setIsUpdating] = useState(false);

    // Константы для текущего режима
        const maxQuantity   = mode === 'cart' ? on_sale : on_preorder;
        const modeText      = mode === 'cart' ? 'корзине' : 'предзаказе';
        const removeText    = mode === 'cart' ? 'корзины' : 'предзаказа';

    // Синхронизируем при изменении пропсов: если родительский компонент обновит product.quantity, это значение "протечёт" в локальное состояние
    useEffect(() => {
        if (initialValue !== localValue) {
            setLocalValue(initialValue);
        }
    }, [initialValue]);
    /** Почему не напрямую?
     *  Если бы мы использовали value напрямую без локального состояния:
     *      - каждое нажатие кнопки требовало бы обновления в родительском компоненте
     *      - UI реагировал бы с задержкой (ожидание API)
     *      - Были бы проблемы с быстрым вводом в текстовое поле
     */

    /** Правильный поток данных:
     Parent (CartPage)
        ↓ passes product.quantity as `value`
        QuantityControl
        ↓ renames to `initialValue`
        ↓ initializes `localValue` state
        ↓ renders using `localValue`
        ↓ calls updateCart() on changes
        Parent receives update
        ↓ changes product.quantity
        ↓ triggers re-render
        */

    // Получаем ссылку на <input> с помощью useRef. Сначала создадим ref и привяжем её к инпуту:
        const inputRef = useRef<HTMLInputElement>(null);

    // Используем useRef для хранения таймера (не вызывает ререндер)
        const debounceTimer = useRef<NodeJS.Timeout>(null);

    // Автоматическая очистка при размонтировании
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);
    
    // Валидация остатков
    useEffect(() => {
        if (initialValue <= 0) return;

        if (maxQuantity === 0) {
            handleStockDepleted();
        } else if (initialValue > maxQuantity) {
            handleQuantityReduced(maxQuantity);
        }
    }, [initialValue, maxQuantity]);
       
    // Основной обработчик обновления
    const handleUpdate = useCallback(async (newValue: number) => {
        if (newValue < 0 || newValue > maxQuantity) return;
        
        try {
            setIsUpdating(true);
            
            if (newValue === 0) {
                await handleRemoveProduct();
            } else {
                await handleQuantityUpdate(newValue);
            }
        } catch(error) {
            handleUpdateError();
        } finally {
            setIsUpdating(false);
        }
    }, [prodId, maxQuantity, mode, updateItems, removeItem, addToFavorites]);

    // Вспомогательные функции
    const handleStockDepleted = async () => {
        toast.warning(
            `К сожалению товар ${prodTitle} закончился, мы перенесли его в Избранное...`, 
            toastConfig
        );
        await Promise.all([
            addToFavorites(prodId),
            handleRemoveProduct()
        ]);
    };

    const handleQuantityReduced = async (newQty: number) => {
        toast.warning(
            `Количество товаров ${prodTitle} в ${modeText} изменилось...`, 
            toastConfig
        );
        await handleUpdate(newQty);
    };

    const handleRemoveProduct = async () => {
        await Promise.all([
            removeItem(prodId)
        ]);
        toast.info(`Товар успешно удалён из ${removeText}` , toastConfig);
    };

    const handleQuantityUpdate = async (newValue: number) => {
        const result = await updateItems(prodId, newValue, expectedDate);
        if (result.error) throw new Error(result.error);
        setLocalValue(newValue);
    };

    const handleUpdateError = () => {
        toast.error('Не удалось обновить количество', toastConfig);
        setLocalValue(initialValue);
    };

    // Обработчики UI
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0;
        
        const clampedValue = Math.max(0, Math.min(maxQuantity, value));
        setLocalValue(clampedValue);

        // Сбрасываем предыдущий таймер
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Устанавливаем новый таймер
        debounceTimer.current = setTimeout(() => {
            if (clampedValue !== initialValue) {
                handleUpdate(clampedValue);
            }
        }, 1000); // Оптимальное время - 800-1000ms
    };

    const handleBlur = () => {
        // Принудительно выполняем обновление при потере фокуса
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        // Если значение не менялось — не вызываем handleUpdate
        if (localValue !== initialValue) {
            handleUpdate(localValue); // Сохраняем только если значение изменилось
        }
    };

    // Оптимизация ввода с клавиатуры
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleBlur();
    };

    return (
        <div className="basket-row__quantity">
            <button className="basket-row__quantity-minus" onClick={() => handleUpdate(localValue - 1)} disabled={isUpdating || localValue <= 1}>-</button>
            <input 
                className="basket-row__quantity-number"
                ref={inputRef}
                // type="number" 
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                min={1}
                max={maxQuantity}
                disabled={isUpdating}
            />
            <button className="basket-row__quantity-plus" onClick={() => handleUpdate(localValue + 1)} disabled={isUpdating || localValue >= maxQuantity}>+</button>
            {isUpdating && <span className="loading-indicator">...</span>}
        </div>
    ); 
};