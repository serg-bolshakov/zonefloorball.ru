// resources/js/Components/Cart/Toast.tsx

import { toast } from 'react-toastify';
import { Zoom } from 'react-toastify';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface IToastProps {
    type: ToastType; 
    message: string;
}

const Toast = ({ type, message }: IToastProps) => {

    const toastConfig = {
        position: "top-right" as const,
        autoClose: 5000, // Уведомление закроется через секунду-другую...
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        transition: Zoom, // Используем Slide, Zoom, Flip, Bounce для этого тоста
    };
    
    // Выбираем метод toast в зависимости от type
    switch (type) {
        case 'success':
            toast.success(message, toastConfig);
            break;
        case 'error':
            toast.error(message, toastConfig);
            break;
        case 'warning':
            toast.warning(message, toastConfig);
            break;
        case 'info':
            toast.info(message, toastConfig);
            break;
        default:
            toast(message, toastConfig); // Дефолтный вариант
    }

    return null; // Компонент не рендерит DOM-элементы
};

export default Toast;