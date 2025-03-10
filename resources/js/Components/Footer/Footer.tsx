// resources/js/Components/Footer/Footer.tsx

import React from 'react';
import { Link } from '@inertiajs/react';
import RangeOfProducts from './RangeOfProducts';
import Info from './Info';
import Articles from './Articles';
import Modal from '../Modal';                   // добавляем компонент Modal
import useModal from '../../Hooks/useModal';    // Новый путь к хуку
import { ICategoriesMenuArr } from '../../Types/types';
import CustomersCares from "./CustomersCares";
import useAppContext from '../../Hooks/useAppContext';

// interface IFooterProps {
//     categoriesMenuArr: ICategoriesMenuArr;
// }

const Footer: React.FC = () => {
    const { categoriesMenuArr } = useAppContext();

    // Отображение модального окна в Footer. В к. Footer мы используем состояние модального окна:
    const { modal, closeModal } = useModal();
    // modal — это не стейт в классическом понимании (не хук useState), а значение, которое возвращается из контекста.
    // closeModal — это функция, которая также возвращается из контекста.

    return (
        <>
            <footer className="footer">
                <div className="footer-block">
                    <h2>АССОРТИМЕНТ</h2>
                    <RangeOfProducts />
                </div>
                <div className="footer-block">
                    <h2>ИНФОРМАЦИЯ</h2>
                    <Info />
                </div>
                <div className="footer-block">
                    <h2>СТАТЬИ И ЗАМЕТКИ</h2>
                    <Articles />
                </div>
                <div className="footer-block">
                    <h2>ПОДДЕРЖКА ПОКУПАТЕЛЕЙ</h2>
                    <CustomersCares />
                </div>
            </footer>

            {/* modal.isOpen определяет, нужно ли отображать модальное окно.
                modal.content — это содержимое модального окна (например, <AboutUs />).
                closeModal передаётся в компонент Modal для закрытия окна. */}

            <Modal isOpen={modal.isOpen} onClose={closeModal}>
                {modal.content}
            </Modal>
        </>
    );
};

export default Footer;


