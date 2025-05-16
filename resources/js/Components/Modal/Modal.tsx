// resources/js/Components/Modal/Modal.tsx - универсальный компонент модального окна:

import React, { ReactNode, useEffect } from 'react';
import { ConfirmModal } from './ConfirmModal';
import { TModalType } from '@/Contexts/ModalContext';
import { IConfirmModalProps } from './ConfirmModal';

interface IModalProps {
    isOpen: boolean;
    onClose: () => void;
    type?: TModalType;
    content?: ReactNode;
    props?: Record<string, any>;
}

const Modal: React.FC<IModalProps> = ({ isOpen, onClose, type = 'default', content, props }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';    
        } else {
            document.body.style.overflow = 'auto'; 
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') onClose();
        };
      
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!isOpen) return null;

    const renderContent = () => {
        switch (type) {
            case 'confirm':
                const confirmProps = props as IConfirmModalProps;
                return (
                    <ConfirmModal
                        title={confirmProps.title}
                        onConfirm={confirmProps.onConfirm}
                        onCancel={confirmProps.onCancel}
                        onClose={onClose}
                    />
                );
            default:
                return (
                    <div className="modal-react" onClick={onClose}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <span className="modal-close" onClick={onClose}>&times;</span>
                            {content}
                        </div>
                    </div>
                );
        }
    };

    return isOpen ? renderContent() : null;
};

export default Modal;