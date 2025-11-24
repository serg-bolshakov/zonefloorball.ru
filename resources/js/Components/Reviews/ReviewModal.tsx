// resources/js/Components/Reviews/ReviewModal.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IProductForReviews } from '../ProductCard/ProductReviewsSection';
import { useDragAndDrop } from '@/Hooks/useDragAndDrop';
import DragAndDropZone from '../Common/DragAndDropZone';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reviewData: ReviewFormData) => void;
    product: IProductForReviews;
    isSubmitting?: boolean;
}

export interface ReviewFormData {
    rating: number;
    advantages?: string;
    disadvantages?: string;
    comment: string;
    media: File[];
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit, product, isSubmitting = false }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [advantages, setAdvantages] = useState('');
    const [disadvantages, setDisadvantages] = useState('');
    const [comment, setComment] = useState('');
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);

    // console.log('product in Modal', product);
    
    // Используем локальное состояние только для UI
    const [localIsSubmitting, setLocalIsSubmitting] = useState(false);

    // Синхронизируем с пропсом
    useEffect(() => {
        setLocalIsSubmitting(isSubmitting);
    }, [isSubmitting]);

    // Используем наш хук Drag & Drop
    const {
        isDragging,
        dragError,
        fileInputRef,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        handleFileInputChange,
        openFileDialog,
    } = useDragAndDrop({
        onFilesSelect: (files) => {
            setMediaFiles(prev => [...prev, ...files]);
        },
        maxFiles: 5,
        maxSize: 50 * 1024 * 1024,
        acceptedTypes: ['image/*', 'video/*']
    });
    
    // console.log('product', product);
    
    // Обработчик Escape для закрытия
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Блокировка скролла при открытой модалке
    useEffect(() => {
        if (isOpen) {
            // Блокируем скролл при открытии
            document.body.style.overflow = 'hidden';
        } else {
            // Восстанавливаем скролл и сбрасываем форму при закрытии
            document.body.style.overflow = '';
            
            // Сброс формы при закрытии модалки
            resetForm();
        }

        // Cleanup функция
        return () => {
            document.body.style.overflow = '';
        };

    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (rating === 0) {
            alert('Пожалуйста, поставьте оценку');
            return;
        }

        if (comment.trim().length < 10) {
            alert('Комментарий должен содержать минимум 10 символов');
            return;
        }

        // Вызываем колбэк из родителя
        onSubmit({
            rating,
            advantages: advantages.trim() || undefined,
            disadvantages: disadvantages.trim() || undefined,
            comment: comment.trim(),
            media: mediaFiles,
        });
    };

    const resetForm = () => {
        setRating(0);
        setAdvantages('');
        setDisadvantages('');
        setComment('');
        setMediaFiles([]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        // Проверяем лимит файлов
        if (mediaFiles.length + files.length > 5) {
            alert('Можно загрузить не более 5 файлов');
            return;
        }

        // Проверяем типы и размеры файлов. Валидация файлов:
        const validFiles = files.filter(file => {
            const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
            const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB
            
            if (!isValidType) {
                alert(`Файл ${file.name} должен быть изображением или видео`);
                return false;
            }
            
            if (!isValidSize) {
                alert(`Файл ${file.name} слишком большой (максимум 50MB)`);
                return false;
            }
            
            return true;
        });

        // Сразу добавляем файлы для preview
        setMediaFiles(prev => [...prev, ...validFiles]);

        // Сбрасываем input чтобы можно было выбрать те же файлы снова
        e.target.value = '';

    };

    // Функция для предпросмотра видео
    const getVideoPreview = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.currentTime = 1; // Берем кадр на 1 секунде
            
            video.onloadeddata = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                resolve(canvas.toDataURL());
            };
            
            video.onerror = () => {
                resolve(''); // Fallback если не удалось получить превью
            };
        });
    };

    const removeFile = (index: number) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        // Закрываем только если кликнули именно на оверлей (фон)
        // а не на саму модалку или её содержимое
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // console.log('isOpen', isOpen);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="review-modal-overlay"
                onClick={handleOverlayClick}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="review-modal"
                    onClick={(e) => e.stopPropagation()} // ← Не даем клику всплыть до оверлея... Лишнее?
                >
                    {/* Заголовок */}
                    <div className="modal-header">
                        <h2 className="modal-title">Оставить отзыв</h2>
                        <button
                            type="button"
                            className="review-modal-close"
                            onClick={onClose}
                            aria-label="Закрыть"
                        >
                            &times;
                        </button>
                    </div>

                    {/* Информация о товаре */}
                    <div className="product-info">
                        {product.productShowCaseImage && (
                            <img
                                src={`/storage/${product.productShowCaseImage.img_link}`}
                                alt={product.title}
                                className="product-image"
                            />
                        )}
                        <div className="product-details">
                            <h3 className="product-title">{product.title}</h3>
                            <p className="product-hint">Расскажите о вашем опыте использования</p>
                        </div>
                    </div>

                    {/* Форма */}
                    <form onSubmit={handleSubmit} className="review-form">
                        {/* Рейтинг */}
                        <div className="review-form-group">
                            <label className="review-form-label">Ваша оценка *</label>
                            <div className="rating-stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`star-button ${
                                            star <= (hoverRating || rating) ? 'active-star' : ''
                                        }`}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                            <div className="rating-labels">
                                <span>Плохо</span>
                                <span>Отлично</span>
                            </div>
                        </div>

                        {/* Достоинства */}
                        <div className="review-form-group">
                            <label className="review-form-label">Достоинства</label>
                            <textarea
                                value={advantages}
                                onChange={(e) => setAdvantages(e.target.value)}
                                placeholder="Что вам понравилось в товаре?"
                                className="form-textarea"
                                rows={3}
                                maxLength={500}
                            />
                            <div className="char-counter">
                                {advantages.length}/500
                            </div>
                        </div>

                        {/* Недостатки */}
                        <div className="review-form-group">
                            <label className="review-form-label">Недостатки</label>
                            <textarea
                                value={disadvantages}
                                onChange={(e) => setDisadvantages(e.target.value)}
                                placeholder="Что можно улучшить?"
                                className="form-textarea"
                                rows={3}
                                maxLength={500}
                            />
                            <div className="char-counter">
                                {disadvantages.length}/500
                            </div>
                        </div>

                        {/* Комментарий - вариант с визуальным прогрессом */}
                        <div className="review-form-group">
                            <label className="review-form-label">Комментарий *</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder={
                                    comment.length > 0 && comment.length < 10 
                                        ? `Опишите подробнее... осталось ${10 - comment.length} символов` 
                                        : "Расскажите о качестве товара, удобстве использования, преимуществах и недостатках..."
                                }
                                className={`form-textarea ${
                                    comment.length > 0 && comment.length < 10 ? 'form-textarea--warning' : ''
                                }`}
                                rows={4}
                                required
                                minLength={10}
                                maxLength={2000}
                            />

                            {/* Progress bar */}
                            <div className="comment-progress">
                                <div 
                                    className={`comment-progress__fill ${
                                        comment.length < 10 
                                            ? 'comment-progress__fill--warning'
                                            : comment.length < 500
                                            ? 'comment-progress__fill--good'
                                            : 'comment-progress__fill--excellent'
                                    }`}
                                    style={{ 
                                        width: `${Math.min((comment.length / 10) * 100, 100)}%`,
                                        maxWidth: '100%'
                                    }}
                                />
                            </div>
                            
                            {/* Счетчик */}
                            <div className={`char-counter ${
                                comment.length > 0 && comment.length < 10 ? 'char-counter--warning' : ''
                            }`}>
                                {comment.length < 10 ? (
                                    <span style={{ color: '#e53e3e', fontWeight: '600' }}>
                                        ⚠️ Слишком коротко! Нужно ещё {10 - comment.length} символов
                                    </span>
                                ) : comment.length < 50 ? (
                                    <span style={{ color: '#38a169' }}>
                                        ✅ Минимум достигнут! Можно добавить больше деталей...
                                    </span>
                                ) : (
                                    <span style={{ 
                                        color: comment.length > 1500 ? '#dd6b20' : '#718096',
                                        fontWeight: comment.length > 1500 ? '600' : 'normal'
                                    }}>
                                        {comment.length < 500 ? '📝 Хороший отзыв!' : '📚 Отличный подробный отзыв!'} ({comment.length}/2000)
                                    </span>
                                )}
                            </div>

                            {comment.length === 0 && (
                                <div className="comment-hints recommendation">
                                    <p className="hint-title">💡 Примеры хороших комментариев:</p>
                                    <ul className="hint-list">
                                        <li className='auto-comment-hint'>"Товар отличного качества, удобно лежит в руке"</li>
                                        <li className='auto-comment-hint'>"Быстрая доставка, хорошая упаковка, соответствует фото"</li>
                                        <li className='auto-comment-hint'>"Недостаток: немного тяжеловат, но это компенсируется качеством"</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Загрузка медиа */}
                        <div className="review-form-group">
                            {/* <label className="review-form-label">Фото и видео</label>
                            <div className="media-upload">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={handleFileSelect}
                                    className="media-input"
                                    id="media-upload"
                                />
                                <label htmlFor="media-upload" className="upload-button">
                                    <span className="upload-icon">📁</span>
                                    <span>Выбрать файлы</span>
                                </label>
                                <span className="upload-hint">
                                    До 5 файлов, не более 50MB каждый
                                </span>
                            </div> */}

                            {/* Преview загруженных файлов */}
                            {/* {mediaFiles.length > 0 && (
                                <div className="media-preview">
                                    <h4 className="preview-title">Выбранные файлы:</h4>
                                    <div className="preview-grid">
                                        {mediaFiles.map((file, index) => (
                                            <div key={index} className="preview-item">
                                                {file.type.startsWith('image/') ? (
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`Preview ${index + 1}`}
                                                        className="preview-image"
                                                    />
                                                ) : (
                                                    <div className="preview-video">
                                                        <span className="video-icon">🎥</span>
                                                        <span className="video-name">
                                                            {file.name}
                                                        </span>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    className="remove-file"
                                                    onClick={() => removeFile(index)}
                                                    aria-label="Удалить файл"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )} */}
                        </div>

                        {/* Загрузка медиа через Drag & Drop */}
                        <div className="review-form-group">
                            <label className="review-form-label">Фото и видео</label>
                            
                            {/* Скрытый input для выбора файлов */}
                            <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={handleFileInputChange}
                                ref={fileInputRef}
                                className="media-input"
                                id="media-upload"
                            />

                            {/* Drag & Drop зона */}
                            <DragAndDropZone
                                isDragging={isDragging}
                                dragError={dragError}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={openFileDialog}
                                maxFiles={5}
                                maxSize={50}
                            />

                            {/* Преview загруженных файлов */}
                            {mediaFiles.length > 0 && (
                                <div className="media-preview">
                                    <h4 className="preview-title">
                                        Выбрано файлов: {mediaFiles.length}/5
                                    </h4>
                                    <div className="preview-grid">
                                        {mediaFiles.map((file, index) => (
                                            <div key={index} className="preview-item">
                                                {file.type.startsWith('image/') ? (
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`Preview ${index + 1}`}
                                                        className="preview-image"
                                                    />
                                                ) : (
                                                    <div className="preview-video">
                                                        <span className="video-icon">🎥</span>
                                                        <span className="video-name">
                                                            {file.name}
                                                        </span>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    className="remove-file"
                                                    onClick={() => removeFile(index)}
                                                    aria-label="Удалить файл"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* Кнопки */}
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={onClose}
                                className="review-btn review-btn-secondary"
                                disabled={localIsSubmitting}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="review-btn review-btn-primary"
                                disabled={localIsSubmitting || rating === 0 || comment.trim().length < 10}
                            >
                                {localIsSubmitting ? 'Отправка...' : 'Опубликовать отзыв'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ReviewModal;