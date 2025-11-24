// resources/js/Types/reviews.ts

export type TSelectedMedia = IReviewMedia | null;

export interface IReviewUser {
    id: number;
    name: string;
    avatar?: string;
}

export interface IReviewMedia {
    id: number;
    file_path: string;
    type: 'image' | 'video';
    thumbnail_url?: string;
}

export interface IReviewResponse {
    id: number;
    response_text: string;
    responded_by: IReviewUser;
    responded_at: string;
}

export interface IProductReview {
    id: number;
    user: IReviewUser;
    rating: number;
    advantages: string;
    disadvantages?: string;
    comment: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    purchase_date: string;
    is_verified: boolean;
    media: IReviewMedia[];
    helpful_count: number;
    response?: IReviewResponse;
    is_helpful?: boolean;
}

export interface ReviewStats {
    average_rating: number;
    total_reviews: number;
    rating_distribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
    verified_reviews: number;
    reviews_with_media: number;
}