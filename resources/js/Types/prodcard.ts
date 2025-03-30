// resources/js/Types/prodcard.ts
import { ICategoryItemFromDB, IBrandItemFromDB, ISizeItemFromDB, IProductItemFromDB,
        IPropertyItemFromDB, IImageItemFromDB, IImgOrientItemFromDB, IPriceItemFromDB
 } from "./types";

// Интерфейс для первого уровня: объект со строковыми ключами "id", "article", ... ,
// а также объекты, где каждое значение — это объект со строковыми ключами (второй уровень).

export interface IProductCardGeneralProps extends IProductItemFromDB {
    actualPrice: IPriceItemFromDB,
    regularPrice: IPriceItemFromDB,
    category: ICategoryItemFromDB,
    brand: IBrandItemFromDB,
    size: ISizeItemFromDB,
    properties: IPropertyItemFromDB, 
    productMainImage: IImageItemFromDB[],
    productCardImgOrients: IImgOrientItemFromDB,
    productShowCaseImage: IImageItemFromDB,
}
 