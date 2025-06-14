// resources/js/Components/Cart/QuantityControl.tsx
import { toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
import { useState, useEffect } from 'react';


const toastConfig = {
    position: "top-right" as const,
    autoClose: 3000, // Уведомление закроется через секунду-другую...
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    transition: Bounce, // Используем Slide, Zoom, Flip, Bounce для этого тоста
}

interface QuantityControlProps {
    prodId:number
    prodTitle: string
    value: number;
    on_sale: number;
    updateCart: (prodId: number, value: number) => Promise<{  
        cartTotal: number;  // Полезно для отображения в UI
        error?: string;     
    }>;
    addToFavorites: (prodId: number) => Promise<{ favoritesTotal: number; error?: string }>;
    removeFromCart: (prodId: number) => Promise<{ cartTotal: number; error?: string; }>;
}

export const QuantityControl: React.FC<QuantityControlProps> = ({ 
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
        updateCart,
        addToFavorites,
        removeFromCart
    }) => {
    // Инициализация состояния: при первом рендере localValue = initialValue (то есть product.quantity)
    const [localValue, setLocalValue] = useState(initialValue);
    const [isUpdating, setIsUpdating] = useState(false);

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

    // Проверка остатков при монтировании (не был ли распродан товар, пока пользователь отсутствовал...)
    useEffect (() => {
        if(initialValue > 0 && on_sale === 0) {
            // Товар полностью закончился
            toast.warning(`К сожалению товар ${ prodTitle } закончился, мы перенесли его в Избранное...`, toastConfig);
            handleUpdate(0);
        } else if(initialValue > on_sale) {
            // Товара доступного к продаже меньше, чем в корзине
            toast.warning(`Количество товаров ${ prodTitle } в корзине изменилось...`, toastConfig);
            handleUpdate(on_sale);
        }
    }, [initialValue, on_sale]);

    const handleUpdate = async (newValue: number) => {
        if(newValue < 0 || newValue > on_sale) return;
        
        try {
            setIsUpdating(true);
            
            if(newValue === 0) {
                // Товар закончился - удаляем и добавляем в избранное
                await Promise.all([                                     // Случай с Promise.all используется когда нам нужно: а) выполнить несколько асинхронных операций параллельно; б) не требуется анализ индивидуальных результатов; в) важен факт успешного выполнения всех операций
                    addToFavorites(prodId),
                    removeFromCart(prodId)
                ]);
                toast.info('Товар закончился и перемещён в Избранное', toastConfig);
            } else {
                const result = await updateCart(prodId, newValue);     // Случай с result используется когда: а) нужно проверить конкретный результат операции; б) требуется дополнительная обработка ответа; в) важно обработать возможные ошибки специфическим образом;
                if(result.error) throw new Error(result.error);
                setLocalValue(newValue);
            }
        } catch(error) {
            toast.error('Не удалось обновить количество', toastConfig);
            setLocalValue(initialValue);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0;
        setLocalValue(Math.max(1, Math.min(on_sale, value)));
    };

    const handleBlur = () => {
        if(localValue !== initialValue) {
            handleUpdate(localValue);
        }
    };

    return (
    <div className="basket-row__quantity">
        <button className="basket-row__quantity-minus" onClick={() => handleUpdate(localValue - 1)} disabled={isUpdating || localValue <= 1}>-</button>
        <input 
        className="basket-row__quantity-number"
        type="number" 
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        min={1}
        max={on_sale}
        disabled={isUpdating}
        />
        <button className="basket-row__quantity-plus" onClick={() => handleUpdate(localValue + 1)} disabled={isUpdating || localValue >= on_sale}>+</button>
        {isUpdating && <span className="loading-indicator">...</span>}
    </div>
    ); 
};

