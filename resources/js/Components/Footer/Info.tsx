// resources/js/Components/Footer/Info.tsx

import React from 'react';
import useModal from '../../Hooks/useModal';
import AboutUs from '../Articles/AboutUs';
import PaymentAndDelivery from '../Articles/PaymentAndDelivery';
import ReturnRules from '../Articles/ReturnRules';
import WhereAndHowToBuy from '../Articles/WhereAndHowToBuy';
import { Link } from '@inertiajs/react';

const Info: React.FC = () => {
    // В компоненте Info мы используем контекст для открытия модального окна... используем хук useModal:
    const { openModal } = useModal();
    // openModal — это не стейт в классическом понимании (не хук useState), а значение, которое возвращается из контекста.
    
    return (
        <>
            {/* <div className="telegram-channel margin-tb8px">
                <a href="https://t.me/floorball_shop" target="_blank" rel="noopener noreferrer" className="channel-link">
                    <span className="channel-icon">📢</span>
                    <span className="channel-text">Новости и акции в Telegram</span>
                </a>
            </div> */}
            {/* Новый блок для Telegram-канала */}
            <div className="telegram-promo">
                <div className="telegram-promo-content">
                    <div className="promo-text">
                        {/* <span className="promo-icon">🔔</span> */}
                        <strong>Подпишитесь на наш Telegram-канал!</strong>
                        <br />
                        <a href="https://t.me/floorball_shop" target="_blank" rel="noopener noreferrer">
                            @floorball_shop - новости, акции, распродажи
                        </a>
                    </div>
                </div>
            </div>
            <p className="modal-link" onClick={() => openModal(<WhereAndHowToBuy />)}>Где и как купить</p>
            <p className="modal-link" onClick={() => openModal(<PaymentAndDelivery />)}>Оплата и доставка</p>
            <p className="modal-link" onClick={() => openModal(<ReturnRules />)}>Правила обмена и возврата</p>
            <p><Link href="/sitemap">Карта сайта</Link></p>
            <a href="/legal/privacy-policy"  target="_blank" rel="noopener noreferrer">Политика конфиденциальности</a>
            <a href="/legal/offer"  target="_blank" rel="noopener noreferrer">Публичная оферта</a>
            <p className="modal-link" onClick={() => openModal(<AboutUs />)}>О нас</p>
            
        </>
    );
};

export default Info;