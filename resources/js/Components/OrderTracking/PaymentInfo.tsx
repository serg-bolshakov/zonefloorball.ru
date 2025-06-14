// Компонент для информации об оплате
import { IOrderPayment } from "@/Pages/OrderTracking";


export const PaymentInfo: React.FC<{ payment: IOrderPayment }> = ({ payment }) => {
    return (
        <div className="payment-info">
            <div className="info-row">
                <span>Способ оплаты:</span>
                <span>{payment.method.label}</span>
            </div>
            <div className="info-row">
                <span>Статус оплаты:</span>
                <span className={`payment-status ${payment.status.code}`}>
                    {payment.status.label}
                </span>
            </div>
            {payment.invoice_url && (
                <a 
                    href={payment.invoice_url} 
                    className="invoice-link"
                    target="_blank" 
                    rel="noopener noreferrer"
                >
                    Скачать счет
                </a>
            )}
        </div>
    );
};