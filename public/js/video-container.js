"use strict";

// Получаем все видео
const videos = document.querySelectorAll('.video-container video');

// Функция для воспроизведения видео по ID
function playVideo(videoId) {
    const video = document.getElementById(videoId);
    if (video) {
        video.scrollIntoView({ behavior: 'smooth' }); // Прокручиваем к видео
        video.play(); // Воспроизводим видео
    }
}

// Обработчик для изменения хэша в URL
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1); // Получаем хэш (например, "video-1")
    if (hash.startsWith('video-')) {
        playVideo(hash); // Воспроизводим видео
    }
});

// Воспроизводим видео при загрузке страницы, если в URL есть хэш
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash.startsWith('video-')) {
        playVideo(hash);
    }
});

// Добавляем обработчики для кнопок "Поделиться"
videos.forEach((video, index) => {
    const shareButton = document.createElement('button');
    shareButton.textContent = 'Поделиться';
    shareButton.classList.add('share-button');
    shareButton.addEventListener('click', () => {
        const videoId = `video-${index + 1}`;
        history.pushState(null, '', `#${videoId}`); // Добавляем хэш в URL
        playVideo(videoId); // Воспроизводим видео
    });
    video.parentNode.insertBefore(shareButton, video.nextSibling); // Добавляем кнопку после видео
});