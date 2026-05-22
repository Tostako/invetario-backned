import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
export declare const listProducts: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getProduct: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createProduct: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProduct: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteProduct: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const adjustStock: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=product.controller.d.ts.map