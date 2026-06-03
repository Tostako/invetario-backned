import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
export declare const verCarrito: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const agregarItem: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const actualizarItem: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const eliminarItem: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=cart.controller.d.ts.map