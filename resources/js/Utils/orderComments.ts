// resources/js/Utils/orderComments.ts
import { EnumOrderStatus, IOrder } from "@/Types/orders";
import { getTransportByOrder, TransportConfig } from './transportMappings';
// import { TransportCodes } from "@/Types/transport";

export const generateStatusComment = (
  status: EnumOrderStatus,
  order: IOrder,
  customData?: {
    trackNumber?: string;
    driverInfo?: string;
    expectedDate?: string;
  }
): string => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const formatDate = (date: Date) => date.toLocaleDateString('ru-RU');

  // Получаем данные о доставке по ID
  const transport = getTransportByOrder(order);
  
  switch (status) {
    case EnumOrderStatus.READY_TO_BE_DISPATCHED:
      switch (transport?.code) {
        case 'post':
          return `Заказ упакован. Готов к передаче в доставку Почтой России. Расчётная дата отправки ${formatDate(today)}-${formatDate(tomorrow)}`;
        
        case 'local':
          return `Заказ укомплектован и собран на складе. Готов к передаче в доставку по городу средствами продавца.`;
        
        case 'pickup':
          return `Заказ собран и укомплектован. Готов к выдаче/получению на складе продавца.`;
        
        default:
          return `Заказ готов к отправке. Расчетная дата передачи в службу доставки: ${formatDate(today)}-${formatDate(tomorrow)}`;
      }

    case EnumOrderStatus.SHIPPED:
      const expectedDate = customData?.expectedDate;

      switch (transport?.code) {
        case 'post':
            return  expectedDate ? `Заказ отправлен. В пути. Ожидаемая дата доставки – ${expectedDate}.` : 'Заказ отправлен. В пути. Почта обещает доставить заказ...';
        
        case 'local':
            return  expectedDate ? `Заказ передан в курьерскую службу. Ожидаемая дата доставки – ${expectedDate}.` : 'Заказ передан в курьерскую службу.';
        
        case 'pickup':
            return `Заказ готов к выдаче. Можете забрать его в пункте самовывоза.`;

        default:
          return  expectedDate ? `Заказ отправлен. В пути. Ожидаемая дата доставки – ${expectedDate}.` : 'Заказ отправлен. В пути';
      }

    case EnumOrderStatus.DELIVERED:

      switch (transport?.code) {
        case 'post':
            return  'Ожидает адресата в месте вручения. Готов к выдаче/получению';
        
        case 'local':
            return  'Ожидает разгрузки/Получения';
        
        default:
          return  'Заказ доставлен';
      }

    default:
      return '';
  }
};

// Вспомогательная функция для получения названия службы доставки
export const getDeliveryServiceName = (order: IOrder): string => {
  const transport = getTransportByOrder(order);
  
  switch (transport?.code) {
    case 'post':
      return 'Почтой России';
    case 'local':
      return 'курьерской службой продавца';
    case 'pickup':
      return 'самовывозом';
    default:
      return 'службой доставки';
  }
};

export const generateTrackingComment = (
  trackNumber: string, 
  driverInfo?: { name: string; carNumber: string; phone: string }
): string => {
  let comment = `Номер для отслеживания доставки на сайте Почты России: <a href="https://www.pochta.ru/tracking?barcode=${trackNumber}" target="_blank">${trackNumber}</a>`;
  
  if (driverInfo) {
    comment += ` (Для доставки заказа Вам назначен водитель: ${driverInfo.name}, номер машины ${driverInfo.carNumber}, телефон: ${driverInfo.phone})`;
  }
  
  return comment;
};

// Вспомогательная функция для отладки
export const debugTransportInfo = (order: IOrder) => {
  const transport = getTransportByOrder(order);
  console.log('🚚 Transport debug:', {
    orderId: order.id,
    transportId: order.order_transport_id,
    transportData: transport
  });
  return transport;
};