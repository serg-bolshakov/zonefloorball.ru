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

declare module '@inertiajs/react' {
  interface Route {
    current: (name: string | RegExp) => boolean;
  }
}

declare interface AdminMenuItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

