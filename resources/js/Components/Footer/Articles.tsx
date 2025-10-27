// resources/js/Components/Footer/Articles.tsx

import React from 'react';
import { Link } from '@inertiajs/react';
import useModal from '../../Hooks/useModal';
import AboutFlex from '../Articles/AboutFlex';
import AboutSideHand from '../Articles/AboutSideHand';
import HowChooseStick from '../Articles/HowChooseStick';

const Articles: React.FC = () => {
    // В компоненте Info мы используем контекст для открытия модального окна... используем хук useModal:
    const { openModal } = useModal();
    // openModal — это не стейт в классическом понимании (не хук useState), а значение, которое возвращается из контекста.
    
    return (
        <>
            {/* Жёсткость клюшки */}
        <div className="article-group">
            <h3 className='group-title'>Жёсткость клюшки (флекс)</h3>
            <p className="modal-link" onClick={() => openModal(<AboutFlex />)}>📖 Теория и объяснение</p>
            <p className="modal-link">
                <Link href="/products/card/71303-klyushka-dlya-florbola-aleters-epic-air-concept-33mm-black-white-83cm-left">
                🎬 Видеообзор с примерами (2:52)
                </Link>
            </p>
        </div>

        {/* Выбор клюшки */}
        <div className="article-group">
            <h3 className='group-title'>Подбор клюшки</h3>
            <p className="modal-link" onClick={() => openModal(<HowChooseStick />)}>📖 Как выбирать по росту</p>
            <p className="modal-link" onClick={() => openModal(<AboutSideHand />)}>📖 Как определить хват</p>
            <p className="modal-link">
                <Link href="/products/card/71303-klyushka-dlya-florbola-aleters-epic-air-concept-33mm-black-white-83cm-left">
                🎬 Видео: Длина клюшки (1:47)
                </Link>
            </p>
        </div>

        {/* Обслуживание */}
        <div className="article-group">
            <h3 className='group-title'>Обслуживание экипировки</h3>
            <p className="modal-link">
                <Link href="/products/card/76111-obmotka-dlya-klyushek-aleters-high-quality-black-junior">
                🎬 Видео: Как заменить обмотку (8:23)
                </Link>
            </p>
        </div>
        </>
    );
};

export default Articles;