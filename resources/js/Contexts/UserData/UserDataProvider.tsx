// resources/js/contexts/UserData/UserDataProvider.tsx    # Логика провайдера
import { useState, useEffect, useCallback, useMemo } from 'react';
import useAppContext from '@/Hooks/useAppContext';
import axios from 'axios';
import { UserDataState } from './UserDataContext';
import { UserDataContext } from './UserDataContext';
import { API_ENDPOINTS } from '@/Constants/api';
import { getErrorMessage } from '@/Utils/error';
import { TCart, TRecentlyViewedProducts } from './UserDataContext';
import { IProduct } from '@/Types/types';
import { useLocalStorage } from '@/Hooks/useLocalStorage';

type SyncData = {
  favorites?: number[];
  cart?: IProduct[];
  recentlyViewedProducts?: TRecentlyViewedProducts;
};

export const UserDataProvider = ({ children }: { children: React.ReactNode }) => {
    
    const { user, cart, favorites, orders } = useAppContext();
    
    const [state, setState] = useState<UserDataState>({
        cart                    : {},  // Пустой объект вместо массива { [productId]: quantity } — это один объект вида { 84: 1, 89: 2 }  
        favorites               : [],
        orders                  : [],
        recentlyViewedProducts  : {},
        cartTotal               : 0,
        favoritesTotal          : 0,
        ordersTotal             : 0, 
        isLoading               : true, // Начинаем с true, так как данные загружаются
        error                   : null
    });

    // console.log('UserDataProvider: user', user);

    const calculateCartTotal = (cart: TCart) => 
        Object.values(cart).reduce((sum, qty) => sum + qty, 0);

    // Помним, что состояние обновляется асинхронно! 
    // если просто setState({ ...state, newValue }) - может использовать устаревшее состояние
    // setState(prev => ({ ...prev, newValue })) - всегда использует актуальное состояние
    // Общая функция обновления состояния
    /*const updateState = (partialState: Partial<UserDataState>) => {
        setState(prev => ({
                ...prev,
                ...partialState,
                // Автоматически пересчитываем totals при изменении массивов
                ...(partialState.cart && { cartTotal: calculateCartTotal(partialState.cart) }),
                ...(partialState.favorites && { favoritesTotal: partialState.favorites.length }),
                ...(partialState.orders && { ordersTotal: partialState.orders.length })
        }));
    };*/
    
    const updateState = (partialState: Partial<UserDataState>) => {
        setState(prev => {
            const newState = {...prev, ...partialState};    
            return {
                ...newState,
                // Автоматически пересчитываем totals при изменении массивов
                cartTotal: calculateCartTotal(newState.cart),
                favoritesTotal: newState.favorites.length,
                ordersTotal: newState.orders.length
            };                
        });
    };

    /** Нужен ли debounce из lodash?
     *  Без debounce: Каждое изменение корзины (например, быстрое нажатие +/-) будет вызывать:
     *      - Запрос к API (для авторизованных) / Запрос к API (для авторизованных)
     *  Проблемы: Лишняя нагрузка на API / Мелькание интерфейса
     */
    // Решение без lodash: Самодельный debounce:
    let saveTimeout: NodeJS.Timeout;
    const saveCart = (cart: TCart) => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            localStorage.setItem('cart', JSON.stringify(cart));
        }, 500); // Задержка 500 мс
    };

    // Универсальные принципы для всех методов (addToCart и др.)
    // Шаблон получения состояния:
    const getCurrentData = <ExpectedType extends unknown>(): ExpectedType[] => {
        try {
            const stored = localStorage.getItem('key');
            return stored ? JSON.parse(stored) as ExpectedType[] : [];
        } catch (e) {
            return [];
        }
    };

    // Для методов, которые зависят от состояния, указываем зависимости! Не забываем!
    const addToFavorites = useCallback(async (productId: number): Promise<{
        favoritesTotal: number;
        error?: string;
        }>  => {
        
        // 1. Безопасное получение текущего состояния с чёткой типизацией
        const getCurrentFavorites = (): number[] => {
            try {
                if (user) {
                    return Array.isArray(state.favorites) ? [...state.favorites] : [];
                }
                
                const stored = localStorage.getItem('favorites');
                return stored ? JSON.parse(stored) as number[] : [];
            } catch (e) {
                console.error('Ошибка чтения избранного:', e);
                return [];
            }
        };

        const currentFavorites = getCurrentFavorites();

        // 2. Проверяем, есть ли уже такой товар
        if (currentFavorites.includes(productId)) {
            return {
                favoritesTotal: currentFavorites.length,
                error: 'Товар уже есть в избранном'
            };
        }

        // 3. Создаём новый массив
        const newFavorites = [...currentFavorites, productId];                 // добавляет id-товара в массив айдишников 

        try {
            
            // 4. Оптимистичное обновление UI
            updateState({
                favorites: newFavorites,
                isLoading: true
            });
        
            // 5. Сохраняем в нужное место
            if (user) {
                // Сохранение на сервер (если пользователь авторизован) 
                await axios.post('/products/favorites', { 
                    favorites: newFavorites, // Отправляем обновлённый массив
                });    
            }

            // Для гостей - сохраняем только в localStorage
            localStorage.setItem('favorites', JSON.stringify(newFavorites));    // При этом автоматически генерируется событие storage для всех других вкладок, где открыт тот же сайт.
          
            return { favoritesTotal: newFavorites.length };

        } catch (error) {
            // 6. Откат при ошибке
            const fallback = getCurrentFavorites();
            updateState({
                favorites: fallback,
                favoritesTotal: fallback.length,
                error: getErrorMessage(error),
                isLoading: false
            });

            return { 
                favoritesTotal: currentFavorites.length,
                error: getErrorMessage(error)
            };
        } finally {
            updateState({ isLoading: false });
        }
    }, [user, state.favorites, updateState]);    // Зависимости здесь!

    const removeFromFavorites = useCallback(async (productId: number) => {
        
        try {

            updateState({isLoading: true});

            // Создаём НОВЫЙ массив без мутаций
            const updatedFavorites = state.favorites.filter(id => id !== productId);
            
            // Локальное обновление (синхронно)
            updateState({
                favorites: updatedFavorites,
                isLoading: false
            });

            // Сохранение на сервер (если пользователь авторизован)
            if (user) {
                await axios.post('/products/favorites', { 
                    favorites: updatedFavorites // Отправляем обновлённый массив
                });    
            } 
            // в любом случае обновляем локальное хранилище (При этом автоматически генерируется событие storage для всех других вкладок, где открыт тот же сайт.)
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));

            return { favoritesTotal: updatedFavorites.length };

        } catch (error) {
            // const message = handleError(error);
            const message = getErrorMessage(error); 
            updateState({
                error: message,
                isLoading: false
            });
            return { 
                favoritesTotal: state.favoritesTotal,
                error: message 
            };
        }
    }, [user, state.favorites]);  

    const addToCart = useCallback(async (productId: number, quantity: number = 1) => {
        try {
            //Валидация quantity:
            if (quantity <= 0 || !Number.isInteger(quantity)) {
                return { 
                    cartTotal: calculateCartTotal(state.cart),
                    error: 'Некорректное количество' 
                };
            }

            updateState({isLoading: true});
            
            // { [productId]: quantity } — это один объект вида { 84: 1, 89: 2 }
            // 1. Проверяем, есть ли товар в корзине
            if(productId in state.cart) {       // Было: if(Object.keys(cart).includes(productId.toString())) {... productId in state.cart быстрее Object.keys().includes()
                const newCart = {...state.cart};
                newCart[productId] += quantity; // Увеличиваем количество
                
                updateState({ 
                    cart: newCart,
                    isLoading: false 
                });

                return {
                    cartTotal: calculateCartTotal(newCart),
                    error: `Товар уже есть в корзине (Добавили колиство. Теперь стало: ${newCart[productId]} шт.)` // Понятнее для пользователя
                };
            }
            
            // 2. Если товара ещё нет — добавляем
            const newCart = {...state.cart, 
                [productId]: (state.cart[productId] || 0) + quantity };

            if (user) {
                // console.log('productId', productId);
                // console.log('quantity', newCart[productId]);
                await axios.post('/cart/items', { 
                    product_id: productId,
                    quantity: newCart[productId]
                });    
            } else {
                // localStorage.setItem('cart', JSON.stringify(newCart));    // При этом автоматически генерируется событие storage для всех других вкладок, где открыт тот же сайт.
                saveCart(newCart); // Вместо прямого вызова localStorage
            }

            updateState({ 
                cart: newCart,
                isLoading: false 
            });

            // Реальная реализация может вернуть undefined (если есть try-catch без return) - делаем return
            return { 
                cartTotal: calculateCartTotal(newCart),
            };

        } catch (error) {
            const message = getErrorMessage(error);
            updateState({
                error: message,
                isLoading: false
            });

            return { 
                cartTotal: state.cartTotal,
                error: message 
            };
        }
    }, [user, state.cart]); 

    const removeFromCart = useCallback(async (productId: number): Promise<{ cartTotal: number; error?: string; }> => {
        try {
            updateState({isLoading: true});

            // Создаём новый объект без удаляемого товара (без мутаций!)
            const { [productId]: _, ...rest } = state.cart;             // Деструктуризация с исключением
            const newCart = rest;
            /** Как работает деструктуризация с исключением в нашем случае:
             *  const state.cart = { 84: 1, 89: 2 };            // Исходный объект корзины
             *  const productId = 84;                           // Удаляемый товар
             *  Шаг 1: Деструктуризация с исключением: 
             *  const { [productId]: _, ...rest } = state.cart; // → Извлекаем ключ `84` в переменную `_` (она не используется), а остальное — в `rest`
             *  Шаг 2: Результат: console.log(rest);            // { 89: 2 } - Красота!
             */
            // const newCart = state.cart; delete newCart[productId];   // Удаляем из корзины товар с запрошенным на удаление id - этот вариант решения оставим "в прошлое"...
            
            // Локальное обновление (синхронно)
            updateState({
                cart: newCart,
                cartTotal: calculateCartTotal(newCart),
                isLoading: false
            });

            // Сохранение на сервер (если пользователь авторизован) / localStorage
            if (user) {
                await axios.delete('/cart/items', { 
                    data: { product_id: productId } // Важно: axios.delete отправляет data в body
                });    
            } 

            localStorage.setItem('cart', JSON.stringify(newCart));

            return { cartTotal: calculateCartTotal(newCart) };

        } catch (error) {
            // Откат изменений при ошибке
            const message = getErrorMessage(error); 
            updateState({
                error: message,
                isLoading: false
            });
            return { 
                cartTotal: state.cartTotal,
                error: message 
            };
        }
    }, [user, state.cart]);  

    const updateCart = useCallback(async (productId: number, quantity: number): Promise<{ cartTotal: number; error?: string; }> => {
        try {
            //Валидация quantity:
            if (quantity <= 0 || !Number.isInteger(quantity)) {
                return { 
                    cartTotal: calculateCartTotal(state.cart),
                    error: 'Некорректное количество' 
                };
            }

            updateState({isLoading: true});
            
            // { [productId]: quantity } — это один объект вида { 84: 1, 89: 2 }
            const newCart = {...state.cart};
            newCart[productId] = quantity; // Изменяем количество

            if (user) {
                console.log('productId', productId);
                console.log('quantity', newCart[productId]);
                await axios.post('/cart/items', { 
                    product_id: productId,
                    quantity: newCart[productId]
                });    
            } else {
                // localStorage.setItem('cart', JSON.stringify(newCart));    // При этом автоматически генерируется событие storage для всех других вкладок, где открыт тот же сайт.
                saveCart(newCart); // Вместо прямого вызова localStorage
            }

            updateState({ 
                cart: newCart,
                isLoading: false 
            });

            // Реальная реализация может вернуть undefined (если есть try-catch без return) - делаем return
            return { 
                cartTotal: calculateCartTotal(newCart),
            };

        } catch (error) {
            const message = getErrorMessage(error);
            updateState({
                error: message,
                isLoading: false
            });

            return { 
                cartTotal: state.cartTotal,
                error: message 
            };
        }
    }, [user, state.cart]);
 
    const clearCart = useCallback(async(): Promise<void> => {
        try {
            updateState({isLoading: true});

            // Локальное очищение корзины (синхронно)
            updateState({
                cart: {},
                cartTotal: 0,
                isLoading: false
            });

            // Очистка на сервере (если пользователь авторизован)
            if(user) {
                await axios.delete('/api/cart/clear');
            }

            // Очистка localStorage
            localStorage.removeItem('cart');

        } catch (error) {
            const message = getErrorMessage(error);
            updateState({
                error: message,
                isLoading: false
            });
        }
    }, [user]);

    const getLocalStorageData = (key: string, defaultValue: any) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
          console.error(`Error parsing ${key} from localStorage:`, error);
          return defaultValue;
      }
    };

    const addRecentlyViewedProd = useCallback(async (productId: number) => {
        
        // Оптимизация: пропускаем если уже загружается
        if (state.isLoading) return { error: 'Already processing' };

        updateState({isLoading: true});
            
        const timestamp = Date.now();
        const updatedItems = { ...state.recentlyViewedProducts, [productId]: timestamp };

        try {
            if (user) {
                await axios.post('/recently-viewed', { 
                    product_id: productId,
                    viewed_at: new Date(timestamp).toISOString()
                });    
            } 

            // localStorage.setItem('recently_viewed', JSON.stringify(updatedItems));    // При этом автоматически генерируется событие storage для всех других вкладок, где открыт тот же сайт.
            const sorted = updateRecentlyViewedLocalStorage(updatedItems);

            updateState({ 
                recentlyViewedProducts: updatedItems,
                isLoading: false 
            });

            // Реальная реализация может вернуть undefined (если есть try-catch без return) - делаем return
            return { error: undefined };
        } catch (error) {
            const message = getErrorMessage(error);
            
            updateState({
                error: message,
                isLoading: false
            });

            return { 
                error: message 
            };
        }
    }, [user, state.isLoading]); 

    // Добавляем ограничение количества товаров (элементов), например, последние 6:
    const MAX_ITEMS = 6;

    const updateRecentlyViewedLocalStorage = (items: TRecentlyViewedProducts) => {
        const sorted = Object.entries(items)
            .sort((a, b) => b[1] - a[1])
            .slice(0, MAX_ITEMS)
            .reduce((acc, [productId, timestamp]) => ({ ...acc, [productId]: timestamp }), {});
        
            localStorage.setItem('recently_viewed', JSON.stringify(sorted));
            return sorted;
    };

    const addOrder = useCallback(async (orderId: number): Promise<void>  => {
        
        // 1. текущее состояние
        const currentOrdersIds = state.orders;

        // 2. Создаём новый массив
        const newOrders = [...currentOrdersIds, orderId];                 // добавляет новый заказ в массив существующих заказов 

        // 3. Оптимистичное обновление UI
        updateState({ orders: newOrders });
       
    }, [user, state.orders, updateState]);
  
    // синхронизация данных локального хранилища и БД при авторизации пользователя (когда логинится, например)
    const syncData = useCallback(async (manualData?: SyncData) => {
        // console.log('newFavorites SyncData manualData', manualData);
        if (user) {
            // console.log('Syncing data for user:', user.id);

            // Логика синхронизации...
            try {
                // Если данные переданы вручную — используем их, иначе берём из localStorage
                const data = manualData ?? {
                    favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
                    cart: getLocalStorageData('cart', []),
                    recentlyViewedProducts: getLocalStorageData('recently_viewed', {}),
                };
                // console.log('Syncing data for user:', data);
                const controller = new AbortController();
                const response = await axios.post('/user/sync', data, {     // Route::match(['GET', 'POST'], '/user/sync', [AuthSyncController::class, 'syncLocalData']); - Синхронизация данных при авторизации
                    signal: controller.signal,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                    }
                });

                // console.log('Syncing data responce:', response);

                // Сохраняем БД-версию в контекст
                setState(prev => ({
                    ...prev,
                    favorites: response.data.favorites || prev.favorites,
                    cart: response.data.cart || prev.cart,
                    recentlyViewedProducts: response.data.recentlyViewedProducts || prev.recentlyViewedProducts,
                    
                }));

                // Двойное сохранение: в localStorage на случай разлогина
                if (response.data.favorites) {
                    localStorage.setItem('favorites', JSON.stringify(response.data.favorites));
                }
                if (response.data.cart) {
                    localStorage.setItem('cart', JSON.stringify(response.data.cart));
                }
                if (response.data.recentlyViewedProducts) {
                    localStorage.setItem('recently_viewed', JSON.stringify(response.data.recentlyViewedProducts));
                }
                
                return { success: true };
            } catch (error) {
                if (!axios.isCancel(error)) {
                    
                    // Восстанавливаем данные из localStorage при ошибке
                    const fallbackData = {
                        favorites: getLocalStorageData('favorites', []),
                        cart: getLocalStorageData('cart', []),
                        recentlyViewedProducts: getLocalStorageData('recently_viewed', {}),
                    };
                    setState(prev => ({ ...prev, ...fallbackData }));

                    return { 
                        error: getErrorMessage(error),
                        fallback: true // Флаг что использованы локальные данные
                    };
                }

                return { error: 'Request cancelled' };
            }
        } else {
            console.log('Syncing data for user:', 'user is absent');
            return { success: false };
        }
    }, [user]);

    // Загрузка начальных данных: 
    useEffect(() => {
        const loadData = async () => {
            try {
                if (user) {
                    updateState({
                        cart: cart,
                        favorites: favorites,
                        orders: orders,
                        recentlyViewedProducts: state.recentlyViewedProducts,
                        isLoading: false,
                    });
                }  else {
                    updateState({
                        cart: getLocalStorageData('cart', {}),
                        favorites: getLocalStorageData('favorites', []),
                        orders: getLocalStorageData('orders', []),
                        recentlyViewedProducts: getLocalStorageData('recently_viewed', {}),
                        isLoading: false,
                    });
                }
            } catch (error) {
                const message = getErrorMessage(error); // Новая обработка
                updateState({
                error: message,
                isLoading: false
                });
            }
        };
  
        loadData();

        if (user) {
            syncData(); // Вызов при изменении `user`
        }
  
    }, [user, syncData]); // Зависимость от user - эффект сработает при его изменении


    // !!! Синхонизация между вкладками пока работать не будет (реализуем авторизацию пользователя, когда он логинится)   !!! 
    // Синхронизация между вкладками: Пользователь открыл товар в двух вкладках... в одной вкладке добавил в избранное... во второй вкладке счётчик обновится автоматически...
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            // e.key === 'favorites' - проверяем, что изменилось нужное нам поле
            if (e.key === 'favorites') {
                // e.newValue - новое значение (или null, если данные удалены)
                updateState({ favorites: JSON.parse(e.newValue || '[]') });
            }
            // Аналогично для cart и orders:
            if (e.key === 'cart') {
                // e.newValue - новое значение (или null, если данные удалены)
                updateState({ cart: JSON.parse(e.newValue || '{}') });
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Реализация механизма (синхронизации между вкладками) для авторизованных пользователей и не авторизованных
    // Комбинируем события localStorage + фокус вкладки через комбинацию события localStorage + фокус вкладки (при возврате на вкладку)
    // localStorage для гостей / Проверка при фокусе вкладки для авторизованных
        
    
    // memo помогает нам избегать повторного рендеринга компонента, если его пропсы остаются неизменными.
    // https://code.mu/ru/javascript/framework/react/book/supreme/hooks/api-memo/ 
    // Предотвращает ненужные ререндеры дочерних компонентов, кэширует объект контекста при неизменных зависимостях...
    const contextValue = useMemo(() => ({
        ...state,
        addToFavorites,
        removeFromFavorites,
        addToCart,
        updateCart,
        removeFromCart,
        addRecentlyViewedProd,
        clearCart,
        addOrder
        // Будущие методы добавятся здесь
    }), [
        state.cart,
        state.favorites,
        state.orders,
        state.recentlyViewedProducts,
        state.isLoading,
        state.error,
        addToFavorites,
        removeFromFavorites,
        addToCart,
        updateCart,
        removeFromCart,
        addRecentlyViewedProd,
        clearCart,
        addOrder
    ]);

    return (
        <UserDataContext.Provider value={ contextValue }>
        {children}
      </UserDataContext.Provider>
    );  
};