import { AnimatePresence, motion } from 'framer-motion';
import { TMode } from './OrderProcess';

interface IButtonProps {
    disabled: boolean; 
    isPulsing: boolean;
    onClick: () => void;    // Теперь ожидает готовую функцию
    mode: TMode;
}

const CheckoutOrderProcessButton = ({ disabled, onClick, isPulsing, mode }: IButtonProps) => (
    <motion.button
        className={`${disabled ? 'basket-button basket-button_disabled' : 'basket-button'}`}
        onClick={onClick}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        animate={isPulsing ? {
            scale: [1, 0.98, 1],
            transition: { repeat: Infinity, repeatDelay: 2 }
        } : {}}
    >
        {mode === 'cart' ? 'Оформить заказ' : 'Предзаказ'}
    </motion.button>
);

export default CheckoutOrderProcessButton;