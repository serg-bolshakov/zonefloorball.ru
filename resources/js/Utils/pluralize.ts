// resources/js/Utils/pluralize.ts
export const pluralizeReviews = (count: number): string => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'реальных отзывов';
    }
    
    if (lastDigit === 1) {
        return 'реальный отзыв';
    }
    
    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'реальных отзыва';
    }
    
    return 'реальных отзывов';
};

// универсальная функция для любых слов:
export const pluralize = (count: number, words: [string, string, string]): string => {
    const cases = [2, 0, 1, 1, 1, 2];
    const index = (count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)];
    return `${count} ${words[index]}`;
};

// Использование:
// pluralize(5, ['отзыв', 'отзыва', 'отзывов']) → "5 отзывов"