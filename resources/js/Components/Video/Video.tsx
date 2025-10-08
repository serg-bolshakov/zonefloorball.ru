// resources/js/Components/Video/Video.tsx

import React, { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

const Video = () => {
    
    const videoContentRef = useRef<HTMLDivElement>(null);
    
    // Получаем хэш из URL (например, "#video-1")
    const hash = window.location.hash.substring(1);

    useEffect(() => {
        let videoElement: HTMLElement | null = null;

        if (hash) {
            videoElement = document.getElementById(hash);
            if (!videoElement) {
                toast.error(`Видео с ID "${hash}" не найдено. Выбирайте видео для просмотра сначала.`, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                window.location.hash = ''; // Сбрасываем хэш
            }
        }

        if (!videoElement) {
            videoElement = document.getElementById('video-1');
        }

        if (videoElement && videoContentRef.current) {
            // Плавный скролл к видео
            videoElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }

    }, [hash]);

    const handleShare = (id: string) => {
        window.location.hash = `#${id}`; // Обновляем хэш в URL - уберём пока эту штуку, думаю, что совсем не обязательно обновлять URL - достаочно просто скопировать ссылку...
    };

    // используем API navigator.clipboard для копирования ссылки в буфер обмена:
    const handleCopyLink = (id: string) => {
        const videoLink = `${window.location.origin}/#${id}`; // Формируем полную ссылку
        navigator.clipboard.writeText(videoLink) // Копируем ссылку в буфер обмена
            .then(() => {
                toast.success('Ссылка скопирована в буфер обмена!', {
                    position: "top-right",
                    autoClose: 2000, // Уведомление закроется через 3 секунды
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            })
            .catch(() => {
                toast.error('Не удалось скопировать ссылку. Попробуйте ещё раз.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            });
    };

    return ( 
        <div className="video-container">
            <div className="video-header">
                <h2>Популярные видеоклипы о флорболе</h2>
                <p className="video-subtitle">Листайте вниз для выбора эпизода</p>
            </div>

            <div className="video-content" ref={videoContentRef}>

                <div className="video-item">
                    <video id="video-1" controls poster="/storage/video/posters/2-balls-trick.webp">
                        <source src="/storage/video/2-balls-trick.mp4" type="video/mp4" />
                        Ваш браузер не поддерживает встроенные видео :(
                    </video>
                    <button className="share-button" onClick={() => handleCopyLink('video-1')}>Скопировать ссылку на видео</button>
                    {/* <div className="scroll-indicator">
                        ↓ Листайте дальше ↓
                    </div> */}
                </div>
                
                <div className="video-item">
                    <video id="video-2" controls poster="/storage/video/posters/mymove-shot-feat-anna-wijk.webp">
                        <source src="/storage/video/mymove-shot-feat-anna-wijk.mp4" type="video/mp4" />
                        Ваш браузер не поддерживает встроенные видео :(
                    </video>
                    <button className="share-button" onClick={() => handleCopyLink('video-2')}>Скопировать ссылку на видео</button>
                    {/* <div className="scroll-indicator">
                        ↓ Листайте дальше ↓
                    </div> */}
                </div>

                <div className="video-item">
                    <video id="video-3" controls poster="/storage/video/posters/shoot-on-watermelon.webp">
                        <source src="/storage/video/shoot-on-watermelon.mp4" type="video/mp4" />
                        Ваш браузер не поддерживает встроенные видео :(
                    </video>
                    <button className="share-button" onClick={() => handleCopyLink('video-3')}>Скопировать ссылку на видео</button>
                    {/* <div className="scroll-indicator">
                        ↓ Листайте дальше ↓
                    </div> */}
                </div>

                <div className="video-item">
                    <video id="video-4" controls poster="/storage/video/posters/floorball-golf.webp">
                        <source src="/storage/video/floorball-golf.mp4" type="video/mp4" />
                        Ваш браузер не поддерживает встроенные видео :(
                    </video>
                    <button className="share-button" onClick={() => handleCopyLink('video-4')}>Скопировать ссылку на видео</button>
                    {/* <div className="scroll-indicator">
                        ↓ Листайте дальше ↓
                    </div> */}
                </div>

                <div className="video-item">
                    <video id="video-5" controls poster="/storage/video/posters/mymove-zorro-shoooting.webp">
                        <source src="/storage/video/mymove-zorro-shoooting.mp4" type="video/mp4" />
                        Ваш браузер не поддерживает встроенные видео :(
                    </video>
                    <button className="share-button" onClick={() => handleCopyLink('video-5')}>Скопировать ссылку на видео</button>
                    {/* <div className="scroll-indicator">
                        ↓ Листайте дальше ↓
                    </div> */}
                </div>

                <div className="video-item">
                    <video id="video-6" controls poster="/storage/video/posters/liseberg-challange.webp">
                        <source src="/storage/video/liseberg-challange.mp4" type="video/mp4" />
                        Ваш браузер не поддерживает встроенные видео :(
                    </video>
                    <button className="share-button" onClick={() => handleCopyLink('video-6')}>Скопировать ссылку на видео</button>
                    {/* <div className="scroll-indicator">
                        ↓ Листайте дальше ↓
                    </div> */}
                </div>

                <div className="video-item">
                    <video id="video-7" controls poster="/storage/video/posters/longdistance-shooting.webp">
                        <source src="/storage/video/longdistance-shooting.mp4" type="video/mp4" />
                        Ваш браузер не поддерживает встроенные видео :(
                    </video>
                    <button className="share-button" onClick={() => handleCopyLink('video-7')}>Скопировать ссылку на видео</button>
                    {/* <div className="scroll-indicator">
                        ↓ Листайте дальше ↓
                    </div> */}
                </div>

                <div className="video-item">
                    <video id="video-8" controls poster="/storage/video/posters/mymove-ball-to-the-basket.webp">
                        <source src="/storage/video/mymove-ball-to-the-basket.mp4" type="video/mp4" />
                        Ваш браузер не поддерживает встроенные видео :(
                    </video>
                    <button className="share-button" onClick={() => handleCopyLink('video-8')}>Скопировать ссылку на видео</button>
                    {/* <div className="scroll-indicator">
                        ↓ Листайте дальше ↓
                    </div> */}
                </div>

                <div className="video-item">
                    <video id="video-9" controls poster="/storage/video/posters/mymove-do-not-repeat-that.webp">
                        <source src="/storage/video/mymove-do-not-repeat-that.mp4" type="video/mp4" />
                        Ваш браузер не поддерживает встроенные видео :(
                    </video>
                    <button className="share-button" onClick={() => handleCopyLink('video-9')}>Скопировать ссылку на видео</button>
                </div>
                <div className="scroll-indicator">
                    ↓ Листайте дальше ↓
                </div>
            </div>
        </div>
    );
}

export default Video;