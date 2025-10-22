// types/transport.ts

// такой интерфейс уже описан: resources/js/Types/delivery.d.ds - здесь просто для информации
/* export interface ITransport {
  id: number;
  code: string;
  name: string;
  description?: string;
  price_calculation: 'fixed' | 'distance' | 'weight' | 'external';
  base_price: number;
  price_per_km?: number;
  price_per_kg?: number;
  override_price?: number;
  is_active: boolean;
  external_link?: string;
}*/

export enum TransportCodes {
  PICKUP = 'pickup',
  LOCAL = 'local', 
  POST = 'post'
}