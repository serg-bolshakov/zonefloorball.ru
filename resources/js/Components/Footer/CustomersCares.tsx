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
                <p className="margin-top12px text-align-left margin-bottom12px">
                    Сайт в разработке. Только для информации.<br /><span className='color-red'>Открытие 31 июля 2025&nbsp;г.</span>
                </p>
                <p className="margin-top12px margin-bottom12px">Можно <a href="https://floorball.nnov.ru/htdocs/shop/">перейти на сайт&nbsp;</a>флорбольной экипировки<br />
                или в наш флорбольный <a href="https://floorball.nnov.ru/market/floorball-sticks">Интернет-магазин&nbsp;</a></p>
                
                <p className="">Сделано&nbsp;<a href="mailto:serg.bolshakov@gmail.com">Большаковым&nbsp;Сергеем</a>, 2025</p>
                {/* <p>Демоверсия 0.0.5 <a href="https://github.com/serg-bolshakov/zonefloorball.ru" target="_blank" rel="noopener noreferrer"><span className="header-icon">Посмотреть</span></a> исходный код.</p> */}
                <p className="margin-bottom12px">Буду рад сотрудничеству&nbsp;(<a href="/storage/docs/resume.pdf"  target="_blank" rel="noopener noreferrer"><span className="cursive header-icon">resume.pdf</span></a><span className="cursive">, 68 Кб</span>). <span className='strong'>Интернет-магазин "под ключ". Администрирование</span>.</p>
            </div>
        </>
    );
};

export default CustomersCares;