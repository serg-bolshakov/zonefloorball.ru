// resources/js/Pages/Home.tsx
// import '../../../public/css/styles.css'; // Сделали импорт css в app.blade.php
import React from 'react';
import { Helmet } from 'react-helmet';
import Footer from '../Components/Footer/Footer';
import Header from '../Components/Header/Header';
import Video from '../Components/Video/Video';
import NavBarBreadCrumb from '../Components/NavBarBreadCrumb';
import { ModalProvider } from '../Contexts/ModalProvider';
import { ICategoriesMenuArr, User } from '../Types/types';
import MainShowcase from '../Components/Main/Showcase';
import { ToastContainer, Slide, Zoom, Flip, Bounce } from 'react-toastify'; // Для начала установил библиотеку react-toastify для создания Toast-уведомлений в React.: npm install react-toastify

interface IHomeProps {
    title: string;
    robots: string;
    description: string;
    keywords: string;
    categoriesMenuArr: ICategoriesMenuArr;
    authBlockContentFinal: string;
    user: User;
}

const Home: React.FC<IHomeProps> = ({title, robots, description, keywords, categoriesMenuArr, authBlockContentFinal, user}) => {
    
    return (
        <>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords} />
                <meta name="robots" content={robots} />
            </Helmet>
            
            <Header 
                user={user} 
                categoriesMenuArr={categoriesMenuArr} 
                authBlockContentFinal={authBlockContentFinal} 
            />

            <NavBarBreadCrumb
                categoriesMenuArr={categoriesMenuArr} 
            />

            <div className="container-main d-flex flex-sb flex-wrap">
                <main>
                    <MainShowcase />
                </main>

                <aside className="aside-right">
                    <Video />
                </aside>
            </div>
            
            {/* и обернём всё в ModalProvider, чтобы контекст был доступен всем дочерним компонентам: */}
            <ModalProvider>
                <Footer 
                    categoriesMenuArr={categoriesMenuArr}
                />
            </ModalProvider>
            <ToastContainer transition={Slide} />
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