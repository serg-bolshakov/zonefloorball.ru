// resources/js/Components/ProductOrderTable/TableQuantityControl.tsx
import { toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
import { useState, useEffect, useCallback, useRef } from 'react';
import { position } from '@pnotify/animate';
import useModal from '@/Hooks/useModal';


const toastConfig = {
    position: "top-center" as const,
    // position: "absolute" as const,
    autoClose: 3000, // Уведомление закроется через секунду-другую...
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    transition: Bounce, // Используем Slide, Zoom, Flip, Bounce для этого тоста
    style: {
        margin: '50% auto',
        maxWidth: '90%',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }
}

interface TableQuantityControlProps {
    prodId:number
    prodTitle: string
    value: number;
    on_sale: number;
    on_preorder: number;
    tableMode: 'cart' | 'preorder'; // Явно передаём режим
    updateCart: (prodId: number, value: number) => Promise<{ cartTotal: number; error?: string; }>;
    updatePreorder: (prodId: number, value: number) => Promise<{ preorderTotal: number; error?: string }>;
    addToFavorites: (prodId: number) => Promise<{ favoritesTotal: number; error?: string }>;
    removeFromCart: (prodId: number) => Promise<{ cartTotal: number; error?: string; }>;
    removeFromPreorder: (prodId: number) => Promise<{ preorderTotal: number; error?: string }>; 
}

export const TableQuantityControl: React.FC<TableQuantityControlProps> = ({ 
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
        tableMode,
        updateCart,
        updatePreorder,
        addToFavorites,
        removeFromCart,
        removeFromPreorder
    }) => {

    const { openModal, closeModal } = useModal();
    // Инициализация состояния: при первом рендере localValue = initialValue (то есть product.quantity)
    const [localValue, setLocalValue] = useState(initialValue);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Дебаунс "лёгкой" версии
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

    // Не забываем очищать таймер
    useEffect(() => {
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [timeoutId]);

    // состояние для отслеживания фокуса и динамической смены кнопки:
    const [isInputFocused, setIsInputFocused] = useState(false);

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

    // Проверка остатков при монтировании (не был ли распродан товар, пока пользователь отсутствовал...) - пока комментирую: это не корзина, как оказалось... :) если оставить, то отсутствующий товар, сразу летит в избранное и выводятся сообщения...
    /*useEffect (() => {
        if(initialValue > 0 && on_sale === 0) {
            // Товар полностью закончился
            toast.warning(`К сожалению товар ${ prodTitle } закончился, мы перенесли его в Избранное...`, toastConfig);
            handleUpdate(0);
        } else if(initialValue > on_sale) {
            // Товара доступного к продаже меньше, чем в корзине
            toast.warning(`Количество товаров ${ prodTitle } в корзине изменилось...`, toastConfig);
            handleUpdate(on_sale);
        }
    }, [initialValue, on_sale]);*/

    // Получаем ссылку на <input> с помощью useRef. Сначала создадим ref и привяжем её к инпуту:
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Сбрасываем локальное значение при смене режима
        setLocalValue(initialValue);
    }, [tableMode, initialValue]);

    const handleUpdate = async (newValue: number) => {
        if (isUpdating) return;             // Защита от повторных вызовов
        
        const maxAllowed = tableMode === 'cart' ? on_sale : on_preorder;
        if (newValue < 0 || newValue > maxAllowed) return;

        try {
            setIsUpdating(true);
            let result;
            
            if (tableMode === 'cart') {
                result = newValue === 0 
                    ? await removeFromCart(prodId) 
                    : await updateCart(prodId, newValue);
            } else {
                result = newValue === 0
                    ? await removeFromPreorder(prodId)
                    : await updatePreorder(prodId, newValue);
            }

            if (result.error) throw new Error(result.error);
            
            setLocalValue(newValue);
            toast.success(
                newValue === 0 
                    ? `Товар удалён из ${tableMode === 'cart' ? 'Корзины' : 'Предзаказа'}` 
                    : `«${prodTitle}» ${tableMode === 'cart' ? 'в корзине' : 'в предзаказе'}: ${newValue} шт.`,
                toastConfig
            );
        } catch(error) {
            setLocalValue(initialValue);
            toast.error(
                error instanceof Error ? error.message : 'Ошибка обновления',
                toastConfig
            );
        } finally {
            setIsUpdating(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0;
        const clampedValue = Math.max(0, Math.min(tableMode === 'cart' ? on_sale : on_preorder, value));
        setLocalValue(clampedValue);

        if (timeoutId) clearTimeout(timeoutId);
        setTimeoutId(
            setTimeout(() => {
                if (clampedValue !== initialValue) {
                    handleUpdate(clampedValue).then(() => {
                        // Теряем фокус ТОЛЬКО после успешного сохранения
                        inputRef.current?.blur();
                    });
                }
            }, 5000)
        );
    };

    const handleBlur = () => {
        setIsInputFocused(false);

        if (timeoutId) {
            clearTimeout(timeoutId); // Очищаем таймер, если он есть
            setTimeoutId(undefined);
        }
        // Если значение не менялось — не вызываем handleUpdate
        if (localValue !== initialValue) {
            handleUpdate(localValue); // Сохраняем только если значение изменилось
        }
    };

    const handleRemoveFromCartClick = useCallback(async (productId: number) => {
            openModal(null, 'confirm', {
                title: "Удалить из Корзины?",
                onConfirm: async () => {
                    try {
                        const result = await removeFromCart(productId);    
                        if (result.error) {
                            toast.error(result.error, toastConfig);
                        } else {
                            toast.success('Товар успешно удалён из Корзины...', toastConfig);
                        }
                    } catch(error) {
                        toast.error('Не удалось удалить из Корзины', toastConfig);
                    }
                },
                onCancel: () => {
                    toast.success('Товар оставлен в Корзине', toastConfig);
                }
            });
        }, [removeFromCart]);

    const handleRemoveFromPreorderClick = useCallback(async (productId: number) => {
        openModal(null, 'confirm', {
            title: "Удалить из предзаказа?",
            onConfirm: async () => {
                try {
                    const result = await removeFromPreorder(productId);    
                    if (result.error) {
                        toast.error(result.error, toastConfig);
                    } else {
                        toast.success('Товар удалён из предзаказа', toastConfig);
                    }
                } catch(error) {
                    toast.error('Не удалось удалить из предзаказа', toastConfig);
                }
            },
            onCancel: () => {
                toast.success('Товар оставлен в предзаказе', toastConfig);
            }
        });
    }, [removeFromPreorder]);
    
    // Оптимизация ввода с клавиатуры
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Предотвращаем возможное дублирование
            if (timeoutId) clearTimeout(timeoutId); // Отменяем pending-таймер
            inputRef.current?.blur(); // Снимаем фокус вручную (вызовёт handleBlur)
        }
    };

    const handleFocus = () => {
        setIsInputFocused(true);
    };

    // console.log(initialValue);

    return (
        <>
            <div className="quantity-control">
                <button 
                    onClick={() => handleUpdate(localValue - 1)}
                    disabled={(isUpdating && localValue <= 1) || localValue == 0}
                >
                −
                </button>
                
                <input
                    ref={inputRef}
                    value={localValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    max={tableMode === 'cart' ? on_sale : on_preorder}
                />
                
                <button
                    onClick={() => handleUpdate(localValue + 1)}
                    disabled={isUpdating || localValue >= (tableMode === 'cart' ? on_sale : on_preorder)}
                >
                +
                </button>
                {isUpdating && <span className="loading-indicator">...</span>}

                {localValue > 0 && (
                    isInputFocused ? (
                            <div 
                                className="ok-button"
                                onClick={() => inputRef.current?.blur()} // Вызовет handleBlur
                            >
                                OK
                            </div>
                    ) : (
                        <img 
                            className="w-6 cursor-pointer margin-left12px" 
                            onClick={() => 
                                tableMode === 'cart' 
                                    ? handleRemoveFromCartClick(prodId)
                                    : handleRemoveFromPreorderClick(prodId)
                            } 
                            src="/storage/icons/icon-trash.png" 
                            alt="Удалить"
                        />
                    )
                )}
            </div>
        </>
    ); 
};

