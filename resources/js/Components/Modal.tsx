// resources/js/Components/Modal.tsx

import React, { ReactNode, useEffect } from 'react';

// Компонент Modal принимает пропсы isOpen, onClose и children, и отображает модальное окно, если isOpen равно true.
// При клике на фон модального окна (div.modal) вызывается onClose, который закрывает окно.

// Типизация компонента Modal. Добавим типы для пропсов компонента Modal:
interface IModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;    // ReactNode — это тип для любого React-элемента (компонент, строка, число и т.д.)
}

// React.FC — это тип, предоставляемый React. Он расшифровывается как React Function Component (функциональный компонент React).
// Это сокращение для React.FunctionComponent. Автоматически типизирует children как ReactNode. Упрощает типизацию пропсов по умолчанию.

const Modal: React.FC<IModalProps> = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';    // Блокируем скролл страницы
        } else {
            document.body.style.overflow = 'auto';      // Восстанавливаем скролл
        }
    }, [isOpen]);

    // добавляем ESC-закрытие:
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') onClose();
        };
      
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-react" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="modal-close" onClick={onClose}>&times;</span>
                {children}
            </div>
        </div>
    );
};

export default Modal;
