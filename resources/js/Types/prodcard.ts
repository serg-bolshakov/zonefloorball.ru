// resources/js/Types/prodcard.ts
import { ICategoryItemFromDB, IBrandItemFromDB, ISizeItemFromDB, IProductItemFromDB,IProductUnitFromDB,
        IPropertyItemFromDB, IImageItemFromDB, IImgOrientItemFromDB, IPriceItemFromDB, IProductReportFromDB
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
    productReport: IProductReportFromDB;
    productUnit: IProductUnitFromDB;
    productPromoImages: IImageItemFromDB[];
}

export interface IProductCardResponse {
    title: string;
    robots: string;
    description: string;
    keywords: string;
    prodInfo: IProductCardGeneralProps;
    propVariants: IPropVariants;
}

export interface IPropVariants {
    propHook?: string;
    resultpossibleHookForProductCard?: IPropsVariantsSecondLevel;
    possibleShaftLengthForProductCard?: IPropsVariantsSecondLevel[];
    resultotherColourBladeForCard?: IPropsVariantsSecondLevel[];
}

export interface IPropsVariantsSecondLevel {
    id: number;
    category_id?: number;
    model?: string | null;
    marka?: string | null;
    colour?: string | null;
    prod_url_semantic: string;
    prop_title?: string;
    prop_value?: string | number;
    prop_value_view?: string;
    size_title?: string;
    size_value?: string | number;
    classCurrent?: string;
    img_main?: boolean | null;
    img_link?: string | null;
}