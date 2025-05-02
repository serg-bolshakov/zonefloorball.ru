// resources/js/Types/delivery.d.ts

// Назначение:            Типизация клиентской логики (ответы API, состояния компонентов)
// Пример использования:  Данные виджета Почты России, параметры доставки
// Где доступен:          Только в связанных компонентах


export interface DeliveryDescription {    // информация о доставке, включает в себя следующие поля:
  description: string;                    // описание условий доставки
  values: {                               // значения времени доставки заказа
    deliveryMax: number;                  // максимальное время доставки (в днях)
    deliveryMin: number;                  // минимальное время доставки (в днях);
    extraTimeInHours: number;             // время на обработку заказа (в часах);
  };
}

// Возвращаемые параметры в callbackFunction:
export interface RussianPostWidgetResponse {
  addressTo: string;                      //  адрес пункта выдачи заказа, включает в себя улицу, дом, литеру и т.д.;
  areaTo: string | null;                  //  район пункта выдачи, (возможна строка "null"). null - оставляем null как валидное значение
  cashOfDelivery: number;                 //  стоимость доставки;
  cityTo: string;                         //  город пункта выдачи; 
  deliveryDescription: DeliveryDescription;
  indexTo: string;                        //  индекс пункта выдачи;
  id: number;                             //  ID пункта выдачи заказа;
  regionTo: string;                       //  регион пункта выдачи;
  weight: number;                         //  вес заказа
  mailType:                               //  тип отправления (см. ниже возможные значения поля);
    | 'POSTAL_PARCEL' 
    | 'PARCEL_CLASS_1' 
    | 'ONLINE_PARCEL' 
    | 'ECOM_MARKETPLACE';
  pvzType: 'russian_post' | 'postamat';   // тип пункта выдачи заказа (см. ниже возможные значения поля);
}

export interface ITransport {
  id: number;
  code: 'pickup' | 'local' | 'post';
  name: string;
  base_price: number;
  price_calculation: 'fixed' | 'distance' | 'weight' | 'external';
  description?: string;
  metadata?: {
    work_hours?: string;
    restrictions?: string;
  };
}

export interface IDeliverySelectionData {
  transportId: number;
  address: string;
  price: number;
  time: string;
  metadata?: {
    warehouseId?: number;
  };
}