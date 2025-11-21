// resources/js/Components/Header/Header.tsx
import { Link } from '@inertiajs/react';
import useAppContext from '../../Hooks/useAppContext';
import { useUserDataContext } from '@/Hooks/useUserDataContext';
import { motion } from 'framer-motion';
import useSafeLocation from '@/Hooks/useSafeLocation';
import { useEffect } from 'react';
import { isLegalUser, isIndividualUser } from "@/Types/types";

const Header: React.FC = () => {
    const { user, categoriesMenuArr, authBlockContentFinal, setAuthBlockContentFinal } = useAppContext();
    const { orders, favorites, cartTotal, ordersTotal, preorderTotal } = useUserDataContext();
   
    // Считаем количества
    // const ordersCount = orders.length;
    const ordersCount = ordersTotal;
    const favoritesCount = favorites.length;
    const cartCount = cartTotal;
    const preorderCount = preorderTotal;
    // console.log('preorderTotal', preorderTotal);
    const location = useSafeLocation();

    useEffect(() => {
        if (user && user.user_access_id == 1) {
            const isProfile = location.pathname === '/profile';
            setAuthBlockContentFinal(
                `${user.name},<br>мы рады общению. Вы можете: ` +
                `<br><a href="${isProfile ? '/' : '/profile'}">` +
                `${isProfile ? 'выйти из профиля' : 'войти в профиль'}</a> ` +
                `или <a href="/logout">выйти из системы</a>`
            );
        }
    }, [location.pathname, user]);

    // Если categoriesMenuArr ещё не загружено, показываем заглушку
    if (!categoriesMenuArr) {
        //return <div>Загрузка данных...</div>;
        return;
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
                        <p className="logo-text margin-bottom4px">Флорбол. Россия. Создано со знанием дела.</p>
                        <span className="welcome__text">Добро пожаловать</span>&nbsp;
                        <span className="welcome__invitation">
                            в команду Алетерс<sup className="tm-tooltip" data-tooltip="Зарегистрированная торговая марка">&reg;</sup>
                        </span>
                    </div>
                    <div className="fs14 slogan">
                        &mdash;&nbsp;Участие важно,&nbsp;<br />
                        но главное&nbsp;&mdash;&nbsp;это победа!
                    </div>
                </div>
            </header>
            
            <header className="header-secondline d-flex flex-wrap aline-items-center">

                <Link href="/"><img className="header-logo__img" src="/storage/icons/logo.png" alt="logo" title="Перейти на главную страницу сайта" /></Link>
                <div className="header-secondline__aside--left">
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
                                                    <Link key={category[0].category_view} href={`/products/catalog?category=${category[0].url_semantic}`}>
                                                        <h2>{category[0].category_view}</h2>
                                                    </Link>
                                                    {Object.values(category).map((value, key) => {
                                                        // console.log('Value:', value); 
                                                        return (
                                                            key !== 0 && (
                                                                // Each child in a list should have a unique "key" prop...
                                                                <div key={key}> 
                                                                    {value.prop_url_semantic && (
                                                                        <Link key={value.prop_url_semantic} href={`/products/catalog?category=${category[0].url_semantic}&${value.prop_title}=${value.prop_url_semantic}`}>
                                                                            {value.prop_value_view}
                                                                        </Link>
                                                                    )}
                                                                    {value.model && (
                                                                        <Link key={value.model} href={`/products/catalog?category=${value.url_semantic}&model=${value.model}`}>
                                                                            {value.model}
                                                                        </Link>
                                                                    )}
                                                                    {value.url_semantic && (
                                                                        <Link key={value.url_semantic} href={`/products/${category[0].url_semantic}?category%5B%5D=${value.url_semantic}`}>
                                                                            {value.category_view_2}
                                                                        </Link>
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
                                                                                            <Link key={subCatValue.url_semantic} href={`/products/catalog?category=${subCatValue.url_semantic}`}>
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
                                                    <Link key={category[0].category_view} href={`/products/catalog?category=${category[0].url_semantic}&brand=unihoc`}>
                                                        <h2>{category[0].category_view}</h2>
                                                    </Link>
                                                    {Object.values(category).map((value, key) => {
                                                        // console.log('Value:', value); 
                                                        return (
                                                            key !== 0 && (
                                                                // Each child in a list should have a unique "key" prop...
                                                                <div key={key}> 
                                                                    {value.prop_url_semantic && (
                                                                        <Link key={value.prop_url_semantic} href={`/products/catalog?category=${category[0].url_semantic}&${value.prop_title}=${value.prop_url_semantic}&brand=unihoc`}>
                                                                            {value.prop_value_view}
                                                                        </Link>
                                                                    )}
                                                                    {value.model && (
                                                                        <Link key={value.model} href={`/products/catalog?category=${value.url_semantic}&model=${value.model}&brand=unihoc`}>
                                                                            {value.model}
                                                                        </Link>
                                                                    )}
                                                                    {value.url_semantic && (
                                                                        <Link key={value.url_semantic} href={`/products/${category[0].url_semantic}?category%5B%5D=${value.url_semantic}&brand%5B0%5D=unihoc`}>
                                                                            {value.category_view_2}
                                                                        </Link>
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
                                                                                            <Link key={subCatValue.url_semantic} href={`/products/catalog?category=${subCatValue.url_semantic}&brand=unihoc`}>
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
                                                    <Link key={category[0].category_view} href={`/products/catalog?category=${category[0].url_semantic}&brand=zone`}>
                                                        <h2>{category[0].category_view}</h2>
                                                    </Link>
                                                    {Object.values(category).map((value, key) => {
                                                        // console.log('Value:', value); 
                                                        return (
                                                            key !== 0 && (
                                                                // Each child in a list should have a unique "key" prop...
                                                                <div key={key}> 
                                                                    {value.prop_url_semantic && (
                                                                        <Link key={value.prop_url_semantic} href={`/products/catalog?category=${category[0].url_semantic}&${value.prop_title}=${value.prop_url_semantic}`}>
                                                                            {value.prop_value_view}
                                                                        </Link>
                                                                    )}
                                                                    {value.model && (
                                                                        <Link key={value.model} href={`/products/catalog?category=${value.url_semantic}&model=${value.model}&brand=zone`}>
                                                                            {value.model}
                                                                        </Link>
                                                                    )}
                                                                    {value.url_semantic && (
                                                                        <Link key={value.url_semantic} href={`/products/${category[0].url_semantic}?category%5B%5D=${value.url_semantic}&brand%5B0%5D=zone`}>
                                                                            {value.category_view_2}
                                                                        </Link>
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
                                                                                            <Link key={subCatValue.url_semantic} href={`/products/catalog?category=${subCatValue.url_semantic}`}>
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
                        <div className="header-auth__block--menu">
                            <div className="header-auth__dropdown--block">
                                <p dangerouslySetInnerHTML={{ __html: authBlockContentFinal }} />
                            </div>
                        </div>
                        <img src="/storage/icons/expand-arrow.png" alt="external-link" />
                    </div>
                    <span className="header-auth__user--status">
                        {user 
                            ? user.user_access_id === 2 ? 'Администратор' : user.name
                            : 'Гость'}
                    </span>

                    <motion.div className="header-icon__block" whileHover={{ scale: 0.95 }} whileTap={{ scale: 0.95 }}>
                        {user && ordersCount > 0 && ( <div className="header-orders__counter header-logo__counter color-blue">{ ordersCount }</div> )}
                        {user && (
                            <>
                                <Link className="" href="/profile/orders"><img src="/storage/icons/orders-in-blue.png" alt="orders-icon" title="Покупки / Заказы" /></Link>
                                <p><Link className="header-icon" href="/profile/orders">Заказы</Link></p>
                            </>
                        )}
                    </motion.div>

                    <motion.div  className="header-icon__block" whileHover={{ scale: 0.95 }} whileTap={{ scale: 0.95 }}>
                        {favoritesCount > 0 && ( <div className="header-favorites__counter header-logo__counter color-red">{favoritesCount}</div>)}
                        <Link  className="" href="/products/favorites"><img src="/storage/icons/favorite.png" alt="favorite" title="Посмотреть избранное" /></Link>
                        <p><Link className="header-icon" href="/products/favorites">Избранное</Link></p>
                    </motion.div>

                    <motion.div className="header-icon__block basket-logo__div" whileHover={{ scale: 0.95 }} whileTap={{ scale: 0.95 }}>
                        {cartCount > 0 && ( <div className="header-basket__counter header-logo__counter color-red">{ cartCount }</div> )}
                        <Link className="" href="/products/cart"><img src="/storage/icons/icon-shopping-cart.png" alt="basket" title="Посмотреть корзину" /></Link>
                        <p><Link className="header-icon" href="/products/cart">Корзина</Link></p>
                    </motion.div>

                    {(isLegalUser(user) || isIndividualUser(user)) && (
                        <motion.div className="header-icon__block basket-logo__div" whileHover={{ scale: 0.95 }} whileTap={{ scale: 0.95 }}>
                            {preorderCount > 0 && ( <div className="header-basket__counter header-logo__counter color-red">{ preorderCount }</div> )}
                            <Link className="" href="/products/preorder"><img src="/storage/icons/combo-chart.png" alt="preorder" title="Предзаказ" /></Link>
                            <p><Link className="header-icon" href="/products/cart">Предзаказ</Link></p>
                        </motion.div>
                    )} 

                    <motion.div className="header-icon__block basket-logo__div" whileHover={{ scale: 0.95 }} whileTap={{ scale: 0.95 }}>
                        <a 
                            href="#support-block" 
                            className="header-help-emoji" 
                            title="Помощь с заказом"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('support-block')?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                });
                            }}
                        >
                            {/* 💬 */} 
                             <span>🎧</span>
                        </a>
                    </motion.div>
                    

                </div>

            </header>
        </>
    );
};

export default Header;