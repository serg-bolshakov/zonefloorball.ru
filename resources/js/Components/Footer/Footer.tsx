// resources/js/Components/Footer/Footer.tsx

import React from 'react';
import RangeOfProducts from './RangeOfProducts';
import VideoGuides from './VideoGuides';
import Info from './Info';
import Articles from './Articles';
import CustomersCares from "./CustomersCares";

const Footer: React.FC = () => {

    return (
        <>
            <footer className="footer">
                <div className="footer-block">
                    <h2>ВИДЕОИНСТРУКЦИИ</h2>
                    <VideoGuides />
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
        </>
    );
};

export default Footer;


