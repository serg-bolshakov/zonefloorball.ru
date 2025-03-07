// resources/js/Components/Footer/CustomersCares.tsx

import React from 'react';
import { Link } from '@inertiajs/react';

const CustomersCares: React.FC = () => {
    const currentYear = new Date().getFullYear();        
    return (
        <>
            <div className="contacts-social">
                <a href="mailto:unihoczonerussia@gmail.com"><img src="/storage/icons/gmail-logo-colored.jpg" alt="gmail-logo" title="Отправить письмо по электронной почте" /></a>
                <a href="https://vk.com/unihoczonerussia" target="_blank" rel="noopener noreferrer"><img src="/storage/icons/vk-logo-colored.png" alt="vk-logo" title="Написать ВКонтакте" /></a>
                <a href="whatsapp://send?phone=79534156010"><img src="/storage/icons/whatsapp-logo-colored.png" alt="whatsApp-logo" title="Написать в Whatsapp" /></a>
                <a href="https://t.me/unihoczonerussia/"
                    ><img src="/storage/icons/telegram-logo-colored.png" alt="telegram-logo" title="Написать в Telegram" />
                </a>
                <a href="tel:+79107955555" title="Позвонить директору" aria-label="Позвонить директору"><img src="/storage/icons/telefon-logo.png" alt="telefon-logo" title="Позвонить директору" /></a>
            </div>
            <div className="footer-auth__div">
                <p className="margin-bottom12px">Сделано&nbsp;<a href="mailto:serg.bolshakov@gmail.com">Большаковым&nbsp;Сергеем</a>, 2023-{currentYear}</p>
                <p>Демоверсия 0.0.5 <a href="https://github.com/serg-bolshakov/zonefloorball.ru" target="_blank" rel="noopener noreferrer"><span className="header-icon">Посмотреть</span></a> исходный код.</p>
                <p className="margin-bottom12px">Буду рад сотрудничеству&nbsp;(<Link href="/storage/docs/resume.pdf"><span className="cursive header-icon">resume.pdf</span></Link><span className="cursive">, 68 Кб</span>) — <br /><span className="cursive">Обновлено 06.03.2025 г.</span></p>
                <p><a href="https://floorball.nnov.ru/htdocs/shop/">Перейти на сайт&nbsp;</a>флорбольной экипировки</p>
                <p>или в наш флорбольный <a href="https://floorball.nnov.ru/market/floorball-sticks">Интернет-магазин&nbsp;</a></p>
            </div>
        </>
    );
};

export default CustomersCares;