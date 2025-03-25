// resources/js/Layouts/MainLayout.tsx
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';                             // подключает стили для библиотеки react-toastify (уведомления).
import { ToastContainer, Slide, Zoom, Flip, Bounce } from 'react-toastify'; // Для начала установил библиотеку react-toastify для создания Toast-уведомлений в React.: npm install react-toastify
import Header from '../Components/Header/Header';
import Footer from '../Components/Footer/Footer';
import { ModalProvider } from '../Contexts/ModalProvider';
import { AppProvider } from '../Contexts/AppProvider';

interface IMainLayoutsProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<IMainLayoutsProps> = ({ children }) => {
    return (
        <>
            <AppProvider>
                <Header />
                {children}
                <ModalProvider>
                    <Footer />
                </ModalProvider>
                <ToastContainer 
                    transition={Slide} // или Zoom, Flip, Bounce - это будет анимация по умолчанию
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </AppProvider>
        </>
    );
};

export default MainLayout;

