// resources/js/Components/OrderCheckoutModals/AuthWarningModal.tsx
import useModal from "@/Hooks/useModal";
import { Link } from "@inertiajs/inertia-react";    // Жёсткая связка с Inertia.js (Link) - это скорее недостаток - перепишем в коде на <a>... наверное...

interface AuthWarningModalProps {
    onContinueAsGuest: () => void;
    onAuthRedirect?: () => void; // Опционально
}

const AuthWarningModal: React.FC<AuthWarningModalProps> = ({
    onContinueAsGuest,
    onAuthRedirect,
  }) => {
    
    const { closeModal } = useModal();

    const handleAuth = (e: React.MouseEvent) => {
        e.preventDefault();
        closeModal();
        onAuthRedirect?.(); // Вызов если передан
    };

    return (
        <>
            <p>Важно! Оформление заказа производится без регистрации и авторизации покупателя! 
                Вы сможете отслеживать изменения статуса и ход доставки только на этом устройстве в разделе "Мои заказы / покупки". 
                Для доступа в "личный кабинет" и получения более детальной информации и специальных цен, 
                рекомендуем <a href="/register" onClick={handleAuth}>зарегистрироваться</a> в системе или <a href="/login" onClick={handleAuth}>авторизоваться</a>
            </p>
            <p>Благодарим за обращение в нашу компанию. Надеемся на взаимовыгодное сотрудничество.</p>
            
            <div className="d-flex flex-sb">
                <button id="exitMakingOrderToBeReficterdButton" onClick={() => closeModal()} className="modal-button margin-right12px">Отменить оформление заказа.</button>
                <button id="confirmBeRegisteredOrNotToBeButton" onClick={onContinueAsGuest} className="modal-button margin-left12px">Продолжим без регистрации.</button>
            </div>
        </>
    );
};

export default AuthWarningModal;