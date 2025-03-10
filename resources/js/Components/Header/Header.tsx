// resources/js/Components/Header/Header.tsx
import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios'; // можно использовать Inertia.js для запросов
import useAppContext from '../../Hooks/useAppContext';

interface OrderResponse {
    ordersCount: number;
}

const Header: React.FC = () => {
    const { user, categoriesMenuArr, authBlockContentFinal } = useAppContext();
    
    // Стейты для счётчиков - данных, которые хранятся внутри компонента. TypeScript автоматически определяет тип состояния на основе начального значения. 
    // Однако, если начальное значение не соответствует ожидаемому типу (например, null или данные из localStorage), нужно явно указать тип.
    const [ordersCount, setOrdersCount] = useState<number>(0);
    const [favoritesCount, setFavoritesCount] = useState<number>(0);
    const [cartCount, setCartCount] = useState<number>(0);

    /**
     * Данные из localStorage возвращаются в виде строки (string) или null, если ключ отсутствует. Поэтому нужно:

        Проверить, что данные не null.
        Преобразовать строку в нужный тип (например, массив или объект).
        Указать тип для переменной.

        Как вариант:
        
        const favorites = localStorage.getItem('favorites');
        const cart = localStorage.getItem('cart');

        if (favorites) {
        const parsedFavorites: Array<{ id: number; name: string }> = JSON.parse(favorites);
        setFavoritesCount(parsedFavorites.length);
        }

        if (cart) {
        const parsedCart: Array<{ id: number; quantity: number }> = JSON.parse(cart);
        setCartCount(parsedCart.length);
        }

        Здесь:
        localStorage.getItem возвращает string | null.
        JSON.parse преобразует строку в объект или массив.
        Мы явно указываем тип для parsedFavorites и parsedCart, чтобы TypeScript знал, как работать с этими данными.

        Типизация данных для авторизованных пользователей
        Если мы делаем запрос к API для получения данных, то нужно типизировать ответ. Мы используем axios:

        interface OrderResponse {
            ordersCount: number;
        }

        useEffect(() => {
        if (user) {
            axios.get<OrderResponse>('/api/orders')
            .then((response) => {
                setOrdersCount(response.data.ordersCount);
            })
            .catch((error) => {
                console.error('Ошибка при загрузке данных:', error);
            });
        }
        }, [user]);
        
        Здесь:
        axios.get<OrderResponse> указывает, что ответ будет соответствовать типу OrderResponse.
        response.data.ordersCount будет типом number, как указано в интерфейсе.
     */

    // Эффект для инициализации стейтов
    useEffect(() => {
        // Загрузка данных из локального хранилища для избранного и корзины
        const favorites = localStorage.getItem('favorites');
        const cart = localStorage.getItem('cart');
        const orders = localStorage.getItem('orders');

        // Загрузка данных для авторизованных пользователей
        if (user) {
            // Создаём маршрут и контроллер для получения данных (создаём API-эндпойнт в Laravel - сказал "своими словами" - не уверен, что применил правильную формулировку) в routes/api.php:
            axios.get<OrderResponse>('/api/user-orders-count')
            .then((response) => {
                setOrdersCount(response.data.ordersCount);
            })
            .catch((error) => {
                console.error('Ошибка при загрузке данных:', error);
                // Можно добавить уведомление об ошибке - надо подумать как...
            });
        } else {
            if (orders) {
                setOrdersCount(JSON.parse(orders).length);
            }
        }

        if (favorites) {
            setFavoritesCount(JSON.parse(favorites).length);
        }

        if (cart) {
            setCartCount(JSON.parse(cart).length);
        }
    }, [user]);

    // Если categoriesMenuArr ещё не загружено, показываем заглушку
    if (!categoriesMenuArr) {
        return <div>Загрузка данных...</div>;
    }

    // console.table(user); // Вывод в консоль
    // Преобразуем объект в массив
    const unihocZoneRussiaArray = Object.values(categoriesMenuArr.UnihocZoneRussia);
    const unihoc = Object.values(categoriesMenuArr.unihoc);
    const zone = Object.values(categoriesMenuArr.zone);

    // Проверка, что полученные данные являются массивом:
    if (!Array.isArray(unihocZoneRussiaArray)) {
        return <div>Данные unihocZoneRussiaArray не загружены или имеют неверный формат.</div>;
    } else if (!Array.isArray(unihoc)) {
        return <div>Данные unihoc не загружены или имеют неверный формат.</div>;
    } else if (!Array.isArray(zone)) {
        return <div>Данные zone не загружены или имеют неверный формат.</div>;
    }

    return (
        <>
            <header>
                <div className="header-top__line--welcome d-flex flex-sb flex-wrap">
                    <div className="header-top__line--left">
                        <span className="welcome__text">Добро пожаловать</span>&nbsp;
                        <span className="welcome__invitation">в <Link href="https://www.unihoc.com/teams" target="_blank">команду</Link> UNIHOC</span>
                    </div>
                    <div className="fs12">
                        &mdash;&nbsp;Участие важно,<br />
                        но главное&nbsp;&mdash;&nbsp;это победа!
                    </div>
                </div>
            </header>
             <header className="header-secondline d-flex flex-wrap">
                <div className="header-secondline__aside--left">
                    <Link href="/"><img className="header-logo__img" src="/storage/icons/logo.png" alt="logo" title="Перейти на главную страницу сайта" /></Link>
                    <nav>
                        <div className="d-flex flex-wrap margin-left12px">
                            <p>UnihocZoneRussia</p>
                            <div className="dropdown-menu">
                                <img src="/storage/icons/expand-arrow.png" alt="external-link" />
                                <div className="header-popup__menu">
                                    {unihocZoneRussiaArray.map((category, index) => {
                                        // console.log('Category:', category);
                                        if (category[0]) {
                                            return (
                                                <div key={category[0].url_semantic} className="menu--element">
                                                    <Link key={category[0].category_view} href={`/products/catalog?${category[0].url_semantic}`}>
                                                        <h2>{category[0].category_view}</h2>
                                                    </Link>
                                                    {Object.values(category).map((value, key) => {
                                                        // console.log('Value:', value); 
                                                        return (
                                                            key !== 0 && (
                                                                // Each child in a list should have a unique "key" prop...
                                                                <div key={key}> 
                                                                    {value.prop_url_semantic && (
                                                                        <a key={value.prop_url_semantic} href={`/products/catalog?${category[0].url_semantic}=${value.prop_title}&${value.prop_title}=${value.prop_url_semantic}`}>
                                                                            {value.prop_value_view}
                                                                        </a>
                                                                    )}
                                                                    {value.model && (
                                                                        <a key={value.model} href={`/products/catalog?${value.url_semantic}=model&model=${value.model}`}>
                                                                            {value.model}
                                                                        </a>
                                                                    )}
                                                                    {value.url_semantic && (
                                                                        <a key={value.url_semantic} href={`/products/${category[0].url_semantic}?category%5B%5D=${value.url_semantic}`}>
                                                                            {value.category_view_2}
                                                                        </a>
                                                                    )}
                                                                    
                                                                    {/* {console.table(value[0])} */}
                                                                    {!value.prop_url_semantic && !value.model && !value.url_semantic && (
                                                                        value[0] && ( // Проверка на существование 
                                                                        <div key={value[0].url_semantic}>
                                                                            <p><strong>{value[0].category_view_2}</strong></p>
                                                                            <ul className="prodsubcat-list__pop-up">
                                                                                {Object.values(value).map((subCatValue, subCatKey) => (
                                                                                    subCatKey !== 0 && subCatValue.url_semantic && (
                                                                                        <li key={subCatKey}>
                                                                                            <Link key={subCatValue.url_semantic} href={`/products/catalog?${subCatValue.url_semantic}`}>
                                                                                                {subCatValue.category_view_2}
                                                                                            </Link>
                                                                                        </li>
                                                                                    )
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )
                                                        );
                                                    })}
                                                </div>
                                            );
                                        }
                                        return null; // Если category[0] не существует, возвращаем null
                                    })}
                                </div>
                            </div>  

                            <p>Unihoc</p>
                            <div className="dropdown-menu">
                                <img src="/storage/icons/expand-arrow.png" alt="external-link" />
                                <div className="header-popup__menu">
                                    {unihoc.map((category, index) => {
                                        // console.log('Category:', category);
                                        if (category[0]) {
                                            return (
                                                <div key={category[0].url_semantic} className="menu--element">
                                                    <Link key={category[0].category_view} href={`/products/catalog?${category[0].url_semantic}`}>
                                                        <h2>{category[0].category_view}</h2>
                                                    </Link>
                                                    {Object.values(category).map((value, key) => {
                                                        // console.log('Value:', value); 
                                                        return (
                                                            key !== 0 && (
                                                                // Each child in a list should have a unique "key" prop...
                                                                <div key={key}> 
                                                                    {value.prop_url_semantic && (
                                                                        <a key={value.prop_url_semantic} href={`/products/catalog?${category[0].url_semantic}=${value.prop_title}&${value.prop_title}=${value.prop_url_semantic}`}>
                                                                            {value.prop_value_view}
                                                                        </a>
                                                                    )}
                                                                    {value.model && (
                                                                        <a key={value.model} href={`/products/catalog?${value.url_semantic}=model&model=${value.model}`}>
                                                                            {value.model}
                                                                        </a>
                                                                    )}
                                                                    {value.url_semantic && (
                                                                        <a key={value.url_semantic} href={`/products/${category[0].url_semantic}?category%5B%5D=${value.url_semantic}`}>
                                                                            {value.category_view_2}
                                                                        </a>
                                                                    )}
                                                                    
                                                                    {/* {console.table(value[0])} */}
                                                                    {!value.prop_url_semantic && !value.model && !value.url_semantic && (
                                                                        value[0] && ( // Проверка на существование 
                                                                        <div key={value[0].url_semantic}>
                                                                            <p><strong>{value[0].category_view_2}</strong></p>
                                                                            <ul className="prodsubcat-list__pop-up">
                                                                                {Object.values(value).map((subCatValue, subCatKey) => (
                                                                                    subCatKey !== 0 && subCatValue.url_semantic && (
                                                                                        <li key={subCatKey}>
                                                                                            <Link key={subCatValue.url_semantic} href={`/products/catalog?${subCatValue.url_semantic}`}>
                                                                                                {subCatValue.category_view_2}
                                                                                            </Link>
                                                                                        </li>
                                                                                    )
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )
                                                        );
                                                    })}
                                                </div>
                                            );
                                        }
                                        return null; // Если category[0] не существует, возвращаем null
                                    })}
                                </div>
                            </div>  

                            <p>Zone</p>
                            <div className="dropdown-menu">
                                <img src="/storage/icons/expand-arrow.png" alt="external-link" />
                                <div className="header-popup__menu">
                                    {zone.map((category, index) => {
                                        // console.log('Category:', category);
                                        if (category[0]) {
                                            return (
                                                <div key={category[0].url_semantic} className="menu--element">
                                                    <Link key={category[0].category_view} href={`/products/catalog?${category[0].url_semantic}`}>
                                                        <h2>{category[0].category_view}</h2>
                                                    </Link>
                                                    {Object.values(category).map((value, key) => {
                                                        // console.log('Value:', value); 
                                                        return (
                                                            key !== 0 && (
                                                                // Each child in a list should have a unique "key" prop...
                                                                <div key={key}> 
                                                                    {value.prop_url_semantic && (
                                                                        <a key={value.prop_url_semantic} href={`/products/catalog?${category[0].url_semantic}=${value.prop_title}&${value.prop_title}=${value.prop_url_semantic}`}>
                                                                            {value.prop_value_view}
                                                                        </a>
                                                                    )}
                                                                    {value.model && (
                                                                        <a key={value.model} href={`/products/catalog?${value.url_semantic}=model&model=${value.model}`}>
                                                                            {value.model}
                                                                        </a>
                                                                    )}
                                                                    {value.url_semantic && (
                                                                        <a key={value.url_semantic} href={`/products/${category[0].url_semantic}?category%5B%5D=${value.url_semantic}`}>
                                                                            {value.category_view_2}
                                                                        </a>
                                                                    )}
                                                                    
                                                                    {/* {console.table(value[0])} */}
                                                                    {!value.prop_url_semantic && !value.model && !value.url_semantic && (
                                                                        value[0] && ( // Проверка на существование 
                                                                        <div key={value[0].url_semantic}>
                                                                            <p><strong>{value[0].category_view_2}</strong></p>
                                                                            <ul className="prodsubcat-list__pop-up">
                                                                                {Object.values(value).map((subCatValue, subCatKey) => (
                                                                                    subCatKey !== 0 && subCatValue.url_semantic && (
                                                                                        <li key={subCatKey}>
                                                                                            <Link key={subCatValue.url_semantic} href={`/products/catalog?${subCatValue.url_semantic}`}>
                                                                                                {subCatValue.category_view_2}
                                                                                            </Link>
                                                                                        </li>
                                                                                    )
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )
                                                        );
                                                    })}
                                                </div>
                                            );
                                        }
                                        return null; // Если category[0] не существует, возвращаем null
                                    })}
                                </div>
                            </div>  

                        </div>
                    </nav>
                </div>

                <div className="header-secondline__aside--right">
                    <div id='headerauthblockdiv' className="header-auth__dropdown">
                        <img src="/storage/icons/expand-arrow.png" alt="external-link" />
                        <div className="header-auth__block--menu">
                            <div className="header-auth__dropdown--block">
                                <p dangerouslySetInnerHTML={{ __html: authBlockContentFinal }} />
                            </div>
                        </div>
                    </div>
                    <span className="header-auth__user--status">
                        {user ? user.name : 'Гость'}
                    </span>

                    <div className="header-icon__block">
                        {ordersCount > 0 && ( <div className="header-orders__counter header-logo__counter color-blue">{ ordersCount }</div> )}
                        <Link className="" href="/profile?getorders=all"><img src="/storage/icons/orders-in-blue.png" alt="orders-icon" title="Покупки / Заказы" /></Link>
                        <p><Link className="header-icon" href="/profile?getorders=all">Заказы</Link></p>
                    </div>

                    <div className="header-icon__block">
                        {favoritesCount > 0 && ( <div className="header-favorites__counter header-logo__counter color-red">{favoritesCount}</div>)}
                        <Link  className="" href="/products/favorites"><img src="/storage/icons/favorite.png" alt="favorite" title="Посмотреть избранное" /></Link>
                        <p><Link className="header-icon" href="/products/favorites">Избранное</Link></p>
                    </div>

                    <div className="header-icon__block basket-logo__div">
                        {cartCount > 0 && ( <div className="header-basket__counter header-logo__counter color-red">{ cartCount }</div> )}
                        <Link className="" href="/products/basket"><img src="/storage/icons/icon-shopping-cart.png" alt="basket" title="Посмотреть корзину" /></Link>
                        <p><Link className="header-icon" href="/products/basket">Корзина</Link></p>
                    </div>
                </div>

            </header>
        </>
    );
};

export default Header;