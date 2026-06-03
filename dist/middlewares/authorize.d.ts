import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../shared/types';
export declare const authorize: (...allowedRoles: UserRole[]) => (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=authorize.d.ts.map