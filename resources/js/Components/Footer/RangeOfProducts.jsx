import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';

const RangeOfProducts = ({
    categoriesMenuArr
}) => {

    // Преобразуем объект в массив
    const unihocZoneRussiaArray = Object.values(categoriesMenuArr.UnihocZoneRussia);
    // console.table(unihocZoneRussiaArray);
    
    // Проверка, что данные являются массивом
    if (!Array.isArray(unihocZoneRussiaArray)) {
        return <div>Данные unihocZoneRussiaArray не загружены или имеют неверный формат.</div>;
    }

    return (
        <>
            {unihocZoneRussiaArray.map((category) => {
                if (category[0]) {
                return (
                    <Link key={category[0].url_semantic} href={`/products/${category[0].url_semantic}`}>
                        {category[0].category_view_2}
                    </Link>
                );      
                }  
                return null; // Если category[0] не существует, возвращаем null      
            })}
        </>
    );
};

export default RangeOfProducts;


