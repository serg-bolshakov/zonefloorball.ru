// resources/js/Components/ProductCard/ProductReviewsSection.tsx
import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { IProductReportFromDB } from '@/Types/types';
import { getReviewsStatsFromReport } from '@/Utils/getReviewsStatsFromReport';
import { getRatingPercentage } from '@/Utils/getRatingPercentage';

// Типы данных
interface ReviewUser {
    id: number;
    name: string;
    avatar?: string;
}

interface ReviewMedia {
    id: number;
    file_path: string;
    type: 'image' | 'video';
    thumbnail_url?: string;
}

interface ProductReview {
    id: number;
    user: ReviewUser;
    rating: number;
    advantages?: string;
    disadvantages?: string;
    comment: string;
    created_at: string;
    is_verified: boolean;
    media: ReviewMedia[];
    helpful_count: number;
    is_helpful?: boolean;
}

interface ProductReviewsSectionProps {
    productId: number;
    productReport: IProductReportFromDB; // Принимаем весь productReport
    recentReviews: ProductReview[];
    canReview: boolean; // Может ли текущий пользователь оставить отзыв
    userPendingReview?: { // Если у пользователя есть отзыв на модерации
        id: number;
        status: 'pending';
    };
}

const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
    productId,
    productReport,
    recentReviews,
    canReview,
    userPendingReview
}) => {
    const { user } = usePage().props as any;
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [isSectionExpanded, setIsSectionExpanded] = useState(false);

    // Получаем статистику из productReport
    const reviewsStats = getReviewsStatsFromReport(productReport);
    const { average_rating, total_reviews, rating_distribution } = reviewsStats;

    // Проверяем, есть ли вообще данные для показа
    const hasReviews = total_reviews > 0;
    const hasRecentReviews = recentReviews.length > 0;
    const canUserReview = user && canReview && !userPendingReview;

    // Если нет отзывов и пользователь не может оставить отзыв - скрываем секцию полностью
    // if (!hasReviews && !canUserReview) {
    //     return null;
    // }

    // Функция для открытия модалки с отзывом
    const openReviewModal = () => {
        // Здесь будет логика открытия модалки с формой
        console.log('Open review modal for product:', productId);
    };

    // Функция для оценки "помогло/не помогло"
    const handleHelpfulClick = (reviewId: number, isHelpful: boolean) => {
        // Логика отправки оценки
        console.log(`Review ${reviewId} marked as ${isHelpful ? 'helpful' : 'not helpful'}`);
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
                                {average_rating.toFixed(1)}
                            </span>
                            <div className="d-flex">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className={`fs14 ${
                                            i < Math.floor(average_rating)
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
                            {total_reviews} отзывов
                        </span>
                    </>
                )}
            </div>
            
            <div className="d-flex aline-items-center gap-8">
                {canUserReview && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
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

    // Если секция свернута, показываем только компактный заголовок
    if (!isSectionExpanded) {
        return (
            <section className="product-reviews-section">
                <CompactHeader />
            </section>
        );
    }

    // Полная развернутая версия
    return (
        <section className="product-reviews-section">
            <CompactHeader />
            
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
                            <div>✅ {reviewsStats.verified_reviews} проверенных отзывов</div>
                            <div>📷 {reviewsStats.reviews_with_media} с фото/видео</div>
                            <div>💬 {recentReviews.length} недавних отзывов</div>
                        </div>
                    </div>
                )}

                {/* Список отзывов или пустое состояние */}
                <div className="space-y-6">
                    {!hasRecentReviews && !hasReviews ? (
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
                            {recentReviews.slice(0, showAllReviews ? recentReviews.length : 3).map((review) => (
                                <ReviewCard 
                                    key={review.id}
                                    review={review}
                                    onHelpfulClick={handleHelpfulClick}
                                />
                            ))}
                            
                            {/* Кнопка "Показать все" */}
                            {recentReviews.length > 3 && !showAllReviews && (
                                <div className="text-align-center mt-6">
                                    <button
                                        onClick={() => setShowAllReviews(true)}
                                        className="text-blue-600 hover-text-blue-800 font-medium"
                                    >
                                        Показать все {recentReviews.length} отзывов
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

// Компонент карточки отзыва
const ReviewCard: React.FC<{
    review: ProductReview;
    onHelpfulClick: (reviewId: number, isHelpful: boolean) => void;
}> = ({ review, onHelpfulClick }) => {
    const [showFullComment, setShowFullComment] = useState(false);
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
                        <div className="font-medium">{review.user.name}</div>
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
                        <div key={media.id} className="review-card__media-item">
                            {media.type === 'image' ? (
                                <img 
                                    src={`/storage/${media.file_path}`}
                                    alt="Фото отзыва"
                                    className="review-card__media-image"
                                />
                            ) : (
                                <video 
                                    src={`/storage/${media.file_path}`}
                                    className="review-card__media-video"
                                    poster={media.thumbnail_url}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Кнопка "Помогло" */}
            <div className="review-card__footer">
                <button
                    onClick={() => onHelpfulClick(review.id, !review.is_helpful)}
                    className={`review-card__helpful-btn ${
                        review.is_helpful 
                            ? 'review-card__helpful-btn--active' 
                            : ''
                    }`}
                >
                    <span>👍</span>
                    <span>Помогло ({review.helpful_count})</span>
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