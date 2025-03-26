// resources/js/Components/Catalog/AsideBladesWithFilters.tsx
import React, { useState, useEffect, ReactNode} from "react";
import axios from "axios";
import AboutSideHand from '../Articles/AboutSideHand';
import AboutBladeFlex from '../Articles/AboutBladeFlex';
import AboutBrands from '../Articles/AboutBrands';
import { toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IProductsFilters, IProductFilterItem } from "../../Types/filters";



const AsideBladesWithFilters: React.FC = () => {

    const [brands, setBrands] = useState<IProductFilterItem[]>([]);
    const [filtersBladeStiffness, setFiltersBladeStiffness] = useState<IProductFilterItem[]>([]);
    const [filtersHookBlade, setFiltersHookBlade] = useState<IProductFilterItem[]>([]);

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
            hooks: cleanSearchParams.getAll('hook_blade[]'),
            flexes: cleanSearchParams.getAll('blade_stiffness[]'),
            brands: cleanSearchParams.getAll('brand[]'),
        };

        console.log('Считанные параметры:', result);
        return result;
    };

    // Функция для обновления URL: Эта функция будет обновлять URL в зависимости от выбранных фильтров:
    const updateURL = (filterType: string, filterValue: string, isChecked: boolean) => {
        
        const url = new URL(window.location.href);
        const searchParams = new URLSearchParams(url.search);

        // Удаляем параметр пагинации. Проблема: при изменении фильтров выявил побочный эффект: если, например, смотрим 10-ю страницу каталога, а затем выбираем какой либо фильтр, после применения которого, нет такого количества страниц (а в строке запроса осталось &page=10), то нам выходит <p>Товары не найдены.</p>
        searchParams.delete('page'); // Сбрасываем на первую страницу

        // Удаляем индексы из параметров (например, hook[0] -> hook[])
        const cleanFilterType = filterType.replace(/\[\d+\]/, '[]');
        console.log('cleanFilterType:', cleanFilterType);

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
        //console.log(url.toString());    // http://127.0.0.1:8000/products/blades?hook_blade%5B%5D=left
        window.location.href = url.toString();
    };

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        axios.get('/api/blades-aside-filters')
            .then(response => {
                // console.log(response.data.asideWithSticksFilters);
                const { brands, filtersBladeStiffness, filtersHookBlade } = response.data.asideWithSticksFilters;

                // Чтение параметров из URL
                const { hooks, flexes, brands: urlBrands } = getFiltersFromURL(); // brands: urlBrands - переименование при деструктуризации. В объекте, возвращаемом функцией getFiltersFromURL, есть свойство brands.
                // Теперь: brands — это состояние компонента. urlBrands — это параметры из URL.
                             
                if(hooks && hooks.length > 0 || flexes && flexes.length > 0 || urlBrands && urlBrands.length > 0)  {
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
                setFiltersBladeStiffness(filtersBladeStiffness.map((flex: IProductFilterItem) => ({
                    ...flex,
                    // flex.prop_value может быть string | number | undefined, поэтому используется toString() для приведения к строке (если prop_value — число).
                    isPropChecked: flexes.includes(flex.prop_value?.toString() || ''),
                })));

                setFiltersHookBlade(filtersHookBlade.map((hook: IProductFilterItem) => ({
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
            case 'hook_blade[]':
                setFiltersHookBlade(prev => prev.map(hook =>
                    hook.prop_value === filterValue ? { ...hook, isPropChecked: isChecked } : hook
                ));
                break;
            case 'blade_stiffness[]':
                setFiltersBladeStiffness(prev => prev.map(flex =>
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
    if (!brands || !filtersBladeStiffness || !filtersHookBlade) {
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
                {filtersHookBlade.map((filterHook: IProductFilterItem) => (
                    <div key={filterHook.prop_title + '-' + filterHook.prop_value}>  
                        <input type="checkbox" checked={!!filterHook.isPropChecked} id={`hook_blade_${filterHook.prop_value}`} name="hook_blade[]" value={filterHook.prop_value} 
                            onChange={(e) => {
                                // Приводим prop_value к строке и проверяем, что оно не undefined
                                if (filterHook.prop_value !== undefined) {
                                    handleFilterChange('hook_blade[]', filterHook.prop_value.toString(), e.target.checked);
                                }
                            }}
                        />
                        <label htmlFor={`hook_blade_${filterHook.prop_value}`} className="checkbox-label">{filterHook.prop_value_view}</label>
                    </div>
                ))}
            </div>

            <div className="pop-up__checkbox-block-hint">Степень жёсткости крюка
                <div className="pop-up__checkbox-block-hint-text">
                    <AboutBladeFlex />
                </div>
            </div>

            <div className="prop-list">
                {filtersBladeStiffness.map((filterBladeStiffness: IProductFilterItem) => (
                <div key={filterBladeStiffness.prop_title + '-' + filterBladeStiffness.prop_value}  className="d-flex aline-items-center flex-test">
                    <input type="checkbox" checked={!!filterBladeStiffness.isPropChecked} id={`blade_stiffness_${filterBladeStiffness.prop_value}`} name="blade_stiffness[]" value={filterBladeStiffness.prop_value} 
                        onChange={(e) => {
                            if(filterBladeStiffness.prop_value !== undefined) {
                                handleFilterChange('blade_stiffness[]', filterBladeStiffness.prop_value.toString(), e.target.checked);
                            }
                        }}
                    />
                    <label htmlFor={`blade_stiffness_${filterBladeStiffness.prop_value}`}><div className="checkbox-label">{filterBladeStiffness.prop_value_view}</div></label>
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

export default AsideBladesWithFilters;