import { Request } from 'express';
import { PaginationParams } from '../types';
export declare const parsePagination: (req: Request) => PaginationParams;
export declare const calcOffset: ({ page, limit }: PaginationParams) => number;
//# sourceMappingURL=pagination.d.ts.map