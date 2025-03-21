// resources/js/Components/Catalog/AsideSticksWithFilters.tsx
import React, { useState, useEffect, ReactNode} from "react";
import axios from "axios";
import AboutSideHand from '../Articles/AboutSideHand';
import HowChooseStick from '../Articles/HowChooseStick';
import AboutFlex from '../Articles/AboutFlex';
import AboutBrands from '../Articles/AboutBrands';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IProductsFilters, IProductFilterItem } from "../../Types/filters";



const AsideSticksWithFilters: React.FC = () => {

    // const [asideWithSticksFilters, setAsideWithSticksFilters] = useState<IProductsFilters | null>(null);

    const [brands, setBrands] = useState<IProductFilterItem[]>([]);
    const [filterShaftFlexes, setFilterShaftFlexes] = useState<IProductFilterItem[]>([]);
    const [filterStickSizes, setFilterStickSizes] = useState<IProductFilterItem[]>([]);
    const [filterHooks, setFilterHooks] = useState<IProductFilterItem[]>([]);


    // Загрузка данных при монтировании компонента
    useEffect(() => {
        axios.get('/api/sticks-aside-filters')
            .then(response => {
                // setAsideWithSticksFilters(response.data.asideWithSticksFilters);
                setBrands(response.data.asideWithSticksFilters.brands);
                setFilterShaftFlexes(response.data.asideWithSticksFilters.filterShaftFlexes);
                setFilterStickSizes(response.data.asideWithSticksFilters.filterStickSizes);
                setFilterHooks(response.data.asideWithSticksFilters.filterHooks);
            })
            .catch(error => {
                console.error('Ошибка при загрузке данных: ', error);
                // Добавляем уведомление об ошибке
                toast.error('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
            });
    }, []);

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
                            onChange={(e) => {      // аргумент e — это объект события, который содержит информацию о произошедшем изменении. -  e.target.checked — это булево значение (true или false), которое указывает, выбран ли чекбокс.
                                    // ...filterHooks,  //  здесь мы пытаемся создать новый объект, но filterHooks — это массив, а не объект! - это не работаепт в этом случае...
                                    const updatedHooks = filterHooks.map(hook =>    // метод map проходит по каждому элементу массива filterHooks и возвращает новый массив, в котором каждый элемент преобразован согласно логике, указанной в функции-колбэке.
                                        hook.prop_value === filterHook.prop_value
                                        ? {...hook, isPropChecked: e.target.checked} // возвращается новый объект: { ...hook } — создает копию текущего объекта hook, isPropChecked: e.target.checked — обновляет свойство isPropChecked на новое значение (выбран ли чекбокс). не мутироватье существующий массив! а создавать новый (это важно для React). 
                                        : hook // если условие не выполняется, то возвращается исходный объект hook без изменений.
                                    );
                                setFilterHooks(updatedHooks); // updatedHooks — это новый массив, который был создан с помощью map.
                                // после вызова setFilterHooks React перерисовывает компонент, чтобы отразить изменения в интерфейсе.
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
                    <input type="checkbox" checked={!!filterStickSize.isPropChecked} id={`size_${filterStickSize.size_value}`} 
                    name="size[]" value={filterStickSize.size_value} />
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
                    <input type="checkbox" checked={!!filterShaftFlex.isPropChecked} id={`shaft_flex_${filterShaftFlex.prop_value}`} name="shaft_flex[]" value={filterShaftFlex.prop_value} />
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
                        />
                        <label htmlFor={`brand_${filterBrand.brand}`} className="checkbox-label">{filterBrand.brand_view}</label>
                    </div>
                ))}
            </div>
        </>
    );
};

export default AsideSticksWithFilters;