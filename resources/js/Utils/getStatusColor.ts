// Функция для определения цвета точки по статусу
export const getStatusColor = (status: string) => {
       
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('заверш') || statusLower.includes('получен')) return '#4CAF50'; 

    if (statusLower.includes('доставк') || statusLower.includes('в пути') || statusLower.includes('отправлен')) {
        return '#2196F3'; // Синий
    }
    if (statusLower.includes('обработк') || statusLower.includes('подтвержден') || statusLower.includes('упакован')) {
        return '#FF9800'; // Оранжевый
    }
    if (statusLower.includes('создан') || statusLower.includes('зарезервирован')) {
        return '#9C27B0'; // Фиолетовый
    }
    if (statusLower.includes('готов')) {
        return '#a20000ff'; // Вишнёвый
    }

    if (statusLower.includes('возврат') || statusLower.includes('аннулирован')) return '#fb1b17ff'; 
    
    return '#9E9E9E'; // Серый по умолчанию
};