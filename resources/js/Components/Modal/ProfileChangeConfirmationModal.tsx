// resourced/js/Components/Modal/ProfileChangeConfirmationModal.tsx

export interface IUpdateModalProps {
    title: string;
    onConfirm: () => void;
    onCancel?: () => void;
    onClose: () => void;
}

export const ProfileChangeConfirmationModal: React.FC<IUpdateModalProps> = ({
    title,
    onConfirm,
    onCancel,
    onClose
}) => {

    return (
            <div className="modal-confirmation__overlay">
                <div className="modal-confirmation__content">
                    <div className="modal-confirmation__exclamation-mark">!</div>
                    <h3 className="modal-confirmation__title">{title}</h3>
                    <div className="modal-confirmation__buttons">
                        <button
                            onClick={() => {
                                onCancel?.();
                                onClose();
                            }}
                            className="modal-confirmation__button modal-confirmation__button--cancel"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="modal-confirmation__button modal-confirmation__button--agree"
                        >
                            Обновить
                        </button>
                    </div>
                </div>
            </div>
    );
};