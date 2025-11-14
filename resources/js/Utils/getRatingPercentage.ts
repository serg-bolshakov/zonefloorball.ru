// resources/js/Utils/getRatingPercentage.ts
import { IProductReportFromDB } from "@/Types/types";

// Утилита для расчета процентов рейтинга
export const getRatingPercentage = (rating: number, report: IProductReportFromDB): number => {
    const total = report.approved_reviews ?? 0;
    if (total === 0) return 0;
    
    const ratingCount = report[`rating_${rating}` as keyof IProductReportFromDB] as number ?? 0;
    return Math.round((ratingCount / total) * 100);
};