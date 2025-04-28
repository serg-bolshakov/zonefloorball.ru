// resources/js/Types/inertia.d.ts
// Назначение:            Типизация данных, приходящих от сервера через Inertia.js. 
// Пример использования:  Пропсы страниц, общие данные (например, deliveryPrice)
// Где доступен:          Во всех компонентах, использующих usePage()

import '@inertiajs/core';
import { ITransport } from './delivery';

declare module '@inertiajs/core' {
  interface PageProps {
    deliveryPrice: number;
    transports?: ITransport[];
    // другие общие пропсы...
  }
}

/** Оптимизированная структура (рекомендуемая)
  resources/
    js/
      Types/
        inertia.d.ts       # Типы Inertia.js
        delivery/          # Типы доставки
          widget.d.ts      # Типы виджета Почты России
          api.d.ts         # Типы API-ответов
        index.d.ts         # Главный файл экспорта типов
 

  Разделение ответственности:
    - inertia.d.ts — только для типов, связанных с Inertia.js
    - delivery/*.d.ts — для бизнес-логики доставки
 */