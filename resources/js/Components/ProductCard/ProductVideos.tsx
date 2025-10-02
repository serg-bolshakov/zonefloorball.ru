// resources/js/Components/ProductCard/ProductVideos.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { LazyLoadImage } from 'react-lazy-load-image-component';

interface PropVideo {
    comment: string | null;
    link: string;
    poster: string;
    duration: number;
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
                <h3>Смотреть на VK</h3>
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

                    {videos.map(video => (
                        <motion.a 
                            href={video.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            key={video.link} 
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
                    ))}
                </div> 
            </>
        )}
    </section>
  );
};

export default ProductVideos;
              
       