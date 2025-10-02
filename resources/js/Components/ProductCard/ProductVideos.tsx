// resources/js/Components/ProductCard/ProductVideos.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { LazyLoadImage } from 'react-lazy-load-image-component';

interface PropVideo {
    id: number;
    comment: string | null;
    link: string | null;
    poster: string;
    duration: number;
    source_type: 'vk' | 'hosted';
    file_path: string | null;
}

interface ProductVideoProps {
    videos: PropVideo[] | null;
}

const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ProductVideos: React.FC<ProductVideoProps> = ({ videos }) => {
  return (
    <section className="product-video-section">
        {videos && videos.length > 0 && (
            <>
                 <h3>Видеообзоры</h3>
                <div className="cardProduct-imgPromo">
                    {/* {videos.map(video => (
                        <motion.div 
                            key={video.link} 
                            whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                            whileTap={{ scale: 0.95, rotate: [0, 15, -15, 0] }}
                        >
                            <iframe
                                src={video.link}
                                title={(video.comment && video.comment != null) ? video.comment : ''}
                                // frameBorder="0" - устарел
                                allowFullScreen
                                >
                            </iframe>
                        </motion.div>
                    ))} */}

                    {/* {videos.map(video => (
                        <motion.a 
                            href={video.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            key={video.link} 
                            className="video-link-card"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {video.comment && <span>{video.comment}</span>}
                            <LazyLoadImage
                                src={`/storage/${video.poster}`}
                                alt={`${video.link})`}
                                className="cursor-pointer margin-tb8px"
                                effect="opacity"
                                threshold={500}
                            />
                        </motion.a>
                    ))} */}

                    {/* {videos.map(video => (
                        <motion.a 
                            href={video.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            key={video.id} 
                            className="video-link-card"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="video-thumbnail">
                                <LazyLoadImage
                                    src={`/storage/${video.poster}`}
                                    alt={`${video.comment || 'Видеообзор'}`}
                                    className="cursor-pointer margin-tb8px"
                                    effect="opacity"
                                    threshold={500}
                                />
                                {video.duration && (
                                    <span className="video-duration-badge">
                                        {formatDuration(video.duration)}
                                    </span>
                                )}
                            </div>
                            {video.comment && (
                                <span className="video-comment">{video.comment}</span>
                            )}
                        </motion.a>
                    ))} */}

                    {videos.map(video => (
                        <div key={video.id} className="video-item">
                            {video.source_type === 'vk' && video.link ? (
                                // VK видео - ссылка
                                <motion.a 
                                    href={video.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="video-link-card"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div className="video-thumbnail">
                                        <LazyLoadImage
                                            src={`/storage/${video.poster}`}
                                            alt={video.comment || 'Видео на VK'}
                                            effect="opacity"
                                            threshold={500}
                                        />
                                        <span className="video-duration-badge">
                                            {formatDuration(video.duration)}
                                        </span>
                                        <div className="video-platform-indicator">Просмотр на VK Видео</div>
                                    </div>
                                    {video.comment && (
                                        <span className="video-comment">{video.comment}</span>
                                    )}
                                </motion.a>
                            ) : (
                                // Локальное видео - HTML5 video
                                <motion.div 
                                    className="video-link-card"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div className="video-thumbnail  margin-bottom8px">
                                        <video
                                            controls
                                            poster={`/storage/${video.poster}`}
                                            className="hosted-video-player"
                                        >
                                            <source 
                                                src={`/storage/${video.file_path}`} 
                                                type="video/mp4" 
                                            />
                                            Ваш браузер не поддерживает встроенные видео
                                        </video>
                                        <span className="video-duration-badge">
                                            {formatDuration(video.duration)}
                                        </span>
                                    </div>
                                    {video.comment && (
                                        <span className="video-comment">{video.comment}</span>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    ))} 
                </div> 
            </>
        )}
    </section>
  );
};

export default ProductVideos;
              
       