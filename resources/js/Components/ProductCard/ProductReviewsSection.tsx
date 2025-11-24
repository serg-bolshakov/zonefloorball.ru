// resources/js/Components/ProductCard/ProductReviewsSection.tsx
import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { IProductReportFromDB } from '@/Types/types';
import { getReviewsStatsFromReport } from '@/Utils/getReviewsStatsFromReport';
import { getRatingPercentage } from '@/Utils/getRatingPercentage';
import ReviewModal, { ReviewFormData } from '@/Components/Reviews/ReviewModal';
import { toast } from 'react-toastify';
import axios from 'axios';
import { IProductReview, IReviewUser, IReviewMedia, TSelectedMedia } from '@/Types/reviews';
import { pluralizeReviews, pluralize } from '@/Utils/pluralize';
import { formatServerDate } from '@/Utils/dateFormatter';

export interface IProductForReviews {
    id: number;
    title: string;
    productShowCaseImage?: {
        img_link: string;
    };
    productReport: IProductReportFromDB;
}

interface ProductReviewsSectionProps {
    product: IProductForReviews;
    recentApprovedReviews: IProductReview[];
    canReview: boolean; // Может ли текущий пользователь оставить отзыв
    userPendingReview?: { // Если у пользователя есть отзыв на модерации
        id: number;
        status: 'pending';
    };
    user: any; // Добавляем user как пропс
}

