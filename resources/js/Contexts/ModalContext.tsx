import React, { createContext, useContext, useState, ReactNode } from 'react';
// создаём контекст (создали этот файл ModalContext.jsx) и импортируем сюда функцию createContext

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

// создаём объект контекста и записываем его в переменную ModalContext, предоставляет методы для открытия и закрытия МО, 
// а также состояние МО (модального окна):
// Создаём контекст с типом ModalContextType
const ModalContext = createContext<IModalContextType | undefined>(undefined);


// ModalProvider — это компонент, который предоставляет контекст всем своим дочерним компонентам.
export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

// Внутри него используется хук useState, который создаёт состояние modal. Это состояние — объект с двумя свойствами:
// isOpen: булево значение, указывающее, открыто ли модальное окно.
// content: содержимое модального окна (например, компонент <AboutUs />).

    const [modal, setModal] = useState<IModalState>({ isOpen: false, content: null });

    // openModal(content) — функция, которая открывает модальное окно. Она принимает параметр content (например, компонент <AboutUs />) и обновляет состояние, устанавливая isOpen: true и сохраняя переданный контент.
    // 
    const openModal = (content: ReactNode) => {
        setModal({ isOpen: true, content });
    };

    // closeModal() — функция, которая закрывает модальное окно. Она сбрасывает состояние, устанавливая isOpen: false и удаляя контент.
    const closeModal = () => {
        setModal({ isOpen: false, content: null });
    };


    // ModalContext.Provider — это компонент, который делает контекст доступным для всех своих дочерних элементов.
    // В value передаётся объект, содержащий: modal: текущее состояние модального окна.
    // openModal: функция для открытия модального окна. closeModal: функция для закрытия модального окна.
    // {children} — это все компоненты, которые будут обёрнуты в ModalProvider. Они получат доступ к контексту.

    return (
        <ModalContext.Provider value={{ modal, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
};

// useModal — это кастомный хук, который упрощает использование контекста. Внутри он использует useContext(ModalContext), 
// чтобы получить доступ к значениям, переданным в ModalContext.Provider.
// Теперь вместо того чтобы писать useContext(ModalContext) в каждом компоненте, мы можем просто использовать useModal().

export const useModal = () => {
    const context = useContext(ModalContext);
    if(!context) {
        throw new Error('useModal должен быть использован внутри ModalProvider / useModal must be used within a ModalProvider');
    }
    return context;
};

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