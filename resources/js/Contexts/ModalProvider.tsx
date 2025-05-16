// resources/js/Contexts/ModalProvider.tsx
import React, { useState, ReactNode } from 'react';
import ModalContext from './ModalContext';
import { IModalState } from './ModalContext'; // Интерфейс для состояния модального окна
import { TModalType } from './ModalContext';

interface IModalProviderProps {
    children: ReactNode;
}

export const ModalProvider: React.FC<IModalProviderProps> = ({ children }) => {
    // Явно указываем тип для состояния
    const [modal, setModal] = useState<IModalState>({ 
        isOpen: false, 
        content: null,
        type: 'default',
        props: {}
    });

    const openModal = (content: ReactNode, type: TModalType = 'default', props = {}) => {
        setModal({ isOpen: true, content, type, props });
    };

    const closeModal = () => {
        setModal({ isOpen: false, content: null, type: 'default', props: {} });
    };
    // console.log('ModalProvider mounted', { modal, openModal, closeModal });
    
    return (
        <ModalContext.Provider value={{ modal, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
};

// ModalContext.Provider - провайдер контекста, который является свойством ОБЪЕКТА КОНТЕКСТА ModalContext