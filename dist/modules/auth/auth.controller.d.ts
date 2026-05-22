import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const selectShop: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const registerShop: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const loginCustomer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const registerCustomer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserShops: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const switchShop: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createAdditionalShop: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map