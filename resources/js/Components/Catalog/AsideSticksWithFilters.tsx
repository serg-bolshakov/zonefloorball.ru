// resources/js/Components/Catalog/AsideSticksWithFilters.tsx
import React, { useState, useEffect, ReactNode} from "react";
import axios from "axios";
import AboutSideHand from '../Articles/AboutSideHand';
import HowChooseStick from '../Articles/HowChooseStick';
import AboutFlex from '../Articles/AboutFlex';
import AboutBrands from '../Articles/AboutBrands';
import { toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IProductsFilters, IProductFilterItem } from "../../Types/filters";



const AsideSticksWithFilters: React.FC = () => {

    // const [asideWithSticksFilters, setAsideWithSticksFilters] = useState<IProductsFilters | null>(null);

    const [brands, setBrands] = useState<IProductFilterItem[]>([]);
    const [filterShaftFlexes, setFilterShaftFlexes] = useState<IProductFilterItem[]>([]);
    const [filterStickSizes, setFilterStickSizes] = useState<IProductFilterItem[]>([]);
    const [filterHooks, setFilterHooks] = useState<IProductFilterItem[]>([]);

    // Функция для чтения параметров из URL
    /**
        В URL параметры выглядят так: http://127.0.0.1:8000/products/sticks?brand%5B0%5D=zone&hook%5B0%5D=left
                    Это эквивалентно: http://127.0.0.1:8000/products/sticks?brand[0]=zone&hook[0]=left
        метод searchParams.getAll('hook[]') ищет параметры в формате hook[]=left, а не hook[0]=left. Поэтому он возвращает пустой массив.
        Нужно изменить формат параметров в URL, чтобы они соответствовали ожидаемому формату (hook[]=left вместо hook[0]=left). Это можно сделать на этапе обновления URL.
     */
    const getFiltersFromURL = () => {

        const url = new URL(window.location.href);
        const searchParams = new URLSearchParams(url.search);

        const cleanSearchParams = new URLSearchParams();
        searchParams.forEach((value, key) => {
            const cleanKey = key.replace(/\[\d+\]/, '[]');
            cleanSearchParams.append(cleanKey, value);
        });

        const result = {
            hooks: cleanSearchParams.getAll('hook[]'),
            sizes: cleanSearchParams.getAll('size[]'),
            flexes: cleanSearchParams.getAll('shaft_flex[]'),
            brands: cleanSearchParams.getAll('brand[]'),
        };

        // console.log('Считанные параметры:', result);
        return result;
    };

    // console.log('Параметры из URL:', getFiltersFromURL());

    // Функция для обновления URL: Эта функция будет обновлять URL в зависимости от выбранных фильтров:
    const updateURL = (filterType: string, filterValue: string, isChecked: boolean) => {
        
        const url = new URL(window.location.href);
        const searchParams = new URLSearchParams(url.search);

        // Удаляем параметр пагинации. Проблема: при изменении фильтров выявил побочный эффект: если, например, смотрим 10-ю страницу каталога, а затем выбираем какой либо фильтр, после применения которого, нет такого количества страниц (а в строке запроса осталось &page=10), то нам выходит <p>Товары не найдены.</p>
        searchParams.delete('page'); // Сбрасываем на первую страницу

        // Удаляем индексы из параметров (например, hook[0] -> hook[])
        const cleanFilterType = filterType.replace(/\[\d+\]/, '[]');
        // console.log('cleanFilterType:', cleanFilterType);

        if (isChecked) {
            searchParams.append(cleanFilterType, filterValue);
            url.search = searchParams.toString();
        } else {
            // Полностью удаляем параметр с данным значением
            const newParams = new URLSearchParams();
            searchParams.forEach((value, key) => {
                const cleanKey = key.replace(/\[\d+\]/, '[]');
                if (cleanKey !== cleanFilterType || value !== filterValue) {
                    newParams.append(cleanKey, value);
                }
            });
            url.search = newParams.toString();
        }

        window.location.href = url.toString();
    };

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        axios.get('/api/sticks-aside-filters')
            .then(response => {
                const { brands, filterShaftFlexes, filterStickSizes, filterHooks } = response.data.asideWithSticksFilters;

                // Чтение параметров из URL
                const { hooks, sizes, flexes, brands: urlBrands } = getFiltersFromURL(); // brands: urlBrands - переименование при деструктуризации. В объекте, возвращаемом функцией getFiltersFromURL, есть свойство brands.
                // Теперь: brands — это состояние компонента. urlBrands — это параметры из URL.
                             
                if(hooks && hooks.length > 0 || sizes && sizes.length > 0 || flexes && flexes.length > 0 || urlBrands && urlBrands.length > 0)  {
                    toast.success('Фильтры применены...', {
                        position: "top-right",
                        autoClose: 1000, // Уведомление закроется через полсекунды
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        transition: Flip, // Используем Slide, Zoom, Flip, Bounce для этого тоста
                    });
                }

                // Установка состояния с учётом параметров из URL
                setBrands(brands.map((brand: IProductFilterItem) => ({
                    ...brand,
                    // isBrandChecked: brand.brand ? urlBrands.includes(brand.brand) : false,
                    isBrandChecked: urlBrands.includes(brand.brand?.toString() || ''),
                })));
                setFilterShaftFlexes(filterShaftFlexes.map((flex: IProductFilterItem) => ({
                    ...flex,
                    // flex.prop_value может быть string | number | undefined, поэтому используется toString() для приведения к строке (если prop_value — число).
                    isPropChecked: flexes.includes(flex.prop_value?.toString() || ''),
                })));
                setFilterStickSizes(filterStickSizes.map((size: IProductFilterItem) => ({
                    ...size,
                    isPropChecked: sizes.includes(size.size_value?.toString() || ''),
                })));
                // setFilterHooks(filterHooks.map((hook: IProductFilterItem) => ({
                //     ...hook,
                //     isPropChecked: hook.prop_value ?  hooks.includes(hook.prop_value.toString()) : false,
                // })));
                setFilterHooks(filterHooks.map((hook: IProductFilterItem) => ({
                    ...hook,
                    isPropChecked: hooks.includes(hook.prop_value?.toString() || ''),
                })));
            })
            .catch(error => {
                console.error('Ошибка при загрузке данных: ', error);
                // Добавляем уведомление об ошибке
                toast.error('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
            });
    }, []);

    // Обработчик изменения состояния фильтров
    const handleFilterChange = (filterType: string, filterValue: string, isChecked: boolean) => {
        
        // Сначала обновляем состояние в React в зависимости от типа фильтра
        switch (filterType) {
            case 'hook[]':
                setFilterHooks(prev => prev.map(hook =>
                    hook.prop_value === filterValue ? { ...hook, isPropChecked: isChecked } : hook
                ));
                break;
            case 'size[]':
                setFilterStickSizes(prev => prev.map(size =>
                    size.size_value === filterValue ? { ...size, isPropChecked: isChecked } : size
                ));
                break;
            case 'shaft_flex[]':
                setFilterShaftFlexes(prev => prev.map(flex =>
                    flex.prop_value === filterValue ? { ...flex, isPropChecked: isChecked } : flex
                ));
                break;
            case 'brand[]':
                setBrands(prev => prev.map(brand =>
                    brand.brand === filterValue ? { ...brand, isBrandChecked: isChecked } : brand
                ));
                break;
            default:
                break;
        }

        // Затем обновляем URL
        updateURL(filterType, filterValue, isChecked);
    };

    // if (!asideWithSticksFilters) {
    if (!brands || !filterShaftFlexes || !filterStickSizes || !filterHooks) {
        return <div>Загрузка...</div>;
    }

    return (
        <>
            <div className="pop-up__checkbox-block-hint">Хват (игровая сторона)
                <div className="pop-up__checkbox-block-hint-text">
                    <AboutSideHand />
                </div>
            </div>
            <div className="prop-list">
                {filterHooks.map((filterHook: IProductFilterItem) => (
                    <div key={filterHook.prop_title + '-' + filterHook.prop_value}>  
                        <input type="checkbox" checked={!!filterHook.isPropChecked} id={`hook_${filterHook.prop_value}`} name="hook[]" value={filterHook.prop_value} 
                            // onChange={(e) => {
                            //     // Обновляем состояние фильтра
                            //     const updateFilters = {
                            //         ...asideWithSticksFilters,
                            //         filterHooks: asideWithSticksFilters.filterHooks.map(hook =>
                            //             hook.prop_value === filterHook.prop_value
                            //             ? {...hook, isPropChecked: e.target.checked}
                            //             : hook
                            //         ),
                            //     };
                            //     setAsideWithSticksFilters(updateFilters);
                            // }}
                            /*onChange={(e) => {      // аргумент e — это объект события, который содержит информацию о произошедшем изменении. -  e.target.checked — это булево значение (true или false), которое указывает, выбран ли чекбокс.
                                    // ...filterHooks,  //  здесь мы пытаемся создать новый объект, но filterHooks — это массив, а не объект! - это не работаепт в этом случае...
                                    const updatedHooks = filterHooks.map(hook =>    // метод map проходит по каждому элементу массива filterHooks и возвращает новый массив, в котором каждый элемент преобразован согласно логике, указанной в функции-колбэке.
                                        hook.prop_value === filterHook.prop_value
                                        ? {...hook, isPropChecked: e.target.checked} // возвращается новый объект: { ...hook } — создает копию текущего объекта hook, isPropChecked: e.target.checked — обновляет свойство isPropChecked на новое значение (выбран ли чекбокс). не мутироватье существующий массив! а создавать новый (это важно для React). 
                                        : hook // если условие не выполняется, то возвращается исходный объект hook без изменений.
                                    );
                                setFilterHooks(updatedHooks); // updatedHooks — это новый массив, который был создан с помощью map.
                                // после вызова setFilterHooks React перерисовывает компонент, чтобы отразить изменения в интерфейсе.
                                toast.success('работает...');
                                updateURL('hook[]', filterHook.prop_value, e.target.checked);
                            }}*/
                            onChange={(e) => {
                                // Приводим prop_value к строке и проверяем, что оно не undefined
                                if (filterHook.prop_value !== undefined) {
                                    handleFilterChange('hook[]', filterHook.prop_value.toString(), e.target.checked);
                                }
                            }}
                        />
                        <label htmlFor={`hook_${filterHook.prop_value}`} className="checkbox-label">{filterHook.prop_value_view}</label>
                    </div>
                ))}
            </div>

            <div className="pop-up__checkbox-block-hint">Длина рукоятки (см)
                <div className="pop-up__checkbox-block-hint-text">
                    <HowChooseStick />
                </div>
            </div>
            <div className="prop-list">
                {filterStickSizes.map((filterStickSize: IProductFilterItem) => (
                <div key={filterStickSize.size_title + '-' + filterStickSize.size_value}>
                    <input type="checkbox" checked={!!filterStickSize.isPropChecked} id={`size_${filterStickSize.size_value}`} name="size[]" value={filterStickSize.size_value} 
                        onChange={(e) => {
                            if(filterStickSize.size_value !== undefined) {
                                handleFilterChange('size[]', filterStickSize.size_value.toString(), e.target.checked);
                            }
                        }}
                    />
                    <label htmlFor={`size_${filterStickSize.size_value}`}>
                        <div className="pop-up__checkbox-block-prop-hint">{filterStickSize.size_value}
                            <div className="pop-up__checkbox-block-prop-hint-text">
                                {filterStickSize.size_recommendation}
                            </div>
                        </div>
                    </label>
                </div>
                ))}
            </div>

            <div className="pop-up__checkbox-block-hint">Индекс жёсткости рукоятки
                <div className="pop-up__checkbox-block-hint-text">
                    <AboutFlex />
                </div>
            </div>

            <div className="prop-list">
                {filterShaftFlexes.map((filterShaftFlex: IProductFilterItem) => (
                <div key={filterShaftFlex.prop_title + '-' + filterShaftFlex.prop_value}  className="d-flex aline-items-center flex-test">
                    <input type="checkbox" checked={!!filterShaftFlex.isPropChecked} id={`shaft_flex_${filterShaftFlex.prop_value}`} name="shaft_flex[]" value={filterShaftFlex.prop_value} 
                        onChange={(e) => {
                            // Этот вариант (прежний) просто отслеживает состояние чекбокса: отмечен / не отмечен, нам нужно просто запустить отбаботчик - там всё сделаем, в обработчике...
                            // const updatedFlexes = filterShaftFlexes.map(flex => 
                            //   flex.prop_value === filterShaftFlex.prop_value
                            //   ? {...flex, isPropChecked: e.target.checked}
                            //   : flex  
                            // );
                            // setFilterShaftFlexes(updatedFlexes);
                        
                            if(filterShaftFlex.prop_value !== undefined) {
                                handleFilterChange('shaft_flex[]', filterShaftFlex.prop_value.toString(), e.target.checked);
                            }
                        }}
                    />
                    <label htmlFor={`shaft_flex_${filterShaftFlex.prop_value}`}><div className="checkbox-label">{filterShaftFlex.prop_value_view}</div></label>
                </div>
                ))}
            </div>

            <div className="pop-up__checkbox-block-hint">Бренд
                <div className="pop-up__checkbox-block-hint-text">
                    <AboutBrands />
                </div>
            </div>
            <div className="prop-list">
                {brands.map((filterBrand: IProductFilterItem) => (
                    <div key={filterBrand.id}>
                        <input type="checkbox" checked={!!filterBrand.isBrandChecked} id={`brand_${filterBrand.brand}`} name="brand[]" value={filterBrand.brand}
                            onChange={(e) => {
                                if(filterBrand.brand !== undefined) {
                                    handleFilterChange('brand[]', filterBrand.brand.toString(), e.target.checked);
                                }
                            }} 
                        />
                        <label htmlFor={`brand_${filterBrand.brand}`} className="checkbox-label">{filterBrand.brand_view}</label>
                    </div>
                ))}
            </div>
        </>
    );
};

export default AsideSticksWithFilters;