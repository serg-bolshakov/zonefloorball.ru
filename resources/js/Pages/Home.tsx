// resources/js/Pages/Home.tsx
import React from 'react';
import { Helmet } from 'react-helmet';
import Video from '../Components/Video/Video';
import NavBarBreadCrumb from '../Components/NavBarBreadCrumb';
import MainShowcase from '../Components/Main/Showcase';
import MainLayout from '../Layouts/MainLayout';

interface IHomeProps {
    title: string;
    robots: string;
    description: string;
    keywords: string;
}

const Home: React.FC<IHomeProps> = ({title, robots, description, keywords}) => {
    
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
                        <MainShowcase />
                    </main>

                    <aside className="aside-right">
                        <Video />
                    </aside>
                </div>
            </MainLayout>    
        </>
    );
};

export default Home;


//В компоненте Home мы уже передаём user как пропс. Далее передаём юзера в компонент Header...
/*
    Чтобы передать данные в мета-теги (<title>, <meta name="description">, <meta name="keywords">) в шаблоне app.blade.php, 
    нужно использовать данные, переданные из Laravel через Inertia.js. НО!!!, Inertia.js по умолчанию не обновляет мета-теги на стороне клиента, 
    так как они находятся вне React-приложения. Для решения этой задачи используем библиотеку react-helmet 
    (или её аналог для Inertia.js — @inertiajs/inertia-react с компонентом <Head>)...
    
    npm install react-helmet

    Обновление мета-тегов на стороне клиента
    react-helmet автоматически обновляет мета-теги в <head> на стороне клиента. Когда компонент Home рендерится, Helmet 
    изменяет соответствующие теги.
*/