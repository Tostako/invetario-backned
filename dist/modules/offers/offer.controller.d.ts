import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
export declare const listOffers: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getOffer: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createOffer: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateOffer: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteOffer: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=offer.controller.d.ts.map