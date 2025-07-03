import { AnimatePresence, motion } from 'framer-motion';

interface IButtonProps {
    disabled: boolean; 
    isPulsing: boolean;
    onClick: () => void;
    
}

const CheckoutButton = ({ disabled, onClick, isPulsing }: IButtonProps) => (
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
        Оформить заказ
    </motion.button>
);

export default CheckoutButton;