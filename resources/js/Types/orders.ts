// resources/js/Types/orders.ts
import { IProduct } from "./types";

export type IGuestCustomerData = {
    firstName: string;
    lastName: string;
    phone: string;
    email: string; // Опционально, но рекомендуется
    deliveryAddress: string; // Если требуется
};

export interface IGuestOrder {
    id?: string;
    items: IProduct[];
    customer: {
      firstName: string;
      lastName: string;
      phone: string;
      email?: string; 
    };
    delivery: {
      type: 'pickup' | 'local' | 'post';
      address?: string;
    };
    status?: IOrderStatus;
}

export interface IOrderStatus {
    // 
}

export type TValidationRule = {
    type: 'text' | 'tel' | 'address' | 'email';
    maxLength?: number;
    required: boolean;
};