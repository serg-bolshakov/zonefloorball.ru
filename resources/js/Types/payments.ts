// Enum для статусов оплаты (синхронизирован с PHP)
export enum EnumPaymentStatuses {
    PENDING = 'pending',
    INITIATED = 'initiated',
    PARTIALLY_PAID = 'partially_paid',
    PAID = 'paid',
    FAILED = 'failed',
    PARTIALLY_REFUNDED = 'partially_refunded',
    REFUNDED = 'refunded',
    CANCELLED = 'cancelled',
}

export const PaymentStatusLabels: Record<EnumPaymentStatuses, string> = {
    [EnumPaymentStatuses.PENDING]: 'Ожидает оплаты',
    [EnumPaymentStatuses.INITIATED]: 'Платёж инициирован',
    [EnumPaymentStatuses.PARTIALLY_PAID]: 'Частично оплачен',
    [EnumPaymentStatuses.PAID]: 'Оплачен',
    [EnumPaymentStatuses.FAILED]: 'Ошибка оплаты',
    [EnumPaymentStatuses.PARTIALLY_REFUNDED]: 'Частичный возврат',
    [EnumPaymentStatuses.REFUNDED]: 'Возврат',
    [EnumPaymentStatuses.CANCELLED]: 'Отменён'
};
