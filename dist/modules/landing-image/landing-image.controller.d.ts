import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
export declare const listLandingImages: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getLandingImage: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createLandingImage: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateLandingImage: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteLandingImage: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listPublicLandingImages: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=landing-image.controller.d.ts.map