// resources/js/Components/Catalog/AsideBallsWithFilters.tsx
import React, { useState, useEffect, ReactNode} from "react";
import axios from "axios";

import AboutBrands from '../Articles/AboutBrands';
import { toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IProductsFilters, IProductFilterItem } from "../../Types/filters";



const AsideEyewearsWithFilters: React.FC = () => {

    const [brands, setBrands] = useState<IProductFilterItem[]>([]);
    const [filterEyewearsSizes, setFilterEyewearsSizes] = useState<IProductFilterItem[]>([]);
    
    const getFiltersFromURL = () => {

        const url = new URL(window.location.href);
        const searchParams = new URLSearchParams(url.search);

        const cleanSearchParams = new URLSearchParams();
        searchParams.forEach((value, key) => {
            const cleanKey = key.replace(/\[\d+\]/, '[]');
            cleanSearchParams.append(cleanKey, value);
        });

        const result = {
            sizes: cleanSearchParams.getAll('size[]'),
            brands: cleanSearchParams.getAll('brand[]'),
        };
        
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
        axios.get('/api/eyewears-aside-filters')
            .then(response => {
                const { brands, filterEyewearsSizes } = response.data.asideWithFilters;
                console.log(filterEyewearsSizes);
                // Чтение параметров из URL
                const { sizes, brands: urlBrands } = getFiltersFromURL(); // brands: urlBrands - переименование при деструктуризации. В объекте, возвращаемом функцией getFiltersFromURL, есть свойство brands.
                // Теперь: brands — это состояние компонента. urlBrands — это параметры из URL.
                             
                if(sizes && sizes.length > 0 || urlBrands && urlBrands.length > 0)  {
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
                setFilterEyewearsSizes(filterEyewearsSizes.map((size: IProductFilterItem) => ({
                    ...size,
                    // size.size_value может быть string | number | undefined, поэтому используется toString() для приведения к строке (если size_value — число).
                    isPropChecked: sizes.includes(size.size_value?.toString() || ''),
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
        console.log(filterType);
        console.log(filterValue);
        console.log(isChecked);
        // Сначала обновляем состояние в React в зависимости от типа фильтра
        switch (filterType) {
            case 'brand[]':
                setBrands(prev => prev.map(brand =>
                    brand.brand === filterValue ? { ...brand, isBrandChecked: isChecked } : brand
                ));
                break;
            case 'size[]':
                setFilterEyewearsSizes(prev => prev.map(size =>
                    size.size_value === filterValue ? { ...size, isPropChecked: isChecked } : size
                ));
                break;
            default:
                break;
        }
        console.log(filterType);
        console.log(filterValue);
        console.log(isChecked);
        // Затем обновляем URL
        updateURL(filterType, filterValue, isChecked);
    };

    // if (!asideWithSticksFilters) {
    if (!brands || !filterEyewearsSizes) {
        return <div>Загрузка...</div>;
    }

    return (
        <>
            <div className="checkbox-filters__param">
                Размер
            </div>
            <div className="prop-list">
                {filterEyewearsSizes.map((size: IProductFilterItem) => (
                    <div key={size.size_value}>
                        <input type="checkbox" checked={!!size.isPropChecked} id={`size_${size.size_value}`} 
                            name="size[]" value={size.size_value} 
                            onChange={(e) => {
                                if(size.size_value != undefined) {
                                    handleFilterChange('size[]', size.size_value.toString(), e.target.checked);
                                }
                            }}
                        />
                        <label htmlFor={`size_${size.size_value}`}>
                            <div className="pop-up__checkbox-block-prop-hint">{size.size_value}
                                <div className="pop-up__checkbox-block-prop-hint-text">{size.size_recommendation}</div>
                            </div>
                        </label>
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
                    <div key={filterBrand.id} className="">
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

export default AsideEyewearsWithFilters;