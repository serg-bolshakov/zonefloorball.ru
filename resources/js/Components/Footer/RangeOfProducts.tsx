// resources/js/Components/Footer/RangeOfProducts.tsx
import { Link } from '@inertiajs/react';
import useAppContext from '../../Hooks/useAppContext';

const RangeOfProducts: React.FC = () => {

    const { categoriesMenuArr } = useAppContext();
    
    // Если categoriesMenuArr ещё не загружено, показываем заглушку
    if (!categoriesMenuArr) {
        return <div>Загрузка данных...</div>;
    }

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


