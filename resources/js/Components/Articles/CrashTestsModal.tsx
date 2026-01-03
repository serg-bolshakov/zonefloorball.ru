// resources/js/Components/Articles/CrashTestsModal.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import AdaptiveVideoPlayer from '../AdaptiveVideoPlayer';

interface VideoItem {
    id?: number;
    title: string;
    description: string;
    duration: string;
    poster: string;                 // Путь к миниатюре
    file_path: string;              // Путь к видео файлу
    source_type?: 'local' | 'vk';
    comment?: string;
    product_link?: string;          // Ссылка на товар
    product_name?: string;          // Название модели (для текста)
    product_id?: string;            // ID товара
    orientation?: 'portrait' | 'landscape' | 'square'; 
    width?: number;
    height?: number;
}

interface ICrashTestsModalProps {
    videos: VideoItem[];
}

// Форматирование времени
const formatDuration = (seconds: string): string => {
    const secs = parseInt(seconds);
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
};


const CrashTestsModal: React.FC<ICrashTestsModalProps> = ({ videos }) => {
    
    // Группируем видео по ориентации для разного отображения
    const portraitVideos = videos.filter(v => v.orientation === 'portrait');
    const landscapeVideos = videos.filter(v => v.orientation !== 'portrait');

    return (
        <div className="crash-tests-modal">
            {/* <h2>Испытания продукции</h2>
            <p className="modal-subtitle">
                Все клюшки проходят жесткие тесты. Мы играем на бетоне, 
                создаем экстремальные нагрузки, чтобы убедиться в качестве.
            </p> */}

            <h2>Испытания продукции в экстремальных условиях</h2>
            <p className="modal-subtitle">
                {/* Мы тестируем каждую партию клюшек на прочность, играя на бетоне 
                и создавая нагрузки, превышающие обычные игровые в 3-5 раз. */}

                Мы тестируем каждую партию клюшек, чтобы вы получили продукт высшего качества
            </p>
            
            {/* <div className="video-grid-crash">
                {videos.map((video, index) => (
                    <div key={index} className="video-item-crash">
                        <motion.div 
                            className="video-link-card-crash"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="video-thumbnail margin-bottom8px">
                                <video
                                    controls
                                    preload="metadata"
                                    poster={video.poster}
                                    // className="hosted-video-player"
                                    className='video-player'
                                >
                                    <source 
                                        src={video.file_path} 
                                        type="video/mp4" 
                                    />
                                   
                                    <source 
                                        src={video.file_path} 
                                        type="video/quicktime" 
                                    />
                                    Ваш браузер не поддерживает видео
                                </video>
                                <span className="video-duration-badge">
                                    {formatDuration(video.duration)}
                                </span>
                            </div>
                            
                            <div className="video-info-crash">
                                <h4>{video.title}</h4>
                                <p>{video.description}</p>
                                {video.comment && (
                                    <div className="video-comment-crash">
                                        💬 {video.comment}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div> */}
            
            <div className="quality-notice">
                <h3>Почему клюшки ломаются?</h3>
                <ul>
                    <li>✅ Нарушение правил игры (удары по клюшкам запрещены)</li>
                    <li>✅ Экстремальные условия эксплуатации</li>
                    <li>✅ Индивидуальная манера игры</li>
                </ul>
                <p className="notice-text">
                    <strong>Совет от экспертов:</strong> Соблюдение правил флорбола 
                    и бережное отношение — залог долгой службы клюшки.
                </p>
            </div>


            <div className="quality-notice">
                <h3>Наша философия качества</h3>
                <p>
                    Мы показываем реальные тесты, потому что уверены в нашем продукте. 
                    Клюшки ломаются только при экстремальных нагрузках, значительно 
                    превышающих нормальные игровые условия.
                </p>
                <ul>
                    <li>✅ <strong>Тест на излом:</strong> 90 кг нагрузки без разрушения рукоятки</li>
                    <li>✅ <strong>Ударная прочность:</strong> 1000+ ударов по клюшке</li>
                    <li>✅ <strong>Холодостойкость:</strong> -20°C без потери свойств</li>
                </ul>
                
                <div className="expert-advice">
                    <div className="advice-icon">💡</div>
                    <div className="advice-content">
                        <strong>Совет от наших тестировщиков:</strong>
                        <p>Клюшка прослужит годы при соблюдении правил флорбола. 
                        Избегайте ударов по клюшкам и резких перепадов температур.</p>
                    </div>
                </div>
            </div>
            
            <div className="warranty-disclaimer">
                <span className="disclaimer-icon">⚠️</span>
                <span>
                    <strong>Важно:</strong> Гарантийный срок не установлен, так как срок службы 
                    зависит исключительно от условий эксплуатации и соблюдения правил игры.
                </span>
            </div>

            {/* Портретные видео - выводим отдельно с указанием ориентации */}
            {portraitVideos.length > 0 && (
                <div className="portrait-videos-section">
                    {/* <h3 className="section-title">Портретные видео (вертикальные)</h3> */}
                    <div className="portrait-videos-grid">
                        {portraitVideos.map((video, index) => (
                            <motion.div 
                                key={index}
                                className="video-card portrait"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <AdaptiveVideoPlayer 
                                    video={video}
                                    controls={true}
                                    className="portrait-video-player"
                                />
                                <div className="video-info">
                                    <h4>{video.title}</h4>
                                    <p>{video.description}</p>
                                    {video.comment && (
                                        <div className="video-comment">
                                            <span className="comment-icon">💬</span>
                                            {video.comment}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Альбомные и квадратные видео */}
            {landscapeVideos.length > 0 && (
                <div className="landscape-videos-section">
                    {/* {portraitVideos.length > 0 && (
                        <h3 className="section-title">Альбомные видео</h3>
                    )} */}
                    <div className="video-grid-crash">
                        {landscapeVideos.map((video, index) => (
                            <div key={index} className="video-item-crash">
                                <motion.div 
                                    className={`video-link-card-crash ${
                                        video.orientation === 'portrait' ? 'portrait-video' : ''
                                    }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <AdaptiveVideoPlayer 
                                        video={video}
                                        controls={true}
                                    />
                                    <div className="video-info-crash">
                                        <h4>{video.title}</h4>
                                        <p>{video.description}</p>
                                        {video.comment && (
                                            <div className="video-comment-crash">
                                                💬 {video.comment}
                                            </div>
                                        )}
                                    </div>

                                     {/* Ссылка на товар - НОВЫЙ БЛОК */}
                                    {video.product_link && video.product_name && (
                                        <div className="product-link-section">
                                            <div className="product-link-header">
                                                <span className="product-icon">🏒</span>
                                                <span>Тестируемая модель:</span>
                                            </div>
                                            <a 
                                                href={video.product_link}
                                                className="product-link"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => {
                                                    // Аналитика клика
                                                    // if (window.gtag) {
                                                    //     window.gtag('event', 'click_product_from_crashtest', {
                                                    //         'product_id': video.product_id,
                                                    //         'product_name': video.product_name,
                                                    //         'video_title': video.title
                                                    //     });
                                                    // }
                                                }}
                                            >
                                                {video.product_name}
                                                <span className="link-arrow">→</span>
                                            </a>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Информационный блок */}
            <div className="video-orientation-info">
                <div className="info-icon">📱</div>
                <div className="info-content">
                    <strong>Обратите внимание:</strong> Часть видео снята в портретной ориентации, 
                    так как тесты проводятся в вертикальной плоскости. Мы показываем видео без 
                    обрезки, чтобы вы видели полную картину испытаний.
                </div>
            </div>

        </div>
    );
};

export default CrashTestsModal;