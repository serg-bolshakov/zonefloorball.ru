// resources/js/contexts/UserData/UserDataProvider.tsx    # Логика провайдера
import { useState, useEffect, useCallback, useMemo } from 'react';
import useAppContext from '@/Hooks/useAppContext';
import axios from 'axios';
import { UserDataState } from './UserDataContext';
import { UserDataContext } from './UserDataContext';
import { API_ENDPOINTS } from '@/Constants/api';
import { getErrorMessage } from '@/Utils/error';

export const UserDataProvider = ({ children }: { children: React.ReactNode }) => {
    
    const { user } = useAppContext();
    const [state, setState] = useState<UserDataState>({
        cart:      [],
        favorites: [],
        orders:    [],
        cartTotal: 0,
        favoritesTotal: 0,
        ordersTotal: 0, 
        isLoading: true, // Начинаем с true, так как данные загружаются
        error: null
    });

    // Помним, что состояние обновляется асинхронно! 
    // если просто setState({ ...state, newValue }) - может использовать устаревшее состояние
    // setState(prev => ({ ...prev, newValue })) - всегда использует актуальное состояние
    // Общая функция обновления состояния
    const updateState = (partialState: Partial<UserDataState>) => {
        setState(prev => ({
                ...prev,
                ...partialState,
                // Автоматически пересчитываем totals при изменении массивов
                ...(partialState.cart && { cartTotal: partialState.cart.length }),
                ...(partialState.favorites && { favoritesTotal: partialState.favorites.length }),
                ...(partialState.orders && { ordersTotal: partialState.orders.length })
        }));
    };

    // Обработка ошибок
    // const handleError = (error: unknown): string => {
    //     return error instanceof Error ? error.message : 'Unknown error';
    // };
    // Применили утилиту!
  
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
              //const userData = getLocalStorageData('userData', {});
              const { data } = await axios.get('/api/user-data');
              updateState({
                ...data, 
                isLoading: false
              });
            }  else {
                updateState({
                    cart: getLocalStorageData('cart', []),
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
            // Аналогично для cart и orders
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
        // Будущие методы добавятся здесь
    }), [
        state.cart,
        state.favorites,
        state.orders,
        state.isLoading,
        state.error,
        addToFavorites,
        removeFromFavorites
    ]);

    return (
        <UserDataContext.Provider value={ contextValue }>
        {children}
      </UserDataContext.Provider>
    );  
};