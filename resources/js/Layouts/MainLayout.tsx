// resources/js/Layouts/MainLayout.tsx
import React from 'react';
import { ToastContainer, Slide, Zoom, Flip, Bounce } from 'react-toastify'; // Для начала установил библиотеку react-toastify для создания Toast-уведомлений в React.: npm install react-toastify
import Header from '../Components/Header/Header';
import Footer from '../Components/Footer/Footer';
import { User } from '../Types/types';
import { ICategoriesMenuArr } from '../Types/types';
import { ModalProvider } from '../Contexts/ModalProvider';

interface IMainLayoutsProps {
    children: React.ReactNode;
    user: User;
    categoriesMenuArr: ICategoriesMenuArr;
    authBlockContentFinal: string;
}

const MainLayout: React.FC<IMainLayoutsProps> = ({children, user, categoriesMenuArr, authBlockContentFinal}) => {
    return (
        <>
            <Header
                user={user}
                categoriesMenuArr={categoriesMenuArr}
                authBlockContentFinal={authBlockContentFinal}
            />
            
            {children}
            
            <ModalProvider>
                <Footer 
                    categoriesMenuArr={categoriesMenuArr}
                />
            </ModalProvider>
            
            <ToastContainer transition={Slide} />
        </>
    );
};

export default MainLayout;

