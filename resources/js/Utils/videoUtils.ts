// resources/js/Utils/videoUtils.ts - Определяем ориентацию видео на стороне сервера/клиента

export type VideoOrientation = 'portrait' | 'landscape' | 'square';

export const detectVideoOrientation = (
    width: number, 
    height: number
): VideoOrientation => {
    const ratio = width / height;
    
    if (ratio > 1.25) return 'landscape';
    if (ratio < 0.8) return 'portrait';
    return 'square';
};

// Или на стороне сервера (PHP/Laravel пример):
// При загрузке видео определяем ориентацию и сохраняем в БД