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

            <div className="d-flex aline-items-center aline-content-center">
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

                {/* {payment.payment_url && (
                    <a 
                        href={payment.payment_url} 
                        className="invoice-link margin-left12px"
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        Оплатить заказ
                    </a>
                )} */}

                {payment.payment_url && (
                    <form 
                        action={payment.payment_url} 
                        method="POST"
                        target="_blank"
                    >
                        <button type="submit" className="invoice-link margin-left12px fs14">
                            Оплатить
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};