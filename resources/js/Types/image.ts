// resources/js/Types/image.ts

export interface IImage {
  id: number;
  product_id: number;
  img_link: string;
  img_main: boolean;
  img_showcase: boolean;
  img_promo: boolean;
  img_orient_id : number;
  author_id: number;
  created_at: string;
  updated_at?: string;
}

export interface IImageUploadData {
  files: File[];
  mainImageIndex: number;
  showcaseImages: number[];
  promoImages: number[];
  orientations: Record<number, number>; // fileIndex -> orientationId
}

export interface IImageUploadResponse {
  success: boolean;
  message: string;
  images: IImage[];
}