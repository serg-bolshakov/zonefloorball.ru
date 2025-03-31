// resources/js/Contexts/ModalContext.ts
// создаём контекст (создали этот файл ModalContext.ts) и импортируем сюда функцию createContext

import { createContext, ReactNode } from 'react';

// Интерфейс для состояния модального окна
interface IModalState {
    isOpen: boolean;
    content: ReactNode | null; // ReactNode — это тип для любого React-элемента (компонент, строка, число и т.д.)
}

// Интерфейс для контекста
interface IModalContextType {
    modal: IModalState;
    openModal: (content: ReactNode) => void;
    closeModal: () => void;
}

// Создаём контекст с типом ModalContextType
// начальное значение undefined, так как нам оно непринципиально (можно было оставить просто пустые скобки, если бы не типизация). 
// Заданное значение по умолчанию появится при чтении контекста, если не будет найдено каких-то других:
const ModalContext = createContext<IModalContextType | undefined>(undefined);
console.log('const ModalContext', ModalContext);
export default ModalContext;

/** Как это работает вместе
 
    Шаг 1: Оборачиваем приложение в ModalProvider
    В Home.jsx мы оборачиваем свои компоненты в ModalProvider:

    <ModalProvider>
        <Header />
        <Footer />
    </ModalProvider>

    Теперь все компоненты внутри ModalProvider (включая Header и Footer) могут использовать контекст.

    Шаг 2: Использование контекста в компоненте Info
    В компоненте Info мы используем хук useModal:

    const Info = () => {
        const { openModal } = useModal();

        return (
            <p className="modal-link" onClick={() => openModal(<AboutUs />)}>
                О нас
            </p>
        );
    };

    Когда мы нажимаем на кнопку, вызывается openModal(<AboutUs />).
    Функция openModal обновляет состояние в ModalProvider, устанавливая isOpen: true и сохраняя <AboutUs /> как контент.

    Шаг 3: Отображение модального окна в Footer
    В компоненте Footer мы используем состояние модального окна:

    const Footer = () => {
        const { modal, closeModal } = useModal();

    return (
        <footer>
            { Другие элементы футера }
            <Modal isOpen={modal.isOpen} onClose={closeModal}>
                {modal.content}
            </Modal>
        </footer>
    );
};

    modal.isOpen определяет, нужно ли отображать модальное окно.
    modal.content — это содержимое модального окна (например, <AboutUs />).
    closeModal передаётся в компонент Modal для закрытия окна.

    Шаг 4: Компонент Modal
    Компонент Modal отвечает за отображение модального окна:

    const Modal = ({ isOpen, onClose, children }) => {
        if (!isOpen) return null;

        return (
            <div className="modal" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <span className="modal-close" onClick={onClose}>&times;</span>
                    {children}
                </div>
            </div>
        );
    };
    
    Если isOpen равно false, компонент ничего не рендерит. Если isOpen равно true, отображается 
    модальное окно с переданным контентом (children). При клике на фон модального окна (div.modal) 
    вызывается onClose, который закрывает окно.

 */