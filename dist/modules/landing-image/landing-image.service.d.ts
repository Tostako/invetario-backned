import { PaginationMeta } from '../../shared/types';
import { CreateLandingImageDto, UpdateLandingImageDto, LandingImageFilter, LandingImage, PublicLandingImage } from './landing-image.types';
export declare const listLandingImagesService: (shopId: string, filter: LandingImageFilter) => Promise<{
    images: LandingImage[];
    meta: PaginationMeta;
}>;
export declare const getLandingImageService: (shopId: string, imageId: string) => Promise<LandingImage>;
export declare const listPublicLandingImagesService: (shopId: string) => Promise<PublicLandingImage[]>;
export declare const createLandingImageService: (shopId: string, dto: CreateLandingImageDto, uploadedBy?: string) => Promise<LandingImage>;
export declare const updateLandingImageService: (shopId: string, imageId: string, dto: UpdateLandingImageDto, uploadedBy?: string) => Promise<LandingImage>;
export declare const deleteLandingImageService: (shopId: string, imageId: string) => Promise<void>;
//# sourceMappingURL=landing-image.service.d.ts.map