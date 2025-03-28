// resources/js/Components/Catalog/AsideBagsWithFilters.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import AboutBrands from '../Articles/AboutBrands';
import { toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IProductFilterItem } from "../../Types/filters";
import { ICategoryMenuItem } from "../../Types/types";



const AsideGoalieWithFilters: React.FC = () => {

    const [brands, setBrands] = useState<IProductFilterItem[]>([]);
    const [categories, setCategories] = useState<ICategoryMenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const getFiltersFromURL = () => {

        const url = new URL(window.location.href);
        const searchParams = new URLSearchParams(url.search);

        const cleanSearchParams = new URLSearchParams();
        searchParams.forEach((value, key) => {
            const cleanKey = key.replace(/\[\d+\]/, '[]');
            cleanSearchParams.append(cleanKey, value);
        });

        const result = {
            categories: cleanSearchParams.getAll('category[]'),
            brands: cleanSearchParams.getAll('brand[]'),
        };
        // console.log(result);
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
        axios.get('/api/goalie-aside-filters')
            .then(response => {
                console.log(response.data.asideWithFilters);
                const { categories, brands } = response.data.asideWithFilters;

                // Чтение параметров из URL
                const { categories: urlCategories, brands: urlBrands } = getFiltersFromURL(); // brands: urlBrands - переименование при деструктуризации. В объекте, возвращаемом функцией getFiltersFromURL, есть свойство brands.
                // Теперь: brands — это состояние компонента. urlBrands — это параметры из URL.
                             
                if(urlCategories && urlCategories.length > 0 || urlBrands && urlBrands.length > 0)  {
                    toast.success('Фильтры применены...', {
                        position: "top-right",
                        autoClose: 1000, // Уведомление закроется через полсекунды
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        transition: Zoom, // Используем Slide, Zoom, Flip, Bounce для этого тоста
                    });
                }

                // Установка состояния с учётом параметров из URL
                setBrands(brands.map((brand: IProductFilterItem) => ({
                    ...brand,
                    // isBrandChecked: brand.brand ? urlBrands.includes(brand.brand) : false,
                    isBrandChecked: urlBrands.includes(brand.brand?.toString() || ''),
                })));

                
                // Нормализуем структуру категорий
                const processedCategories = categories.map((category: any) => {
                    // Обрабатываем вложенные категории
                    if (category.children || (typeof category === 'object' && Object.keys(category).some(k => !isNaN(Number(k))))) {
                        const nested = category.children || category;
                        return Object.fromEntries(
                            Object.entries(nested).map(([key, subCat]: [string, any]) => [
                                key,
                                {
                                    ...subCat,
                                    isPropChecked: urlCategories.includes(subCat.url_semantic?.toString() || '')
                                }
                            ]
                        ))
                    }
                    return {
                        ...category,
                        isPropChecked: urlCategories.includes(category.url_semantic?.toString() || '')
                    };
                });

                setCategories(processedCategories);
            })
            .catch(error => {
                console.error('Ошибка при загрузке данных: ', error);
                // Добавляем уведомление об ошибке
                toast.error('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
            })
            .finally(() => setIsLoading(false));
    }, []);

    // Обработчик изменения состояния фильтров
    const handleFilterChange = (filterType: string, filterValue: string, isChecked: boolean) => {
        
        // Сначала обновляем состояние в React в зависимости от типа фильтра
        switch (filterType) {
            case 'brand[]':
                setBrands(prev => prev.map(brand =>
                    brand.brand === filterValue ? { ...brand, isBrandChecked: isChecked } : brand
                ));
                break;

            case 'category[]':
                setCategories(prev => prev.map((category: any) => {
                    if (Array.isArray(category)) {
                        return category.map(subCat => 
                            subCat.url_semantic === filterValue 
                                ? { ...subCat, isPropChecked: isChecked } 
                                : subCat
                        );
                    }
                    return category.url_semantic === filterValue 
                        ? { ...category, isPropChecked: isChecked } 
                        : category;
                }));
                break;

            default:
                break;
        }

        // Затем обновляем URL
        updateURL(filterType, filterValue, isChecked);
    };


    // функции renderCategoryItem и renderSubCategories для рендеринга разных типов категорий:
    const renderCategoryItem = (item: ICategoryMenuItem, index: number) => {
        if (index === 0) return null;

        // Проверяем, есть ли вложенные категории (аналог $key != 0 в Blade)
        if (item.children || (typeof item === 'object' && Object.keys(item).some(k => !isNaN(Number(k))))) {
            const nestedItems = item.children || item;
            const firstItem = Object.values(nestedItems)[0];
            
            return (
                <React.Fragment key={index}>
                    <h2>{firstItem?.category_view_2}</h2>
                    <ul className="prodsubcat-list__catalog--menu">
                        {Object.entries(nestedItems).map(([key, subCat]) => {
                            // Пропускаем первый элемент (аналог $subCatKey != 0)
                            if (key === '0' || key === '0') return null;
                            
                            return (
                                <li key={subCat.url_semantic || key}>
                                    <div>  
                                        <input
                                            type="checkbox"
                                            checked={!!subCat.isPropChecked}
                                            onChange={(e) => {
                                                if (subCat.url_semantic) {
                                                    handleFilterChange('category[]', subCat.url_semantic.toString(), e.target.checked);
                                                }
                                            }}
                                            id={`category_${subCat.url_semantic}`}
                                            name="category[]"
                                            value={subCat.url_semantic}
                                        />
                                        <label
                                            htmlFor={`category_${subCat.url_semantic}`}
                                            className="label-hook__value-view"
                                        >
                                            {subCat.category_view_2}
                                        </label>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </React.Fragment>
            );
        }
        
        // Остальные условия из Blade-шаблона
        if (item.prop_url_semantic || item.url_semantic) {
            return (
                <div key={item.url_semantic || index}>  
                    <input 
                        type="checkbox" 
                        checked={!!item.isPropChecked}
                        onChange={(e) => {
                            if (item.url_semantic) {
                                handleFilterChange('category[]', item.url_semantic.toString(), e.target.checked);
                            }
                        }}
                        id={`category_${item.url_semantic}`} 
                        name="category[]" 
                        value={item.url_semantic}
                    />
                    <label 
                        htmlFor={`category_${item.url_semantic}`} 
                        className="label-hook__value-view"
                    >
                        {item.category_view_2}
                    </label>
                </div>
            );
        }

        if (item.model) {
            return (
                <a 
                    key={item.model}
                    href={`/products/catalog?${item.url_semantic}=model&model=${item.model}`}
                >
                    {item.model}
                </a>
            );
        }

        return null;
    };

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    return (
        <>
            <div className="prop-list">  
                <h2>
                    {categories[0]?.category_view_2 || 'Категории'}
                </h2>
                
                {categories.map((category, index) => (
                    renderCategoryItem(category, index)
                ))}
            </div>

            <>{/* @foreach($asideWithFilters['categories'] as $key=>$value)
                    @if(isset($value['prop_url_semantic']) && ($key != 0)) 
                    <div>  
                        <input type="checkbox" {{ $value['isPropChecked'] }}
                            id="category_{{ $value['url_semantic'] }}" name="category[]" value="{{ $value['url_semantic'] }}">
                        <label for="category_{{ $value['url_sematic'] }}" class = "label-hook__value-view">{{ $value['category_view_2'] }}</label>
                    </div>
                    @elseif(!empty($value['model']) && $key != 0)
                    <a href="/products/catalog?{{ $value['url_semantic'] }}=model&model={{ $value['model'] }}">{{ $value['model'] }}</a> 
                    @elseif(!empty($value['url_semantic']) && $key != 0)
                    <div>  
                        <input type="checkbox" {{ $value['isPropChecked'] }}
                            id="category_{{ $value['url_semantic'] }}" name="category[]" value="{{ $value['url_semantic'] }}">
                        <label for="category_{{ $value['url_semantic'] }}" class = "label-hook__value-view">{{ $value['category_view_2'] }}</label>
                    </div>
                    @php //var_dump($asideWithFilters['categories'][0]); @endphp
                    @elseif($key != 0)
                    <h2>{{ $asideWithFilters['categories'][$key][0]['category_view_2'] }}</h2>
                        <ul class="prodsubcat-list__catalog--menu">
                        @foreach($asideWithFilters['categories'][$key] as $subCatKey=>$subCatValue)
                            @if(isset($subCatValue['url_semantic']) && ($subCatKey != 0)) 
                            <li>
                                <div>  
                                    <input type="checkbox" {{ $subCatValue['isPropChecked'] }} id="category_{{ $subCatValue['url_semantic'] }}" name="category[]" value="{{ $subCatValue['url_semantic'] }}">
                                    <label for="category_{{ $subCatValue['url_semantic'] }}" class = "label-hook__value-view">{{ $subCatValue['category_view_2'] }}</label>
                                </div>
                            </li>
                            @endif
                        @endforeach
                        </ul> 
                    @endif
                @endforeach */
            }</>
            
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

export default AsideGoalieWithFilters;