// resources/js/Utils/getReviewsStatsFromReport.ts
import { IProductReportFromDB, IProductReviewsStats } from "@/Types/types";

// Хелпер для работы с данными отзывов
export const getReviewsStatsFromReport = (report: IProductReportFromDB): IProductReviewsStats => {
    return {
        average_rating: report.average_rating ?? 0,
        rating_distribution: {
            5: report.rating_5 ?? 0,
            4: report.rating_4 ?? 0,
            3: report.rating_3 ?? 0,
            2: report.rating_2 ?? 0,
            1: report.rating_1 ?? 0,
        },
        total_reviews: report.total_reviews ?? 0,
        approved_reviews: report.approved_reviews ?? 0,
        reviews_with_media: report.reviews_with_media ?? 0,
        verified_reviews: report.verified_reviews ?? 0,
        last_review_date: report.last_review_date ?? null,
    };
};