import { Request } from 'express';
export type UserRole = 'owner' | 'admin' | 'staff' | 'customer' | 'superadmin';
declare global {
    namespace Express {
        interface Request {
            user: {
                id: string;
                shop_id: string;
                email: string;
                role: UserRole;
                customer_id?: string;
                /** Presente en JWT de empleados tras login; usado para revocar sesiones. */
                jti?: string;
            };
        }
    }
}
export type AuthenticatedRequest = Request;
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    meta?: PaginationMeta;
}
export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface PaginationParams {
    page: number;
    limit: number;
}
//# sourceMappingURL=index.d.ts.map