const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
    product,
    recentApprovedReviews,
    canReview,
    userPendingReview,
    user
}) => {
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [isSectionExpanded, setIsSectionExpanded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVoteSubmitting, setIsVoteSubmitting] = useState<number | null>(null);
    
    // Чтобы votedReviews сохранялось между перезагрузками страницы? простой вариант - хранить в состоянии компонента: const [votedReviews, setVotedReviews] = useState<Set<number>>(new Set());
    const [votedReviews, setVotedReviews] = useState<Set<number>>(() => {
        // Можно позже добавить восстановление из localStorage
        return new Set();
    });
    
    // ✅ ПОДНИМАЕМ СОСТОЯНИЕ ОТЗЫВОВ
    const [reviews, setReviews] = useState<IProductReview[]>(recentApprovedReviews);
    console.log('rev', reviews);

    // Деструктурируем для удобства
    const { id: productId, productReport, title, productShowCaseImage } = product;

    // Получаем статистику из productReport
    const reviewsStats = getReviewsStatsFromReport(productReport);
    // console.log('reviewsStats', reviewsStats);
    const { average_rating, total_reviews, rating_distribution } = reviewsStats;

    // Преобразуем average_rating в число на всякий случай
    const avgRating = typeof average_rating === 'string' 
        ? parseFloat(average_rating) 
        : average_rating;

    // Проверяем, есть ли вообще данные для показа
    const hasReviews = total_reviews > 0;
    
    // Обновляем статистику на основе актуальных отзывов
    const hasRecentApprovedReviews = reviews.length > 0;
    const canUserReview = user && canReview && !userPendingReview;

    // Если нет отзывов и пользователь не может оставить отзыв - скрываем секцию полностью
    if (!hasRecentApprovedReviews && !canUserReview) {
        return null;
    }

    // Функция для открытия модалки с отзывом
    const openReviewModal = () => {
        setIsModalOpen(true);
        console.log('Open review modal for product:', productId);
    };

    const closeReviewModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmitReview = async (reviewData: ReviewFormData) => {
        setIsSubmitting(true);

        try {
            console.log('Submitting review:', reviewData);
            // 1. Создаем отзыв
            const reviewResponse = await axios.post('/api/reviews', {
                product_id: product.id,
                rating: reviewData.rating,
                advantages: reviewData.advantages,
                disadvantages: reviewData.disadvantages, 
                comment: reviewData.comment,
            });

            if (!reviewResponse.data.success) {
                toast.error(reviewResponse.data.message || 'Ошибка при создании отзыва');
                throw new Error(reviewResponse.data.message || 'Ошибка при создании отзыва');
            }

            const reviewId = reviewResponse.data?.review?.id;

            if (!reviewId) {
                throw new Error('Не удалось получить ID созданного отзыва');
            }

            // 2. Загружаем медиа если есть
            if (reviewData.media.length > 0) {
                const formData = new FormData();
                reviewData.media.forEach(file => {
                    formData.append('media[]', file);
                });

                // Используем прямой axios для FormData
                const mediaResponse = await axios.post(
                    `/api/reviews/${reviewId}/media`,
                    formData,
                    {
                        // Все заголовки и токен в resources/js/bootstrap.js
                        //headers: {
                            // Для FormData НЕ указываем Content-Type!
                            // 'X-Requested-With': 'XMLHttpRequest',    // resources/js/bootstrap.js
                        //},
                    }
                );

                if (!mediaResponse.data.success) {
                    toast.error(mediaResponse.data.message || 'Ошибка при загрузке медиафайлов');
                    throw new Error(mediaResponse.data.message || 'Ошибка при загрузке медиафайлов');
                }
            }
            
            // УСПЕХ!Закрываем модальное окно:
            closeReviewModal();
        
            // Показываем сообщение об успехе
            toast.success('Отзыв успешно отправлен на модерацию! Спасибо!');

            // TODO: Обновить список отзывов или показать уведомление
            // Можно добавить callback для обновления родительского компонента
            // onReviewCreated?.();                                       
                
        } catch (error: any) {
            // Обрабатываем все ошибки в одном месте
            console.error('Error submitting review:', error);

            if (error.type === 'api') {
            switch (error.status) {
                case 413:
                    toast.error('Размер файлов слишком большой');
                    break;
                case 422:
                    // Ошибки валидации Laravel
                    const validationErrors = error.data?.errors;
                    if (validationErrors) {
                        const errorMessages = Object.values(validationErrors).flat();
                        alert(`Ошибки валидации:\n${errorMessages.join('\n')}`);
                    } else {
                        toast.error('Недопустимый формат файлов');
                    }
                    break;
                case 403:
                    toast.error('Недостаточно прав для выполнения этого действия');
                    break;
                case 500:
                    toast.error('Ошибка сервера при загрузке медиаконтента');
                    break;
                default:
                    toast.error(error.data?.message || 'Ошибка сервера');
            }
            } else {
                toast.error(error.message || 'Ошибка сети');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Функция для оценки "помогло/не помогло"
    const handleHelpfulClick = async (reviewId: number, isHelpful: boolean) => {
        if (votedReviews.has(reviewId)) {
            toast.info('Вы уже оценили этот отзыв');
            return;
        }
        
        if (isVoteSubmitting === reviewId) return; // Защита от двойного нажатия
        setIsVoteSubmitting(reviewId);

        // ✅ ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ - сразу показываем изменение
        const previousCount = recentApprovedReviews.find(r => r.id === reviewId)?.helpful_count || 0;
        updateReviewHelpfulCount(reviewId, previousCount + 1);

        try {
            const { data } = await axios.post<{
                success: boolean;
                message: string;
                helpful_count?: number;
            // }>('/api/reviews/mark-as-helpful', {
            }>(`/api/reviews/${reviewId}/helpful`, {    // URL теперь другой - роутинг поменяли
                reviewId,
                isHelpful,
            });

            if (!data.success) {
                throw new Error(data.message || 'Ошибка при оценке отзыва');
            }
        
            // Показываем сообщение об успехе
            toast.success('Спасибо за вашу оценку!');

            setVotedReviews(prev => new Set(prev).add(reviewId)); // ✅ Запоминаем голос

            // ✅ Синхронизируем с серверным значением (на случай расхождений)
            if (data.helpful_count !== undefined) {
                updateReviewHelpfulCount(reviewId, data.helpful_count);
            }

        } catch (error: any) {
            console.error('Error marking review as helpful:', error);

            // ✅ ОТКАТ ПРИ ОШИБКЕ - возвращаем предыдущее значение
            updateReviewHelpfulCount(reviewId, previousCount);
            
            // Более безопасное извлечение сообщения об ошибке
            const errorMessage = error.response?.data?.message 
                || error.message 
                || 'Произошла ошибка при оценке отзыва';
                
            toast.error(errorMessage);
        } finally {
            setIsVoteSubmitting(null); // Снимаем блокировку в любом случае
        }
    };

    // Вспомогательная функция для обновления UI
    const updateReviewHelpfulCount = (reviewId: number, newCount: number) => {
        setReviews(prevReviews => 
            prevReviews.map(review => 
                review.id === reviewId 
                    ? { ...review, helpful_count: newCount }
                    : review
            )
        );
    };

    const toggleSection = () => {
        setIsSectionExpanded(!isSectionExpanded);
    };

    // Компактный заголовок для свернутого состояния
    const CompactHeader = () => (
        <div 
            className="reviews-compact-header d-flex flex-sb aline-items-center"
            onClick={toggleSection}
            style={{ cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}
        >
            <div className="d-flex aline-items-center gap-12">
                <h3 className="text-lg font-bold text-gray-900 margin-tb4px">
                    Отзывы покупателей
                </h3>
                {hasReviews && (
                    <>
                        <div className="d-flex aline-items-center">
                            <span className="text-xl font-bold text-yellow-600 mr-2">
                                {!isNaN(avgRating) ? avgRating.toFixed(1) : '0.0'}
                            </span>
                            <div className="d-flex">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className={`fs14 ${
                                            i < Math.floor(avgRating || 0)
                                                ? 'text-yellow-400'
                                                : 'text-gray-300'
                                        }`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-blue-600 fs12">
                            {/* {total_reviews} отзывов */}
                            {pluralize(total_reviews, ['отзыв', 'отзыва', 'отзывов'])}
                        </span>
                    </>
                )}
            </div>
            
            <div className="d-flex aline-items-center gap-8">
                {canUserReview && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('!!!!!');
                            openReviewModal();
                        }}
                        className="reviews-btn reviews-btn-primary fs12"
                        style={{ padding: '4px 12px' }}
                    >
                        Написать отзыв
                    </button>
                )}
                
                {userPendingReview && (
                    <div className="fs10 text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        ⏳ На модерации
                    </div>
                )}
                
                <span className="text-gray-400 fs18">
                    {isSectionExpanded ? '▲' : '▼'}
                </span>
            </div>
        </div>
    );

    return (
        <>
            {/* Секция отзывов */}
            <section className="product-reviews-section">
                {/* Компактный заголовок - всегда виден */}
                <CompactHeader />
                
                {/* Расширенный контент - только когда expanded */}
                {isSectionExpanded && (
                    <div className="reviews-expanded-content" style={{ paddingTop: '16px' }}>
                        {/* Блок статистики - показываем только если есть отзывы */}
                        {hasReviews && (
                            <div className="reviews-stats mb-6">
                                {/* Распределение рейтингов */}
                                <div className="rating-distribution">
                                    {[5, 4, 3, 2, 1].map((rating) => {
                                        const count = rating_distribution[rating as keyof typeof rating_distribution];
                                        const percentage = getRatingPercentage(rating, productReport);
                                        
                                        return (
                                            <div key={rating} className="rating-distribution__item">
                                                <span className="fs12 text-gray-600 w-20px text-align-center">{rating}</span>
                                                <span className="text-yellow-400">★</span>
                                                <div className="rating-distribution__bar">
                                                    <div 
                                                        className="rating-distribution__fill" 
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <span className="rating-distribution__count">
                                                    {count}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {/* Дополнительная статистика */}
                                <div className="fs12 text-gray-600 space-y-2">
                                    <div>✅ {reviews.length} {pluralizeReviews(reviews.length)}</div>
                                    <div>📷 {reviewsStats.reviews_with_media} с фото/видео</div>
                                    {/* <div>💬 {reviews.length} недавних отзывов</div> */}
                                </div>
                            </div>
                        )}

                        {/* Список отзывов или пустое состояние */}
                        <div className="space-y-6">
                            {!hasRecentApprovedReviews && !hasReviews ? (
                                <div className="reviews-empty-state">
                                    <div className="reviews-empty-state__icon">💬</div>
                                    <p className="text-lg mb-2">Пока нет отзывов</p>
                                    <p className="fs12">Будьте первым, кто оставит отзыв об этом товаре!</p>
                                    {canUserReview && (
                                        <button
                                            onClick={openReviewModal}
                                            className="reviews-btn reviews-btn-primary mt-4"
                                        >
                                            Написать первый отзыв
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {reviews.slice(0, showAllReviews ? reviews.length : 3).map((review) => (
                                        <ReviewCard 
                                            key={review.id}
                                            review={review}
                                            onHelpfulClick={handleHelpfulClick}
                                            isVoteSubmitting={isVoteSubmitting}
                                        />
                                    ))}
                                    
                                    {/* Кнопка "Показать все" */}
                                    {reviews.length > 3 && !showAllReviews && (
                                        <div className="text-align-center mt-6">
                                            <button
                                                onClick={() => setShowAllReviews(true)}
                                                className="text-blue-600 hover-text-blue-800 font-medium"
                                            >
                                                Показать все {reviews.length} отзывов
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {/* Добавляем модалку - всегда доступна! */}
            <ReviewModal
                isOpen={isModalOpen}
                onClose={closeReviewModal}
                onSubmit={handleSubmitReview}
                product={product}
                isSubmitting={isSubmitting}
            />
        </>
    );
};


// Компонент карточки отзыва
const ReviewCard: React.FC<{
    review: IProductReview;
    onHelpfulClick: (reviewId: number, isHelpful: boolean) => void;
    isVoteSubmitting: number | null;
}> = ({ review, onHelpfulClick, isVoteSubmitting }) => {
    const [showFullComment, setShowFullComment] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<TSelectedMedia>(null);
    const commentPreview = review.comment.length > 150 
        ? review.comment.substring(0, 150) + '...' 
        : review.comment;

    return (
        <div className="review-card">
            {/* Заголовок отзыва */}
            <div className="review-card__header">
                <div className="review-card__user">
                    <div className="review-card__avatar">
                        {review.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="review-card__info">
                        <div className="fs12px margin-bottom4px text-gray-700">Дата покупки: {formatServerDate(review.purchase_date)} </div>
                        <div className="font-medium  margin-bottom4px">{review.user.name}</div>
                        <div className="review-card__meta">
                            <div className="review-card__rating">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className={`${
                                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <time className="fs12">{new Date(review.created_at).toLocaleDateString('ru-RU')}</time>
                            {review.is_verified && (
                                <span className="text-green-600" title="Проверенная покупка">✓</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Преимущества/Недостатки */}
            {(review.advantages || review.disadvantages) && (
                <div className="review-card__pros-cons">
                    {review.advantages && (
                        <div className="review-card__pros">
                            <strong>Достоинства:</strong> {review.advantages}
                        </div>
                    )}
                    {review.disadvantages && (
                        <div className="review-card__cons">
                            <strong>Недостатки:</strong> {review.disadvantages}
                        </div>
                    )}
                </div>
            )}

            {/* Комментарий */}
            <div className="mb-4">
                <p className="review-card__comment">
                    {showFullComment ? review.comment : commentPreview}
                </p>
                {review.comment.length > 150 && (
                    <button
                        onClick={() => setShowFullComment(!showFullComment)}
                        className="text-blue-600 fs12 mt-2"
                    >
                        {showFullComment ? 'Свернуть' : 'Читать полностью'}
                    </button>
                )}
            </div>

            {/* Медиафайлы */}
            {review.media.length > 0 && (
                <div className="review-card__media">
                    {review.media.map((media) => (
                        <div key={media.id} className={`review-card__media-item ${media.type === 'video' ? 'review-card__media-item--video' : ''}`}>
                            {media.type === 'image' ? (
                                <img 
                                    src={`/storage/reviews/${media.file_path}`}
                                    alt="Фото отзыва"
                                    className="review-card__media-image"
                                    onClick={() => setSelectedMedia(media)}
                                    loading="lazy"
                                />
                            ) : (
                                <div 
                                    className="review-card__video-wrapper"
                                    onClick={() => setSelectedMedia(media)}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`Посмотреть видео отзыва ${review.user.name}`}
                                >
                                    <video 
                                        controls
                                        // poster={media.thumbnail_url}
                                        className="review-card__media-video"   
                                        preload="metadata"
                                    >
                                        <source 
                                            src={`/storage/reviews/${media.file_path}`}
                                            type="video/mp4" 
                                        />
                                        Ваш браузер не поддерживает встроенные видео
                                    </video>
                                    <div className="review-card__video-play-btn">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Модальное окно для просмотра */}
            {selectedMedia && (
                <div className="media-modal" onClick={() => setSelectedMedia(null)}>
                    <div className="media-modal__content" onClick={(e) => e.stopPropagation()}>
                        {selectedMedia.type === 'image' ? (
                            <img 
                                src={`/storage/reviews/${selectedMedia.file_path}`}
                                alt="Фото отзыва"
                                className="media-modal__image"
                            />
                        ) : (
                            <video 
                                controls
                                autoPlay
                                className="media-modal__video"
                            >
                                <source src={`/storage/reviews/${selectedMedia.file_path}`} type="video/mp4" />
                            </video>
                        )}
                        <button 
                            className="media-modal__close"
                            onClick={() => setSelectedMedia(null)}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Кнопка "Помогло" */}
            <div className="review-card__footer">
                <button
                    onClick={() => onHelpfulClick(review.id, !review.is_helpful)}
                    disabled={isVoteSubmitting === review.id}
                    className={`review-card__helpful-btn ${
                        review.is_helpful 
                            ? 'review-card__helpful-btn--active' 
                            : ''
                    }`}
                >
                    <span>
                        {isVoteSubmitting === review.id ? '...' : `👍 Спасибо за отзыв (${review.helpful_count})`}
                    </span>
                    
                </button>
                
                {review.is_verified && (
                    <span className="review-card__verified-badge">
                        Проверенная покупка
                    </span>
                )}
            </div>
        </div>  
    );
};

export default ProductReviewsSection;