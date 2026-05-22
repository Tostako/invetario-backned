import { Response } from 'express';
import { PaginationMeta } from '../types';
export declare const sendSuccess: <T>(res: Response, data: T, statusCode?: number, meta?: PaginationMeta) => void;
export declare const sendCreated: <T>(res: Response, data: T) => void;
export declare const sendError: (res: Response, message: string, statusCode?: number) => void;
//# sourceMappingURL=response.d.ts.map