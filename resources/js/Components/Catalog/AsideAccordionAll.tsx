// resources/js/Components/Catalog/AsideAccordionAll.tsx
import React, {useState} from 'react';
import { useId } from 'react';                  // useId доступен только в React 18 и выше
import { Link } from '@inertiajs/react';
import useAppContext from '../../Hooks/useAppContext';
// import { useGenerateId } from '../../Hooks/useGenerateId';

const AsideAccordionAll: React.FC = () => {
    const { categoriesMenuArr } = useAppContext();
    // const generateId = useGenerateId();
    const generateId = useId(); // Используем useId

    // Состояние для отслеживания открытых/закрытых секций
    const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({});
    const toggleSection = (index: number) => {
        setOpenSections(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    if (!categoriesMenuArr) {                   // Если categoriesMenuArr ещё не загружено, показываем заглушку
        return <div>Загрузка данных...</div>;
    }

    // Преобразуем объект в массив
    const unihocZoneRussiaArray = Object.values(categoriesMenuArr.UnihocZoneRussia);
    return (
        <>
            {unihocZoneRussiaArray.map((category, index) => {
                if (category[0]) {
                    const panelId = `${generateId}-panel-${index}`; // Добавляем суффикс для уникальности. Можно так написать: const panelId = generateId + "-panel-" + index;
                    const fragmentId = `${generateId}-fragment-${index}`;
                    return (
                        <React.Fragment key={fragmentId}> {/* Добавляем key для <>*/}
                            <button 
                                key={category[0].id} 
                                className={`accordion ${openSections[index] ? 'active' : ''}`}
                                onClick={() => toggleSection(index)}
                            >
                                { category[0].category_view }                                
                            </button>
                            <div 
                                key={panelId} 
                                className="panel"
                                style={{ display: openSections[index] ? 'block' : 'none'}}
                            >
                                <p><Link key={category[0].url_semantic} href={`/products/catalog?${ category[0].url_semantic }`}>Смотреть все</Link></p>
                                {Object.values(category).map((value, key) => {
                                    return (
                                        key !== 0 && (
                                            // Each child in a list should have a unique "key" prop...
                                            <div key={key}> 
                                                {value.prop_url_semantic && (
                                                    <Link key={value.prop_url_semantic} href={`/products/catalog?${category[0].url_semantic}=${value.prop_title}&${value.prop_title}=${value.prop_url_semantic}`}>
                                                        {value.prop_value_view}
                                                    </Link>
                                                )}
                                                {value.model && (
                                                    <Link key={value.model} href={`/products/catalog?${value.url_semantic}=model&model=${value.model}`}>
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
                        </React.Fragment>
                    );      
                }  
                return null; // Если category[0] не существует, возвращаем null      
            })} 
        </>
    );
};

export default AsideAccordionAll;