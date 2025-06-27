//resources/js/Components/Cart/OrderConfirmation/LegalCustomerInfo.tsx
import { TCartLegalCustomer } from "@/Types/cart";

interface LegalCustomerInfoProps {
    customer: TCartLegalCustomer;
}

export const LegalCustomerInfo = ({ customer }: LegalCustomerInfoProps) => (
    <>
        {/* Данные получателя */}
        <div className="d-flex flex-sb margin-tb12px">
            <span>Получатель:</span>
            <span>{customer.orgname}</span>
        </div>

        <div className="d-flex flex-sb margin-tb12px">
            <span>Телефон:</span>
            <span>{customer.phone}</span>
        </div>

        <div className="d-flex flex-sb margin-tb12px">
            <span>Электронная почта:</span>
            <span>{customer.email}</span>
        </div>
    </>
);