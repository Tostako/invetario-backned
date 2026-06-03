import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
export declare const listCategories: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getCategory: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createCategory: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateCategory: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteCategory: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const subirImagenCategoria: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=category.controller.d.ts.map