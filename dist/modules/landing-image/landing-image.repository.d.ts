import { CreateLandingImageDto, UpdateLandingImageDto, LandingImageFilter, LandingImage, PublicLandingImage } from './landing-image.types';
interface FindAllResult {
    rows: LandingImage[];
    total: number;
}
export declare const findAllLandingImages: (shopId: string, filter: LandingImageFilter) => Promise<FindAllResult>;
export declare const findLandingImageById: (shopId: string, imageId: string) => Promise<LandingImage | null>;
export declare const findPublicLandingImages: (shopId: string) => Promise<PublicLandingImage[]>;
export declare const createLandingImage: (shopId: string, dto: CreateLandingImageDto, uploadedBy?: string) => Promise<LandingImage>;
export declare const updateLandingImage: (shopId: string, imageId: string, dto: UpdateLandingImageDto, uploadedBy?: string) => Promise<LandingImage | null>;
export declare const softDeleteLandingImage: (shopId: string, imageId: string) => Promise<boolean>;
export {};
//# sourceMappingURL=landing-image.repository.d.ts.map