// resources/js/Components/ModalAdapter.tsx
import React from 'react';
import Modal from './Modal';
import { useContext } from 'react';
import ModalContext from '@/Contexts/ModalContext';

export const ModalAdapter: React.FC = () => {
    const context = useContext(ModalContext);
    // console.log('ModalAdapter context:', context);
    
    if (!context) return null;
    
    const { modal, closeModal } = context;
    return (
      <Modal isOpen={modal.isOpen} onClose={closeModal}>
        {modal.content}
      </Modal>
    );
  };