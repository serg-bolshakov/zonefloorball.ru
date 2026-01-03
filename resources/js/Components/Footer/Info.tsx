// resources/js/Components/Footer/Info.tsx

import React from 'react';
import useModal from '../../Hooks/useModal';
import AboutUs from '../Articles/AboutUs';
import PaymentAndDelivery from '../Articles/PaymentAndDelivery';
import ReturnRules from '../Articles/ReturnRules';
import WhereAndHowToBuy from '../Articles/WhereAndHowToBuy';
import { Link } from '@inertiajs/react';
import CrashTestsQuickStart from './CrashTestsQuickStart';
import CrashTestsSimple from './CrashTestsSimple';
import CrashTests from './CrashTests';

const Info: React.FC = () => {
    // В компоненте Info мы используем контекст для открытия модального окна... используем хук useModal:
    const { openModal } = useModal();
    // openModal — это не стейт в классическом понимании (не хук useState), а значение, которое возвращается из контекста.
    
    return (
        <div className="info-container">
            {/* Разделитель */}
            <div className="info-divider"></div>

            {/* Telegram промо */}
            <div className="telegram-promo enhanced">
                <div className="telegram-icon">✈️</div>
                <div className="telegram-content">
                    <strong>Telegram-канал</strong>
                    <p>Новости, акции, эксклюзивы</p>
                    <a 
                        href="https://t.me/floorball_shop" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="telegram-link"
                    >
                        Подписаться
                    </a>
                </div>
            </div>
            
            {/* Новый (старый) блок для Telegram-канала */}
            {/* <div className="telegram-promo">
                <div className="telegram-promo-content">
                    <div className="promo-text">
                        <strong>Подпишитесь на наш Telegram-канал!</strong>
                        <br />
                        <a href="https://t.me/floorball_shop" target="_blank" rel="noopener noreferrer">
                            @floorball_shop - новости, акции, распродажи
                        </a>
                    </div>
                </div>
            </div> */}
            {/* <p className="modal-link" onClick={() => openModal(<WhereAndHowToBuy />)}>Где и как купить</p>
            <p className="modal-link" onClick={() => openModal(<PaymentAndDelivery />)}>Оплата и доставка</p>
            <p className="modal-link" onClick={() => openModal(<ReturnRules />)}>Правила обмена и возврата</p>
            <p><Link href="/sitemap">Карта сайта</Link></p>
            <a href="/legal/privacy-policy"  target="_blank" rel="noopener noreferrer">Политика конфиденциальности</a>
            <a href="/legal/offer"  target="_blank" rel="noopener noreferrer">Публичная оферта</a>
            <p className="modal-link" onClick={() => openModal(<AboutUs />)}>О нас</p> */}

            {/* Разделитель */}
            <div className="info-divider"></div>

            {/* Основные ссылки */}
            <div className="info-links">
                <div className="link-group">
                    {/* <h4>ПОКУПАТЕЛЯМ</h4> */}
                    <p className="modal-link" onClick={() => openModal(<WhereAndHowToBuy />)}>
                        • Где и как купить
                    </p>
                    <p className="modal-link" onClick={() => openModal(<PaymentAndDelivery />)}>
                        • Оплата и доставка
                    </p>
                    <p className="modal-link" onClick={() => openModal(<ReturnRules />)}>
                        • Обмен и возврат
                    </p>
                </div>
                
                <div className="link-group">
                    {/* <h4>ИНФОРМАЦИЯ</h4> */}
                    <p><Link href="/sitemap">• Карта сайта</Link></p>
                    <a href="/legal/privacy-policy" target="_blank">
                        • Конфиденциальность
                    </a>
                    <a href="/legal/offer" target="_blank">
                        • Публичная оферта
                    </a>
                    <p className="modal-link" onClick={() => openModal(<AboutUs />)}>
                        • О нас
                    </p>
                </div>
            </div>

            {/* Разделитель */}
            <div className="info-divider"></div>
            
            {/* <CrashTestsQuickStart /> */}
            {/* <CrashTestsSimple /> */}

            {/* Блок краш-тестов - теперь на видном месте */}
            <CrashTests />

        </div>
    );
};

export default Info;