// resources/js/Components/Footer/Articles.tsx

import React from 'react';
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
            <p className="modal-link" onClick={() => openModal(<AboutFlex />)}>Про жёсткость (флекс)</p>
            <p className="modal-link" onClick={() => openModal(<AboutSideHand />)}>Как правильно определить хват</p>
            <p className="modal-link" onClick={() => openModal(<HowChooseStick />)}>Как выбирать клюшку</p>            
        </>
    );
};

export default Articles;