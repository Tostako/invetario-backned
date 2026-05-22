import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
export declare const obtenerTienda: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const actualizarTienda: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const subirLogoTienda: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const eliminarTienda: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=shop.controller.d.ts.map