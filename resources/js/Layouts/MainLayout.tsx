// resources/js/Layouts/MainLayout.tsx
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';                             // подключает стили для библиотеки react-toastify (уведомления).
import { ToastContainer, Slide, Zoom, Flip, Bounce } from 'react-toastify'; // Для начала установил библиотеку react-toastify для создания Toast-уведомлений в React.: npm install react-toastify
import Header from '../Components/Header/Header';
import Footer from '../Components/Footer/Footer';
import Modal from '@/Components/Modal/Modal';                                // добавляем компонент Modal, кот. принимает пропсы isOpen, onClose, children и отображает модальное окно, если isOpen равно true 
import useModal from '@/Hooks/useModal';

interface IMainLayoutsProps {
    children: React.ReactNode;
}


const MainLayout: React.FC<IMainLayoutsProps> = ({ children }) => {
    // отображение модального окна:
    const { modal, closeModal } = useModal();       // Централизация модального окна 

    return (
        <>
            <Header />
                {children}
            <Footer />
            {/* <ModalAdapter /> */}
            <Modal 
                isOpen={modal.isOpen} 
                onClose={closeModal}
                type={modal.type}
                content={modal.content}
                props={modal.props}
            />
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
                style={{ zIndex: 99999 }} // ← Явно указываем
            />
        </>
    );
};

export default MainLayout;

            {/* modal.isOpen определяет, нужно ли отображать модальное окно.
                modal.content — это содержимое модального окна (например, <AboutUs />).
                closeModal передаётся в компонент Modal для закрытия окна. */}