import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
export declare const listSiteConfigs: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getSiteConfig: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createSiteConfig: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateSiteConfig: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteSiteConfig: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listPublicSiteConfigs: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=site-config.controller.d.ts.map