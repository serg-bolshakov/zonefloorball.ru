// resources/js/contexts/UserData/UserDataProvider.tsx    # Логика провайдера
import { useState, useEffect, useCallback, useMemo } from 'react';
import useAppContext from '@/Hooks/useAppContext';
import axios from 'axios';
import { UserDataState } from './UserDataContext';
import { UserDataContext } from './UserDataContext';
import { API_ENDPOINTS } from '@/Constants/api';
import { getErrorMessage } from '@/Utils/error';
import { TCart } from './UserDataContext';

export const UserDataProvider = ({ children }: { children: React.ReactNode }) => {
    
    const { user, cart, favorites, orders } = useAppContext();
    const [state, setState] = useState<UserDataState>({
        cart:      {},  // Пустой объект вместо массива { [productId]: quantity } — это один объект вида { 84: 1, 89: 2 }  
        favorites: [],
        orders:    [],
        cartTotal: 0,
        favoritesTotal: 0,
        ordersTotal: 0, 
        isLoading: true, // Начинаем с true, так как данные загружаются
        error: null
    });

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

    // Для методов, которые зависят от состояния, указываем зависимости! Не забываем!
    const addToFavorites = useCallback(async (productId: number) => {
        try {
            updateState({isLoading: true});

            const { favorites } = state;
            if (favorites.includes(productId)) {
                return {
                    // favoritesTotal: state.favoritesTotal,
                    favoritesTotal: favorites.length,
                    error: 'Товар уже находится в избранном - его уже можно купить...' 
                };
            }

            const newFavorites = [...favorites, productId];                 // добавляет id-товара в массив айдишников 
            const update = {
                favorites: newFavorites,
                isLoading: false
            };

            if (user) {
                await axios.post(API_ENDPOINTS.FAVORITES, { 
                    favorites: newFavorites                                 // Важно: сервер должен явно указать, какой формат данных он принимает!
                  });    
                // в базу данных обновлённый массив товаров Избранного
                // axios должен автоматически пребразовать массив (свойство объекта) в JSON-строку - потом посмотрим, что получилось...
                updateState(update);
            } else {
                localStorage.setItem('favorites', JSON.stringify(newFavorites));    // При этом автоматически генерируется событие storage для всех других вкладок, где открыт тот же сайт.
                updateState(update);
            }
            
            return { favoritesTotal: newFavorites.length };

        } catch (error) {
            // const message = handleError(error);
            const message = getErrorMessage(error); // Новая обработка
            updateState({
                error: message,
                isLoading: false
            });
            return { 
                favoritesTotal: state.favoritesTotal,
                error: message 
            };
        }
    }, [user, state.favorites]);    // Зависимости здесь!

    const removeFromFavorites = useCallback(async (productId: number) => {
        try {
            updateState({isLoading: true});

            // Создаём НОВЫЙ массив без мутаций
            const updatedFavorites = state.favorites.filter(id => id !== productId);
            
            // Локальное обновление (синхронно)
            updateState({
                favorites: updatedFavorites,
                favoritesTotal: updatedFavorites.length,
                isLoading: false
            });

            // Сохранение на сервер (если пользователь авторизован)
            if (user) {
                await axios.post(API_ENDPOINTS.FAVORITES, { 
                    favorites: updatedFavorites // Отправляем обновлённый массив
                });    
            } else {
                localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            }

            return { favoritesTotal: updatedFavorites.length };

        } catch (error) {
            // const message = handleError(error);
            const message = getErrorMessage(error); // Новая обработка
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
                    error: `Товар уже в корзине (теперь: ${newCart[productId]} шт.)` // Понятнее для пользователя
                };
            }
            
            // 2. Если товара ещё нет — добавляем
            const newCart = {...state.cart, 
                [productId]: (state.cart[productId] || 0) + quantity };

            if (user) {
                await axios.post(API_ENDPOINTS.CART, { 
                    products: newCart
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
                await axios.post(API_ENDPOINTS.CART, { 
                    cart: newCart
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
 
    const getLocalStorageData = (key: string, defaultValue: any) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
          console.error(`Error parsing ${key} from localStorage:`, error);
          return defaultValue;
      }
    };
  
    // Загрузка начальных данных: 
    useEffect(() => {
      const loadData = async () => {
        try {
            if (user) {
                updateState({
                    cart: cart,
                    favorites: favorites,
                    orders: orders,
                    isLoading: false,
                });
            }  else {
                updateState({
                    cart: getLocalStorageData('cart', {}),
                    favorites: getLocalStorageData('favorites', []),
                    orders: getLocalStorageData('orders', []),
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
  
    }, [user]); // Зависимость от user - эффект сработает при его изменении
    
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
    const fetchFavorites = useCallback(async () => {
        if(!user) return;
        try {
            const { data } = await axios.get(API_ENDPOINTS.FAVORITES);
            updateState({
                favorites: data,
                favoritesTotal: data.length
            });
        } catch (error) {
            console.error('Ошибка загрузки избранного:', getErrorMessage(error));
        }
    }, [user]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchFavorites(); // Только при возврате на вкладку
                if(!user) {
                    // Для гостей берём актуальные данные из localStorage
                    updateState({
                        favorites: getLocalStorageData('favorites', [])
                    });
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [user, fetchFavorites]);
    // Почему это лучше: 0 лишних запросов пока пользователь неактивен, мгновенное обновление при переключении вкладок, простота (не требует WebSockets)...

    // memo помогает нам избегать повторного рендеринга компонента, если его пропсы остаются неизменными.
    // https://code.mu/ru/javascript/framework/react/book/supreme/hooks/api-memo/ 
    // Предотвращает ненужные ререндеры дочерних компонентов, кэширует объект контекста при неизменных зависимостях...
    const contextValue = useMemo(() => ({
        ...state,
        addToFavorites,
        removeFromFavorites,
        addToCart,
        updateCart
        // Будущие методы добавятся здесь
    }), [
        state.cart,
        state.favorites,
        state.orders,
        state.isLoading,
        state.error,
        addToFavorites,
        removeFromFavorites,
        addToCart,
        updateCart
    ]);

    return (
        <UserDataContext.Provider value={ contextValue }>
        {children}
      </UserDataContext.Provider>
    );  
};