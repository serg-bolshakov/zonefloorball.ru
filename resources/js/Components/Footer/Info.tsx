// resources/js/Components/Footer/Info.tsx

import React from 'react';
import useModal from '../../Hooks/useModal';
import AboutUs from '../Articles/AboutUs';
import PaymentAndDelivery from '../Articles/PaymentAndDelivery';
import ReturnRules from '../Articles/ReturnRules';
import { Link } from '@inertiajs/react';

const Info: React.FC = () => {
    // В компоненте Info мы используем контекст для открытия модального окна... используем хук useModal:
    const { openModal } = useModal();
    // openModal — это не стейт в классическом понимании (не хук useState), а значение, которое возвращается из контекста.
    
    return (
        <>
            <p className="modal-link" onClick={() => openModal(<AboutUs />)}>О нас</p>
            <p className="modal-link" onClick={() => openModal(<PaymentAndDelivery />)}>Оплата и доставка</p>
            <p className="modal-link" onClick={() => openModal(<ReturnRules />)}>Правила обмена и возврата</p>
            <p><Link href="/sitemap">Карта сайта</Link></p>
            <Link href="/legal/privacy-policy">Политика конфиденциальности</Link>
            <Link href="/legal/offer">Где и как купить</Link>
        </>
    );
};

export default Info;