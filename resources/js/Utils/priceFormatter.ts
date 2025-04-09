export const formatPrice = (price: number): string => {
    return price.toLocaleString('ru-RU', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};