export const formatPrice = (price: number): string => {
    console.log(price);
    console.log(typeof price);
    return price.toLocaleString('ru-RU', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};