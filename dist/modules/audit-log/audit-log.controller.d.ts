import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
export declare const listAuditLogs: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAuditLog: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=audit-log.controller.d.ts.map