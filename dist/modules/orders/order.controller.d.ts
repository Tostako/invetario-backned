import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
export declare const crearPedido: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listarPedidos: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listarMisPedidos: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const obtenerPedido: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const actualizarEstado: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=order.controller.d.ts.map