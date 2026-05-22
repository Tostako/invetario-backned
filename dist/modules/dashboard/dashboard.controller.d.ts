import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
export declare const obtenerResumen: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const obtenerIngresosMes: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const obtenerPedidosMes: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const obtenerVentasSemana: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const obtenerEstadoPedidos: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const obtenerProductosTop: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=dashboard.controller.d.ts.map