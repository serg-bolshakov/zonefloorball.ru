// Компонент для информации об оплате
import { IOrderPayment } from "@/Pages/OrderTracking";

export const PaymentInfo: React.FC<{ payment: IOrderPayment }> = ({ payment }) => {
    console.log(payment);
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

            <div className="payment-buttons-grid margin-top12px">
                {payment.invoice_url && payment.invoice_url !== 'null' && (
                    <a 
                        href={payment.invoice_url} 
                        className="payment-button"
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        Скачать счет
                    </a>
                )}

                {payment.payment_url && (
                    <form 
                        action={payment.payment_url} 
                        method="POST"
                        target="_blank"
                        className="payment-form"
                    >
                        <button type="submit" className="payment-button">
                            Оплатить заказ
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};