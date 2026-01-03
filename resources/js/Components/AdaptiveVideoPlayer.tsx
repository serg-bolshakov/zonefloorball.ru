// components/AdaptiveVideoPlayer.tsx
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface AdaptiveVideoPlayerProps {
    video: {
        file_path: string;
        poster: string;
        orientation?: 'portrait' | 'landscape' | 'square';
        title: string;
    };
    autoPlay?: boolean;
    controls?: boolean;
    className?: string;
}

// Форматирование времени
const formatDuration = (seconds: string): string => {
    const secs = parseInt(seconds);
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
};

const AdaptiveVideoPlayer: React.FC<AdaptiveVideoPlayerProps> = ({
    video,
    autoPlay = false,
    controls = true,
    className = ''
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'square'>(
        video.orientation || 'landscape'
    );

    // Определяем ориентацию при загрузке видео
    useEffect(() => {
        if (videoRef.current) {
            const videoEl = videoRef.current;
            
            const handleLoadedMetadata = () => {
                if (videoEl.videoWidth && videoEl.videoHeight) {
                    const ratio = videoEl.videoWidth / videoEl.videoHeight;
                    
                    let newOrientation: 'portrait' | 'landscape' | 'square';
                    if (ratio > 1.25) newOrientation = 'landscape';
                    else if (ratio < 0.8) newOrientation = 'portrait';
                    else newOrientation = 'square';
                    
                    setOrientation(newOrientation);
                    setDimensions({
                        width: videoEl.videoWidth,
                        height: videoEl.videoHeight
                    });
                }
            };
            
            videoEl.addEventListener('loadedmetadata', handleLoadedMetadata);
            
            // Если видео уже загружено
            if (videoEl.readyState >= 1) {
                handleLoadedMetadata();
            }
            
            return () => {
                videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
        }
    }, [video.file_path]);

    return (
        <div className={`adaptive-video-container ${orientation} ${className}`}>
            <motion.div 
                className="video-wrapper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <video
                    ref={videoRef}
                    controls={controls}
                    autoPlay={autoPlay}
                    preload="metadata"
                    poster={video.poster}
                    className="adaptive-video-player"
                    playsInline
                >
                    <source src={video.file_path} type="video/mp4" />
                    <source src={video.file_path} type="video/quicktime" />
                    Ваш браузер не поддерживает видео
                </video>

                {/* <span className="video-duration-badge">
                    {formatDuration(video.duration)}
                </span> */}
                
                {/* Индикатор ориентации (для дебага) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="orientation-badge">
                        {orientation} {dimensions.width}x{dimensions.height}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AdaptiveVideoPlayer;