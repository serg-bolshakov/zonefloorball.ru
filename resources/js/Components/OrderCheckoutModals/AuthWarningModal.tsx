// resources/js/Components/OrderCheckoutModals/AuthWarningModal.tsx
import useModal from "@/Hooks/useModal";
import { Link, router } from "@inertiajs/react";

interface AuthWarningModalProps {
    onContinueAsGuest: () => void;
    onAuthRedirect?: () => void; // Опционально
}

const AuthWarningModal: React.FC<AuthWarningModalProps> = ({
    onContinueAsGuest,
    onAuthRedirect,
  }) => {
    
    const { closeModal } = useModal();

    const handleAuth = (e: React.MouseEvent, path: string) => {
        e.preventDefault();
        closeModal();
        
        /* Красивый "бесшовный" вариант перехода заработает, когда blade-шаблоны форм перепишем на React-компоненты (комментируем "до лучших времён"):
            // 2. Делаем плавный SPA-переход
            router.visit(path, {
                preserveState: true, // Сохраняем состояние страницы (корзину)
                onFinish: () => {
                    // Дополнительные действия после перехода (если нужны)
                    onAuthRedirect?.();
                }
            });
        */

        window.location.href = path;
        onAuthRedirect?.(); // Вызов если передан
    };

    return (
        <>
            <p>Важно! Оформление заказа производится без регистрации и авторизации покупателя! 
                Вы сможете отслеживать изменения статуса и ход доставки только по ссылке, полученной в письме. 
                Для доступа в "личный кабинет", получения более детальной информации и специальных цен, 
                рекомендуем <a href="/register" onClick={(e) => handleAuth(e, '/register')}>зарегистрироваться</a> в системе или <a href="/login" onClick={(e) => handleAuth(e, '/login')}>авторизоваться</a>
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