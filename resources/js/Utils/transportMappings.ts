// Utils/transportMappings.ts
export const TransportConfig = {
  1: { code: 'pickup', name: 'Самовывоз' },
  2: { code: 'local', name: 'Доставка по городу' },
  3: { code: 'post', name: 'Почта России' }
} as const;

export type TransportId = keyof typeof TransportConfig;

export const getTransportByOrder = (order: { order_transport_id: number }) => {
  return TransportConfig[order.order_transport_id as TransportId];
};