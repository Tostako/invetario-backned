import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
export declare const listQuotes: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getQuote: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createQuote: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateQuote: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteQuote: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=quote.controller.d.ts.map