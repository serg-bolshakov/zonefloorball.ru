// resources/js/Types/warehouses.ts

export interface IWarehouse {
    id: number;
    shortCode: string,
    adddress: string,
    is_pickup_point: boolean,
    is_active: boolean,
    workHours?: string,
}
    
export interface IDeliveryOption {
    id: number;
    code: string;
    name: string;
    warehouses?: IWarehouse[];
}