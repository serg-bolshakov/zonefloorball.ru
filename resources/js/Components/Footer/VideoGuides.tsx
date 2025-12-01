// resources/js/Components/Footer/VideoGuides.tsx

import React, { useState } from 'react';

const VideoGuides: React.FC = () => {
    const [showVideo, setShowVideo] = useState<string | null>(null);
    
    const videos = [
        { id: 'registration', title: '📝 Регистрация на сайте', duration: '2:57', url: '/storage/video/registration.mov' },
        { id: 'account', title: '👤 Личный кабинет', duration: 'скоро' },
        { id: 'order', title: '🛒 Оформление покупки', duration: 'скоро' },
        { id: 'preorder', title: '📋 Предварительный заказ', duration: 'скоро' },
        { id: 'legal', title: '🏢 Для юридических лиц', duration: 'скоро' }
    ];

    return (
        <>
            <div className="video-guides">
                {videos.map((video) => (
                    <div 
                        key={video.id}
                        className={`video-item ${video.duration === 'скоро' ? 'coming-soon' : ''}`}
                        onClick={() => video.duration !== 'скоро' && setShowVideo(video.id)}
                    >
                        <div className="video-info">
                            <span className="video-title">{video.title}</span>
                            <span className="video-duration">{video.duration}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Модалка для просмотра видео */}
            {showVideo && (
                <div className="video-modal-overlay" onClick={() => setShowVideo(null)}>
                    <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="video-close" onClick={() => setShowVideo(null)}>×</button>
                        <video controls autoPlay className="video-player">
                            <source src={videos.find(v => v.id === showVideo)?.url} type="video/mp4" />
                            Ваш браузер не поддерживает видео
                        </video>
                    </div>
                </div>
            )}
        </>
    );
};

export default VideoGuides;