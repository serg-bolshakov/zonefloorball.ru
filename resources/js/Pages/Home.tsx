// import '../../../public/css/styles.css'; // Сделали импорт css в app.blade.php
import React from 'react';
import { Helmet } from 'react-helmet';
import Footer from '../Components/Footer/Footer';
import Header from '../Components/Header/Header';  // Импортируем компонент Header
import { ModalProvider } from '../Contexts/ModalContext';

// создаём базовый интерфейс для всех пользователей:
interface IUserBase {
    id: number;
    created_at: string;
    updated_at: string;
    client_type_id: number;
    client_rank_id: number;
    user_access_id: number;
    this_id: number | null;
    email: string | null;
    email_verified_at: string | null;
    name: string;
    delivery_addr_on_default: string | null;
    // password: string | null;
    // two_factor_recovery_codes: string | null;
    // two_factor_secret: string | null;
    // two_factor_confirmed_at: string | null;
    // remember_token: string | null;
    user_manager_id: number | null;
    action_auth_id: number | null;
}

// создаём интерфейсы для юридических и физических лиц, которые будут расширять базовый интерфейс:
interface IIndividualUser extends IUserBase {
    pers_surname: string | null;
    date_of_birth: string | null;
    pers_tel: string | null;
    pers_email: string | null;
}

interface IOrgUser extends IUserBase {
    org_inn: string | null;
    org_kpp: string | null;
    is_taxes_pay: boolean | null;
    org_addr: string | null;
    org_tel: string | null;
    org_email: string | null;
    org_repres_name: string | null;
    org_repres_surname: string | null;
    org_repres_patronymic: string | null;
    org_repres_justification: string | null;
    org_bank_acc: string | null;
    org_bank_bic: string | null;
}

// Создаём объединённый тип пользователя:
type User = IIndividualUser | IOrgUser | null;

/* Пример того, как далее мы можем использовать юзера:
    
    function isIndividualUser(user: User): user is IIndividualUser {
        return (user as IIndividualUser).date_of_birth !== undefined;
    }

    function isOrgUser(user: User): user is IOrgUser {
        return (user as IOrgUser).org_inn !== undefined;
    }

    // Вариант использования:
    if (isIndividualUser(user)) {
        // Работаем с физическим лицом
    } else if (isOrgUser(user)) {
        // Работаем с юридическим лицом
    }

*/

interface IHomeProps {
    title: string;
    robots: string;
    description: string;
    keywords: string;
    categoriesMenuArr: string[];
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