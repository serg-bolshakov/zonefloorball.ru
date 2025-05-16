// resourced/js/Components/ConfirmModal.tsx
import useModal from '@/Hooks/useModal';

export interface IConfirmModalProps {
    title: string;
    onConfirm: () => void;
    onCancel?: () => void;
    onClose: () => void;
}

export const ConfirmModal: React.FC<IConfirmModalProps> = ({
    title,
    onConfirm,
    onCancel,
    onClose
}) => {
  
    const { closeModal } = useModal();

    return (
            <div className="modal-confirmation__overlay">
                <div className="modal-confirmation__content">
                    <div className="modal-confirmation__icon">?</div>
                    <h3 className="modal-confirmation__title">{title}</h3>
                    <div className="modal-confirmation__buttons">
                        <button
                            onClick={() => {
                                onCancel?.();
                                onClose();
                            }}
                            className="modal-confirmation__button modal-confirmation__button--cancel"
                        >
                            Оставить
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="modal-confirmation__button modal-confirmation__button--confirm"
                        >
                            Удалить
                        </button>
                    </div>
                </div>
            </div>
    );
};