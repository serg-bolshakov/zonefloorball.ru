// resources/js/Types/prodcard.ts
import { ICategoryItemFromDB, IBrandItemFromDB, ISizeItemFromDB, IProductItemFromDB,
        IPropertyItemFromDB, IImageItemFromDB, IImgOrientItemFromDB, IPriceItemFromDB
 } from "./types";

export interface IProductCardGeneralProps extends IProductItemFromDB {
    actualPrice: IPriceItemFromDB;
    regularPrice: IPriceItemFromDB;
    category: ICategoryItemFromDB;
    brand: IBrandItemFromDB;
    size: ISizeItemFromDB;
    properties: IPropertyItemFromDB; 
    productMainImage: IImageItemFromDB;
    productCardImgOrients: IImgOrientItemFromDB;
    productShowCaseImage: IImageItemFromDB;
}
 
export interface IProductCardResponse {
    title: string;
    robots: string;
    description: string;
    keywords: string;
    prodInfo: IProductCardGeneralProps;
}