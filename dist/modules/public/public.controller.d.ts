import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
export declare const listPublicProducts: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getPublicProduct: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listPublicCategories: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listPublicOffers: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=public.controller.d.ts.map