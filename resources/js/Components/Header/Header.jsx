import React from 'react';
import { Link } from '@inertiajs/react';


const Header = ({ 
    categoriesMenuArr,
    authBlockContentFinal,
    user, 
}) => {
    // console.table(user); // Вывод в консоль
    // Преобразуем объект в массив
    const unihocZoneRussiaArray = Object.values(categoriesMenuArr.UnihocZoneRussia);

    // Проверка, что данные являются массивом
    if (!Array.isArray(unihocZoneRussiaArray)) {
        return <div>Данные unihocZoneRussiaArray не загружены или имеют неверный формат.</div>;
    }

    // Проверка наличия данных
    /*
        if (!categoriesMenuArr || !categoriesMenuArr.UnihocZoneRussia || !Array.isArray(categoriesMenuArr.UnihocZoneRussia)) {
            return (
                <div>
                    Ошибка: данные не загружены или имеют неверный формат.
                    <pre>{JSON.stringify(categoriesMenuArr, null, 2)}</pre>
                </div>
            );
        }
    */
    
    const unihoc = Object.values(categoriesMenuArr.unihoc);
    const zone = Object.values(categoriesMenuArr.zone);

    return (
        <>
            <header>
                <div className="header-top__line--welcome d-flex flex-sb flex-wrap">
                    <div className="header-top__line--left">
                        <span className="welcome__text">Добро пожаловать к нам</span>&nbsp;
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
                    
                    </div>
                </div>

            </header>
        </>
    );
};

export default Header;