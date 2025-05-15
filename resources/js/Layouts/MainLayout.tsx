// resources/js/Layouts/MainLayout.tsx
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';                             // подключает стили для библиотеки react-toastify (уведомления).
import { ToastContainer, Slide, Zoom, Flip, Bounce } from 'react-toastify'; // Для начала установил библиотеку react-toastify для создания Toast-уведомлений в React.: npm install react-toastify
import Header from '../Components/Header/Header';
import Footer from '../Components/Footer/Footer';

import { ModalAdapter } from '@/Components/ModalAdapter';                   // Не обязательно, но пока оставляем как прослойку:
// возможные плюсы сохранения (далее - посмотрим - нужно пдумать): 
// 1) единое место управления модалками (? - чтобы не было коллизий)
// 2) возможность добавить общую анимацию/логику - нужно будет попробовать и посмотреть...
// 3) чистые компоненты (не зависят от реализации модалки)...
import Modal from '@/Components/Modal';                                     // добавляем компонент Modal, кот. принимает пропсы isOpen, onClose, children и отображает модальное окно, если isOpen равно true 
import useModal from '@/Hooks/useModal';

// import Swal from 'sweetalert2';     // https://sweetalert2.github.io/#examples
import { useEffect } from 'react';

interface IMainLayoutsProps {
    children: React.ReactNode;
}


const MainLayout: React.FC<IMainLayoutsProps> = ({ children }) => {
    // отображение модального окна:
    const { modal, closeModal } = useModal();       // Централизация модального окна 

    /* useEffect(() => {
        const showDevNotice = async () => {
            const lastShown = localStorage.getItem('devNoticeLastShown');
            const isExpired = lastShown && Date.now() - Number(lastShown) > 24 * 60 * 60 * 1000; // 24 часа
            
            if (!lastShown || isExpired) {
                await Swal.fire({
                    title: "Открытие 30 июня 2025 г.",
                    text: "Совсем скоро на рынке наши новые российские клюшки по стандартам IFF под брендом \"АЛЕТЕРС\". Сайт в разработке - пока только для информации. Мы активно работаем над улучшением сервиса.",
                    icon: "info",
                    confirmButtonText: "Понятно. Молодцы. Ждём... А я пока - посмотрю...",
                    allowOutsideClick: false,
                    // timer: 5000,
                    // timerProgressBar: true,
                    
                    showClass: {
                        popup: `
                        animate__animated
                        animate__fadeInUp
                        animate__faster
                        `
                    },
                    hideClass: {
                        popup: `
                        animate__animated
                        animate__fadeOutDown
                        animate__faster
                        `
                    }
                });

                // Помечаем как показанное
                localStorage.setItem('devNoticeLastShown', Date.now().toString());
            }
        };

        showDevNotice();
    }, []);*/
    
    /*useEffect(() => {
        const showDevNotice = async () => {
            const lastShown = localStorage.getItem('devNoticeLastShown');
            const isExpired = lastShown && Date.now() - Number(lastShown) > 24 * 60 * 60 * 1000;
            
            if (!lastShown || isExpired) {
                await Swal.fire({
                    title: 'АЛЕТЕРС - новые российские клюшки по стандартам IFF',
                    html: `
                        <div style="text-align: center; margin-top: 1rem">
                            <div style="color: #ff3366; font-weight: bold; margin-bottom: 0.5rem">
                                ОТКРЫТИЕ 30 июня 2025&nbsp;г. Сайт в разработке.
                            </div>
                            <div>Мы активно работаем над улучшением сервиса</div>
                        </div>
                    `,
                    icon: 'info',
                    background: 'rgba(0, 0, 0, 0.75)',
                    color: '#fff',
                    confirmButtonText: 'Понятно. Молодцы. Ждём... А я пока - посмотрю...',
                    confirmButtonColor: '#ff3366',
                    allowOutsideClick: false,
                    showClass: {
                        popup: 'animate__animated animate__fadeInUp animate__faster'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOutDown animate__faster'
                    }
                });
                
                localStorage.setItem('devNoticeLastShown', Date.now().toString());
            }
        };
        
        showDevNotice();
    }, []);*/

    return (
        <>
            <Header />
                {children}
            <Footer />
            <ModalAdapter />
            <Modal isOpen={modal.isOpen} onClose={closeModal}>
                {modal.content}
            </Modal>
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
        </>
    );
};

export default MainLayout;

            {/* modal.isOpen определяет, нужно ли отображать модальное окно.
                modal.content — это содержимое модального окна (например, <AboutUs />).
                closeModal передаётся в компонент Modal для закрытия окна. */}