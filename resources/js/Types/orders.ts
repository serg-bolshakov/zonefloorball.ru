// resources/js/Types/orders.ts

/*export interface IGuestCustomerData {
    firstName: string;
    lastName: string;
    phone: string;
    email: string; 
    deliveryAddress: string; 
    type: 'guest'; // Добавляем дискриминатор
};

export interface IOrderStatus {
    // 
}

export type TValidationRule = {
    type: 'text' | 'tel' | 'address' | 'email';
    maxLength?: number;
    required: boolean;
};*/

export type TOrderAction = 'pay' | 'reserve' | 'preorder';