// resources/js/Components/Header/Header.tsx

import { Link } from '@inertiajs/react';
import useAppContext from '../../Hooks/useAppContext';
import { useUserDataContext } from '@/Hooks/useUserDataContext';
import { motion } from 'framer-motion';
import useSafeLocation from '@/Hooks/useSafeLocation';
import { useState, useRef, useEffect } from 'react';
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
    
    const [isPartnersDropdownOpen, setIsPartnersDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Функция для красивого форматирования телефона
    const formatPhone = (phone: string) => {
        // Убираем все нецифровые символы
        const cleaned = phone.replace(/\D/g, '');
        
        // Форматируем в зависимости от длины
        if (cleaned.length === 11) {
            // Российский формат: +7 (XXX) XXX-XX-XX
            return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
        } else if (cleaned.length === 12) {
            // Международный формат с кодом страны
            return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8, 10)}-${cleaned.slice(10)}`;
        }
        
        // Если не подходит под стандартные форматы, возвращаем как есть
        return phone;
    };

    // Закрытие по клику вне меню
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsPartnersDropdownOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                {/* <div className="header-top__line--welcome d-flex flex-sb flex-wrap"> */}
                <div className="header-top-grid">
                    {/* Левая часть (текст + партнеры) */}
                    {/* <div className="header-top__line--left d-flex flex-wrap"> */}
                    <div className="header-top-left">
                        <div className="header-welcome-block">
                            <p className="logo-text margin-bottom4px">Флорбол. Россия. Создаём со знанием дела.</p>
                            <span className="welcome__text">Добро пожаловать</span>&nbsp;
                            <span className="welcome__invitation">
                                в команду Алетерс<sup className="tm-tooltip" data-tooltip="Зарегистрированная торговая марка">&reg;</sup>
                            </span>
                        </div>
                        {/* === НОВЫЙ БЛОК: Линия с партнерами === */}
                        <div className="header-partners-line">
                            {/* <div className="partners-select-wrapper">
                                <div className="partners-label">
                                    🤝
                                    <span className="partners-label-text">Наши партнёры в регионах:</span>
                                </div> */}
                            <div className="partners-compact-wrapper">    
                                {/* Кастомный dropdown вместо select */}
                                <div 
                                    className={`custom-partners-dropdown ${isPartnersDropdownOpen ? 'active-partners-dropdown' : ''}`}
                                    ref={dropdownRef}
                                >
                                    <button 
                                        className="dropdown-trigger" 
                                        onClick={() => setIsPartnersDropdownOpen(!isPartnersDropdownOpen)}
                                        aria-expanded={isPartnersDropdownOpen}
                                        aria-haspopup="true"
                                        title="Контакт партнера в вашем регионе"
                                    >
                                        <span className="dropdown-placeholder">🤝 Партнёры в регионах</span>
                                        <img src="/storage/icons/expand-arrow.png" alt="▼" className="dropdown-arrow" />
                                    </button>
                                    
                                    <div className="partners-menu">
                                        {/* Пример данных - в реальности нужно вынести в контекст/пропсы */}
                                        {[
                                            {
                                                id: 2,
                                                city: 'Северодвинск',
                                                region: 'Архангельская область',
                                                country: 'Россия',
                                                contactName: 'Анна Венчакова',
                                                phone: '+7 (905) 293-52-35',
                                                email: 'anna@floorball-shop.ru',
                                                website: null,
                                                telegram: null,
                                                vk: 'https://vk.com/floorballshop_ao',
                                                isActive: true
                                            },
                                            {
                                                id: 1,
                                                city: 'Нижний Новгород',
                                                region: 'Нижегородская область',
                                                country: 'Россия',
                                                contactName: 'Сергей Большаков',
                                                phone: '+7(953) 415 60 10',
                                                email: 'serg.bolshakov@gmail.com',
                                                website: null,
                                                telegram: 'https://t.me/UnihocZoneRussia',
                                                vk: 'https://vk.com/unihoczonerussia',
                                                isActive: true
                                            },
                                            /* {
                                                id: 1,
                                                city: 'Москва',
                                                region: 'Московская область',
                                                country: 'Россия',
                                                contactName: 'Иванов Иван',
                                                phone: '+74951234567',
                                                email: 'moscow@partner.ru',
                                                website: 'https://moscow-florball.ru',
                                                telegram: 'https://t.me/moscow_florball',
                                                vk: 'https://vk.com/moscow_florball',
                                                isActive: true
                                            },
                                            {
                                                id: 2,
                                                city: 'Новосибирск',
                                                region: 'Новосибирская область',
                                                country: 'Россия',
                                                contactName: 'Петров Пётр',
                                                phone: '+73832123456',
                                                email: 'novosibirsk@partner.ru',
                                                website: 'https://partner-novosib.ru',
                                                telegram: 'https://t.me/novosib_florball',
                                                vk: 'https://vk.com/novosib_florball',
                                                isActive: true
                                            },
                                            {
                                                id: 3,
                                                city: 'Екатеринбург',
                                                region: 'Свердловская область',
                                                country: 'Россия',
                                                contactName: 'Сидоров Алексей',
                                                phone: '+73432123456',
                                                email: 'ekb@partner.ru',
                                                website: 'https://ekb-florball.ru',
                                                telegram: null, // У некоторых может не быть
                                                vk: 'https://vk.com/ekb_florball',
                                                isActive: true
                                            },
                                            {
                                                id: 4,
                                                city: 'Алматы',
                                                region: '',
                                                country: 'Казахстан',
                                                contactName: 'Каримов Али',
                                                phone: '+77272567890',
                                                email: 'almaty@partner.kz',
                                                website: 'https://example.kz',
                                                telegram: 'https://t.me/almaty_florball',
                                                vk: null,
                                                isActive: true
                                            }*/
                                        ].map(partner => (
                                            <div key={partner.id} className="partner-item">
                                                <div className="partner-header">
                                                    <p className="partner-city margin-bottom8px">
                                                        {partner.country !== 'Россия' && <span className="partner-country">{partner.country}, </span>}
                                                        {partner.city}<br />
                                                        {partner.region && <span className="partner-region"> ({partner.region})</span>}
                                                    </p>
                                                    <p className="partner-contact">{partner.contactName}</p>

                                                    {/* БЫСТРЫЙ НАБОР ТЕЛЕФОНА - сразу видно и доступно */}
                                                    {/* {partner.phone && (
                                                        <div className="partner-quick-call">
                                                            <a 
                                                                href={`tel:${partner.phone}`} 
                                                                className="quick-call-btn"
                                                                onClick={(e) => {
                                                                    // Отслеживание в аналитике, если нужно
                                                                    console.log(`Быстрый звонок: ${partner.city} - ${partner.phone}`);
                                                                }}
                                                            >
                                                                📞 Набрать номер
                                                            </a>
                                                            <span className="quick-call-phone">{formatPhone(partner.phone)}</span>
                                                        </div>
                                                    )} */}
                                                    {partner.phone && (
                                                    <div className="partner-quick-call">
                                                        <span className="quick-call-label">📞 Позвонить:</span>
                                                        <a 
                                                            href={`tel:${partner.phone}`} 
                                                            className="quick-call-phone-link"
                                                            title={`Позвонить ${partner.contactName}`}
                                                        >
                                                            {formatPhone(partner.phone)}
                                                        </a>
                                                        <span className="quick-call-hint">(клик для звонка)</span>
                                                    </div>
                                                )}
                                                </div>
                                                
                                                <div className="partner-contacts">
                                                    {/* {partner.phone && (
                                                        <a href={`tel:${partner.phone}`} className="contact-link" title={`Позвонить: ${partner.phone}`}>
                                                            <img src="/storage/icons/telefon-logo.png" alt="телефон" />
                                                        </a>
                                                    )} */}
                                                    
                                                    {partner.email && (
                                                        <a href={`mailto:${partner.email}`} className="contact-link" title="Написать email">
                                                            <img src="/storage/icons/gmail-logo-colored.jpg" alt="email" />
                                                        </a>
                                                    )}
                                                    
                                                    {partner.website && (
                                                        <a href={partner.website} target="_blank" rel="noopener noreferrer" className="contact-link" title="Перейти на сайт">
                                                            {/* <img src="/storage/icons/website-logo.png" alt="сайт" /> */}
                                                            🌐
                                                        </a>
                                                    )}
                                                    
                                                    {partner.telegram && (
                                                        <a href={partner.telegram} target="_blank" rel="noopener noreferrer" className="contact-link" title="Написать в Telegram">
                                                            <img src="/storage/icons/telegram-logo-colored.png" alt="telegram" />
                                                        </a>
                                                    )}
                                                    
                                                    {partner.vk && (
                                                        <a href={partner.vk} target="_blank" rel="noopener noreferrer" className="contact-link" title="Написать ВКонтакте">
                                                            <img src="/storage/icons/vk-logo-colored.png" alt="vk" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* <span className="partners-hint">(Выберите город для связи с партнёром)</span> */}
                            </div>
                        </div>
                    </div>
                    
                    {/* <div className="fs14 slogan">
                        &mdash;&nbsp;Участие важно,&nbsp;<br />
                        но главное&nbsp;&mdash;&nbsp;это победа!
                    </div> */}
                    
                    {/* Правая часть (слоган) */}
                    <div className="header-top-right">
                        <div className="fs14 slogan">
                            &mdash;&nbsp;Участие важно,&nbsp;<br />
                            но главное&nbsp;&mdash;&nbsp;это победа!
                        </div>
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

                    <motion.div className="header-icon__block fs12 margin-top2px" whileHover={{ scale: 0.95 }} whileTap={{ scale: 0.95 }}>
                        <Link 
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
                            <span className="header-emoji">🎧</span>
                        </Link>
                        <p><Link className="header-icon" href="#support-block">Помощь</Link></p>
                    </motion.div>

                </div>

            </header>



        </>
    );
};

export default Header;