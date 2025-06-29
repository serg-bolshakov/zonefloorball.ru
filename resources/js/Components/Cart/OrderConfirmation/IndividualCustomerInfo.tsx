//resources/js/Components/Cart/OrderConfirmation/IndividualCustomerInfo.tsx
import { TCartIndividualCustomer } from "@/Types/cart";

interface IndividualCustomerInfoProps {
    customer: TCartIndividualCustomer;
}

export const IndividualCustomerInfo = ({ customer }: IndividualCustomerInfoProps) => (
    <>
        {/* Данные получателя */}
        <div className="d-flex flex-sb margin-tb12px">
            <span>Получатель:</span>
            <span>{customer.lastName} {customer.firstName}</span>
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