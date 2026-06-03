import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
export declare const registrarPago: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listarPagos: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const obtenerPago: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const obtenerPagoPorOrden: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const actualizarPago: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=payment.controller.d.ts.map