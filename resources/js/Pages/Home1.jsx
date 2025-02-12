// import '../../../public/css/styles.css'; // Сделали импорт css в app.blade.php
import React from 'react';
import { Helmet } from 'react-helmet';
import Footer from '../Components/Footer/Footer';
import Header from '../Components/Header';  // Импортируем компонент Header
import { ModalProvider } from '../Contexts/ModalContext';



const Home = ({title, robots, description, keywords, categoriesMenuArr, authBlockContentFinal, user}) => {
    
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
            
            {/* и обернём всё в ModalProvider, чтобы контекст был доступен всем дочерним компонентам: */}
            <ModalProvider>
                <Footer 
                    categoriesMenuArr={categoriesMenuArr}
                />
            </ModalProvider>
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