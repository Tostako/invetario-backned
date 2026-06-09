import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
export declare const crearPlanPago: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listarPlanesPago: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const actualizarPlanPago: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const eliminarPlanPago: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const marcarPlanPagoDefault: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=payment-plan.controller.d.ts.map