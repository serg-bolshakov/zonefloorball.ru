//resources/js/Components/Cart/OrderConfirmation/GuestCustomerInfo.tsx
import { IGuestCustomer } from "@/Types/types";
import { IDeliverySelectionData } from "@/Types/delivery";

interface GuestCustomerInfoProps {
    customer: IGuestCustomer;
    deliveryData: IDeliverySelectionData
}

export const GuestCustomerInfo = ({ customer, deliveryData }: GuestCustomerInfoProps) => (
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