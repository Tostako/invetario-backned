import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
export declare const loginSuperAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const bootstrapSuperAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const registrarSuperAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listarTiendas: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const obtenerTienda: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const crearTienda: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const actualizarTienda: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const eliminarTienda: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=superadmin.controller.d.ts.map