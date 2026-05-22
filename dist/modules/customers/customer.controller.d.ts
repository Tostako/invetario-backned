import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
export declare const listarClientes: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const obtenerCliente: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const crearCliente: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const actualizarCliente: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const eliminarCliente: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=customer.controller.d.ts.map