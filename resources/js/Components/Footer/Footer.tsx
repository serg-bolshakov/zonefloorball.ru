// resources/js/Components/Footer/Footer.tsx

import React from 'react';
import RangeOfProducts from './RangeOfProducts';
import Info from './Info';
import Articles from './Articles';
import useModal from '../../Hooks/useModal';    
import CustomersCares from "./CustomersCares";

const Footer: React.FC = () => {

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
                    <div className="vite-test">
                        Если это зелёный пунктирный прямоугольник — Vite работает!
                    </div>
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
        </>
    );
};

export default Footer;


