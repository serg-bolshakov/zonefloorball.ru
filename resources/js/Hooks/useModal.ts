// resources/js/Hooks/useModal.ts

/**
 * useModal — это кастомный хук, который упрощает использование контекста. Внутри он использует useContext(ModalContext),
 * чтобы получить доступ к значениям, переданным в ModalContext.Provider.
 * Теперь вместо того чтобы писать useContext(ModalContext) в каждом компоненте, мы можем просто использовать useModal().
 */
import { useContext } from 'react';
import ModalContext from '../Contexts/ModalContext'; // Импортируем контекст

const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        console.error('Модальный контекст отсутствует! Проверить иерархию провайдера');
        throw new Error('useModal должен быть использован внутри ModalProvider');
    }
    return context;
};

export default useModal;