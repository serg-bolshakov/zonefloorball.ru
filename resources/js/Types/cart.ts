// resources/js/Types/cart.ts

export type TCartGuestCustomer = {
    type: 'guest';
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    deliveryAddress: string;
    // Только нужные для корзины поля
};

export type TCartIndividualCustomer = Omit<TCartGuestCustomer, 'type'> & {
    type: 'individual';
    bonuses?: number;
};

export type TCartLegalCustomer = {
    type: 'legal';
    orgName: string;
    inn?: string;
    kpp?: string;
};

// Объединённый тип
export type TCartCustomer = 
  | TCartGuestCustomer
  | TCartIndividualCustomer;
//  | TCartLegalCustomer;
