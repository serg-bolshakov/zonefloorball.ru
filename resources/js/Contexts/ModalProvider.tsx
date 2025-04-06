// resources/js/Contexts/ModalProvider.tsx
import React, { useState, ReactNode } from 'react';
import ModalContext from './ModalContext';
import { IModalState } from '../Types/types'; // Интерфейс для состояния модального окна

interface IModalProviderProps {
    children: ReactNode;
}

export const ModalProvider: React.FC<IModalProviderProps> = ({ children }) => {
    // Явно указываем тип для состояния
    const [modal, setModal] = useState<IModalState>({ isOpen: false, content: null });

    const openModal = (content: ReactNode) => {
        setModal({ isOpen: true, content });
    };

    const closeModal = () => {
        setModal({ isOpen: false, content: null });
    };
    // console.log('ModalProvider mounted', { modal, openModal, closeModal });
    return (
        <ModalContext.Provider value={{ modal, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
};

// ModalContext.Provider - провайдер контекста, который является свойством ОБЪЕКТА КОНТЕКСТА ModalContext