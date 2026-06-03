import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../shared/types';
/** Solo empleados de tienda (owner, admin, staff). Excluye customer y superadmin. */
export declare const requireShopStaff: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=requireShopStaff.d.ts.map