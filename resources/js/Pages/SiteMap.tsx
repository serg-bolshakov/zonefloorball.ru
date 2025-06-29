// resources/js/Pages/SiteMap.tsx
import React from 'react';
import { Helmet } from 'react-helmet';
import NavBarBreadCrumb from '../Components/NavBarBreadCrumb';
import MainLayout from '../Layouts/MainLayout';
import { ICategoryItemFromDB } from '@/Types/types';
import { Link } from '@inertiajs/react';
import { ICategoryMenuItem } from '@/Types/types';

interface ISiteMapProps {
  title: string;
  robots: string;
  description: string;
  keywords: string;
  categories: Record<number, ICategoryMenuItem>[];
}


const SiteMap: React.FC<ISiteMapProps> = ({title, robots, description, keywords, categories}) => {
    console.log(categories);
    // Преобразуем объект в массив
    const categoriesArray = Object.values(categories);
    console.log(categoriesArray);
    
    return (
        <>
            <MainLayout>
                <Helmet>
                    <title>{title}</title>
                    <meta name="description" content={description} />
                    <meta name="keywords" content={keywords} />
                    <meta name="robots" content={robots} />
                </Helmet>

                <NavBarBreadCrumb />

                <div className="container-main d-flex flex-sb flex-wrap">
                    <main>
                        <div className="sitemap">
                            <div className="sitemap-content">
                                <h1 className="text-align-center">Карта сайта</h1>
                                
                                <h2 className="margin-bottom12px"><a href="/">Главная</a></h2>
                                <h2 className="margin-bottom12px"><a href="/products/catalog">Каталог</a></h2>
                                {categoriesArray.map((category, index) => {
                                        // console.log('Category:', category);
                                        if (category[0]) {
                                            return (
                                                <><div key={category[0].url_semantic} className="">
                                                    <ul className='margin-bottom12px'>
                                                        <Link key={category[0].category_view} href={`/products/catalog?category=${category[0].url_semantic}`}>
                                                            {category[0].category_view}
                                                        </Link>
                                                    
                                                        {Object.values(category).map((value, key) => {
                                                            // console.log('Value:', value); 
                                                            return (
                                                                key !== 0 && (
                                                                    // Each child in a list should have a unique "key" prop...
                                                                    <div key={key}> 
                                                                        {value.prop_url_semantic && (
                                                                            <li className='margin-left24px'>
                                                                                <Link key={value.prop_url_semantic} href={`/products/catalog?category=${category[0].url_semantic}&${value.prop_title}=${value.prop_url_semantic}`}>
                                                                                    {value.prop_value_view}
                                                                                </Link>
                                                                            </li>
                                                                        )}
                                                                        {value.model && (
                                                                            <li className='margin-left24px'>
                                                                                <Link key={value.model} href={`/products/catalog?category=${value.url_semantic}&model=${value.model}`}>
                                                                                    {value.model}
                                                                                </Link>
                                                                            </li>
                                                                        )}
                                                                        {value.url_semantic && (
                                                                            <li className='margin-left24px'>
                                                                                <Link key={value.url_semantic} href={`/products/${category[0].url_semantic}?category%5B%5D=${value.url_semantic}`}>
                                                                                    {value.category_view_2}
                                                                                </Link>
                                                                            </li>
                                                                        )}
                                                                        
                                                                        {/* {console.table(value[0])} */}
                                                                        {!value.prop_url_semantic && !value.model && !value.url_semantic && (
                                                                            value[0] && ( // Проверка на существование 
                                                                            <div key={value[0].url_semantic} className='margin-top12px margin-left24px'>
                                                                                <p><strong>{value[0].category_view_2}</strong></p>
                                                                                <ul className="">
                                                                                    {Object.values(value).map((subCatValue, subCatKey) => (
                                                                                        subCatKey !== 0 && subCatValue.url_semantic && (
                                                                                            <li key={subCatKey} className='margin-left24px'>
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
                                                    </ul>
                                                </div>
                                                <hr />
                                              </>
                                            );
                                        }
                                        return null; // Если category[0] не существует, возвращаем null
                                    })}
                            </div>
                        </div>
                    </main>
                </div>
            </MainLayout>    
        </>
    );
};

export default SiteMap;


/*
    Мои действия:
    1) Установил пакет spatie/laravel-sitemap
    2) Создал контроллер для генерации карты на сайте php artisan make:controller SitemapController
    3) Добавил маршрут в routes/web.php: Route::get('/generate-sitemap', [SitemapController::class, 'generate']);
    
    Далее создаём HTML-карту сайта:
    1) Контроллер: php artisan make:controller SiteMapController
    2) Представление: resources/views -> sitemap.blade.php
    3) Маршрут: Route::get('/sitemap', [SiteMapController::class, 'index']);
    
    Для того, чтобы карта была актуальной, настраиваем автоматическое обновление XML-карты (с помощью планировщика задач Laravel (cron)):    
    А)  сначала будем прописывать логику генерации сайта, для этого создаем команду: 
        php artisan make:command GenerateSitemap    // Console command [C:\OSPanel\domains\version3\app\Console\Commands\GenerateSitemap.php] created successfully.
    Б) настроим планировщик: в файле app/Console/Kernel.php добавим команду:
    protected function schedule(Schedule $schedule)
        {
            $schedule->command('sitemap:generate')->daily();
        }
        
    Для проверки, чтобы всё работает запускаем команду: php artisan sitemap:generate

    Теперь всё реализуем "шаг за шагом"...
*/