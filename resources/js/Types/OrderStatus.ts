// resources/js/types/OrderStatus.ts
export enum OrderStatus {
    PENDING = 1,
    CREATED = 2,
    RESERVED = 3,
    CONFIRMED = 4,
    CANCELLED = 5,
    FAILED = 6,
    IN_PROCESSING = 7,
    READY_TO_BE_DISPATCHED = 8,
    SHIPPED = 9,
    DELIVERED = 10,
    RECEIVED = 11, 
    COMPLETED = 12,
    RETURNED = 13,
    NULLIFY = 14,
    PREORDER = 15
}